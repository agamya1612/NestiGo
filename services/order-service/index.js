const express = require('express');
const { query, pool } = require('../shared/db');
const { connectProducer, publishEvent, createConsumer } = require('../shared/kafka');

const app = express();
app.use(express.json());

app.post('/api/orders', async (req, res) => {
  const { items, address } = req.body;
  const customer_id = req.headers['x-user-id']; // Injected by API Gateway
  
  if (!customer_id || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Calculate total amount and validate items
  let amount_total = 0;
  const validatedItems = [];
  let requires_prescription = false;
  
  for (const item of items) {
     const dbItem = await query(`SELECT price, requires_prescription FROM catalog_items WHERE id = $1`, [item.id]);
     if (dbItem.rows.length === 0) {
        return res.status(400).json({ error: `Item with id ${item.id} not found` });
     }
     if (dbItem.rows[0].requires_prescription) {
         requires_prescription = true;
     }
     const unit_price = Number(dbItem.rows[0].price);
     amount_total += unit_price * item.quantity;
     validatedItems.push({ ...item, unit_price });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 2. Persist Order to Database
    const prescription_status = requires_prescription ? 'pending' : 'n/a';
    const result = await client.query(
      `INSERT INTO orders (customer_id, order_type, address, amount_total, status, prescription_status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, status, amount_total, created_at, prescription_status`,
      [customer_id, 'service', JSON.stringify(address), amount_total, 'pending_payment', prescription_status]
    );

    const order = result.rows[0];

    // 3. Persist Order Items
    for (const item of validatedItems) {
       await client.query(
         `INSERT INTO order_items (order_id, catalog_item_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
         [order.id, item.id, item.quantity, item.unit_price]
       );
    }

    await client.query('COMMIT');

    // 4. Publish Event to Kafka
    await publishEvent('orders', 'order.placed', {
      order_id: order.id,
      customer_id,
      amount_total,
      timestamp: order.created_at
    });

    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

app.get('/api/orders', async (req, res) => {
  const user_id = req.headers['x-user-id'];
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  // Extremely basic auth check for admin vs worker vs customer
  // In a real app we would check `admin_roles` table
  const client = await pool.connect();
  try {
    const isWorker = await client.query('SELECT id FROM provider_profiles WHERE user_id = $1', [user_id]);
    
    if (isWorker.rows.length > 0) {
       // Return worker's assigned orders
       const orders = await client.query(`
         SELECT o.* FROM orders o 
         JOIN provider_assignments pa ON o.id = pa.order_id 
         WHERE pa.provider_id = $1
       `, [isWorker.rows[0].id]);
       return res.json({ orders: orders.rows });
    }

    // Customer's orders
    const orders = await client.query('SELECT * FROM orders WHERE customer_id = $1', [user_id]);
    res.json({ orders: orders.rows });
  } catch(err) {
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updateRes = await client.query(
       `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2 RETURNING customer_id, amount_total`,
       [status, id]
    );
    if (updateRes.rows.length > 0) {
       await client.query(`INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)`, [id, status]);
       
       if (status === 'completed') {
          await publishEvent('orders', 'order.completed', {
            order_id: id,
            customer_id: updateRes.rows[0].customer_id,
            amount_total: updateRes.rows[0].amount_total
          });
       }
    }
    await client.query('COMMIT');
    res.json({ message: 'Order status updated' });
  } catch(err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
});

app.post('/api/orders/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const user_id = req.headers['x-user-id'];
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const checkRes = await client.query(`SELECT status, customer_id FROM orders WHERE id = $1`, [id]);
    if (checkRes.rows.length === 0 || checkRes.rows[0].customer_id !== user_id) {
       await client.query('ROLLBACK');
       return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (['completed', 'cancelled', 'refunded'].includes(checkRes.rows[0].status)) {
       await client.query('ROLLBACK');
       return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    await client.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [id]);
    await client.query(`INSERT INTO order_status_history (order_id, status) VALUES ($1, 'cancelled')`, [id]);
    
    await client.query('COMMIT');
    
    await publishEvent('payments', 'payment.refund.requested', {
      order_id: id,
      reason: 'Customer cancelled'
    });
    
    res.json({ message: 'Order cancelled, refund requested' });
  } catch(err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal error' });
  } finally {
    client.release();
  }
});

const startServer = async () => {
  try {
    await connectProducer();
    console.log('[Order Service] Connected to Kafka Producer');
    
    await createConsumer('order-service-saga-group', ['provider.assignments', 'payments'], async (eventType, payload) => {
      if (eventType === 'provider.assignment.failed') {
         const { order_id, reason } = payload;
         console.log(`[Order Service] Order ${order_id} dispatch failed (${reason}). Initiating Saga Rollback...`);
         
         const client = await pool.connect();
         try {
           await client.query('BEGIN');
           await client.query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [order_id]);
           await client.query(
             `INSERT INTO order_status_history (order_id, status) VALUES ($1, 'cancelled')`,
             [order_id]
           );
           await client.query('COMMIT');
           
           console.log(`[Order Service] Order ${order_id} cancelled. Requesting refund...`);
           
           // Compensating transaction
           await publishEvent('payments', 'payment.refund.requested', {
             order_id,
             reason
           });
         } catch (err) {
           await client.query('ROLLBACK');
           console.error('[Order Service] Rollback failure:', err);
         } finally {
           client.release();
         }
      } else if (eventType === 'payment.refunded') {
         const { order_id } = payload;
         console.log(`[Order Service] Refund processed for Order ${order_id}. Completing Rollback.`);
         
         const client = await pool.connect();
         try {
           await client.query('BEGIN');
           await client.query(`UPDATE orders SET status = 'refunded' WHERE id = $1`, [order_id]);
           await client.query(
             `INSERT INTO order_status_history (order_id, status) VALUES ($1, 'refunded')`,
             [order_id]
           );
           await client.query('COMMIT');
         } catch (err) {
           await client.query('ROLLBACK');
           console.error('[Order Service] Failed to mark order refunded:', err);
         } finally {
           client.release();
         }
      }
    });

    app.listen(3001, () => {
      console.log('[Order Service] Listening on port 3001');
    });
  } catch (err) {
    console.error('Failed to start Order Service:', err);
  }
};

startServer();

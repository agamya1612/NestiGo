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
  
  for (const item of items) {
     const dbItem = await query(`SELECT price FROM catalog_items WHERE id = $1`, [item.id]);
     if (dbItem.rows.length === 0) {
        return res.status(400).json({ error: `Item with id ${item.id} not found` });
     }
     const unit_price = Number(dbItem.rows[0].price);
     amount_total += unit_price * item.quantity;
     validatedItems.push({ ...item, unit_price });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 2. Persist Order to Database
    const result = await client.query(
      `INSERT INTO orders (customer_id, order_type, address, amount_total, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, status, amount_total, created_at`,
      [customer_id, 'service', JSON.stringify(address), amount_total, 'pending_payment']
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

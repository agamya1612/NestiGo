const express = require('express');
const { query, pool } = require('../shared/db');
const { connectProducer, publishEvent, createConsumer } = require('../shared/kafka');

const app = express();
app.use(express.json());

app.post('/api/payments/webhook', async (req, res) => {
  const body = req.body;
  const eventType = body.event;
  
  if (eventType === 'payment.captured') {
    const payment = body.payload.payment.entity;
    const order_id = payment.notes?.order_id;

    if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

    try {
      const result = await query(`UPDATE orders SET status = 'paid' WHERE id = $1 AND status = 'pending_payment'`, [order_id]);
      if (result.rowCount === 0) return res.status(200).json({ status: 'ignored' });

      await publishEvent('payments', 'payment.captured', { payment_id: payment.id, order_id, amount: payment.amount / 100, currency: payment.currency });
      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      return res.status(500).json({ error: 'Internal error' });
    }
  }
  res.status(200).json({ status: 'ignored' });
});

app.get('/api/payments/refunds', async (req, res) => {
  const result = await query('SELECT * FROM refunds ORDER BY created_at DESC');
  res.json({ refunds: result.rows });
});

app.post('/api/payments/refunds/:id/retry', async (req, res) => {
  const { id } = req.params;
  const result = await query(`SELECT * FROM refunds WHERE id = $1 AND status = 'failed'`, [id]);
  if (result.rows.length === 0) return res.status(400).json({ error: 'Refund not found or not in failed state' });
  
  const refund = result.rows[0];
  try {
    // Simulate Razorpay Refund Call
    await query(`UPDATE refunds SET status = 'completed' WHERE id = $1`, [id]);
    await publishEvent('payments', 'payment.refunded', { order_id: refund.order_id, amount: refund.amount });
    res.json({ message: 'Refund retried successfully' });
  } catch(err) {
    res.status(500).json({ error: 'Retry failed' });
  }
});

const startServer = async () => {
  try {
    await connectProducer();
    console.log('[Payment Service] Connected to Kafka Producer');
    
    await createConsumer('payment-service-saga-group', ['payments', 'orders'], async (eventType, payload) => {
      const client = await pool.connect();
      try {
        if (eventType === 'payment.refund.requested') {
           const { order_id, reason } = payload;
           console.log(`[Payment Service] Refund requested for Order ${order_id}`);
           
           await client.query('BEGIN');
           const orderRes = await client.query('SELECT amount_total, customer_id FROM orders WHERE id = $1', [order_id]);
           if (orderRes.rows.length > 0) {
              const amount = orderRes.rows[0].amount_total;
              const customer_id = orderRes.rows[0].customer_id;
              
              // Simulate potential gateway failure
              const gatewaySuccess = Math.random() > 0.2; // 80% success
              const status = gatewaySuccess ? 'completed' : 'failed';
              
              await client.query(
                `INSERT INTO refunds (order_id, amount, reason, status) VALUES ($1, $2, $3, $4)`,
                [order_id, amount, reason, status]
              );
              
              if (gatewaySuccess) {
                 await publishEvent('payments', 'payment.refunded', { order_id, amount, customer_id });
                 console.log(`[Payment Service] Refund succeeded for ${order_id}`);
              } else {
                 console.error(`[Payment Service] Gateway error for refund ${order_id}. Marked as failed.`);
              }
           }
           await client.query('COMMIT');
        } else if (eventType === 'order.completed') {
           // Create Settlement
           const { order_id, amount_total } = payload;
           await client.query('BEGIN');
           
           const assignRes = await client.query('SELECT provider_id FROM provider_assignments WHERE order_id = $1', [order_id]);
           if (assignRes.rows.length > 0) {
              const provider_id = assignRes.rows[0].provider_id;
              const commission = amount_total * 0.80; // Worker gets 80%
              
              await client.query(
                `INSERT INTO settlements (order_id, provider_id, amount, status) VALUES ($1, $2, $3, 'processed')`,
                [order_id, provider_id, commission]
              );
              
              await publishEvent('payments', 'settlement.processed', { order_id, provider_id, amount: commission });
              console.log(`[Payment Service] Settlement generated for provider ${provider_id} on order ${order_id}`);
           }
           await client.query('COMMIT');
        }
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Payment Service] Consumer Error:', err);
      } finally {
        client.release();
      }
    });

    app.listen(3002, () => {
      console.log('[Payment Service] Listening on port 3002');
    });
  } catch (err) {
    console.error('Failed to start Payment Service:', err);
  }
};

startServer();

const express = require('express');
const { query } = require('../shared/db');
const { connectProducer, publishEvent, createConsumer } = require('../shared/kafka');

const app = express();
app.use(express.json());

app.post('/api/payments/webhook', async (req, res) => {
  // In a real system, verify the webhook signature. For this test, we accept it directly.
  const body = req.body;
  const eventType = body.event;
  
  if (eventType === 'payment.captured') {
    const payment = body.payload.payment.entity;
    const order_id = payment.notes?.order_id;

    if (!order_id) {
      return res.status(400).json({ error: 'Missing order_id in notes' });
    }

    try {
      // 2. Update DB (Idempotency check: only update if pending_payment)
      const result = await query(
        `UPDATE orders SET status = 'paid' WHERE id = $1 AND status = 'pending_payment'`, 
        [order_id]
      );

      if (result.rowCount === 0) {
        console.warn(`[Payment Service] Ignored webhook: Order ${order_id} not found or already paid`);
        return res.status(200).json({ status: 'ignored_or_already_paid' });
      }

      // 3. Publish Event to Kafka
      await publishEvent('payments', 'payment.captured', {
        payment_id: payment.id,
        order_id: order_id,
        amount: payment.amount / 100,
        currency: payment.currency
      });

      console.log(`[Payment Service] Processed payment for order ${order_id}`);
      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('Failed to process payment webhook:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  res.status(200).json({ status: 'ignored' });
});

const startServer = async () => {
  try {
    await connectProducer();
    console.log('[Payment Service] Connected to Kafka Producer');
    
    await createConsumer('payment-service-saga-group', ['payments'], async (eventType, payload) => {
      if (eventType === 'payment.refund.requested') {
         const { order_id, reason } = payload;
         console.log(`[Payment Service] Received refund request for Order ${order_id} due to: ${reason}`);
         
         // In a real system, we would call Razorpay refund API here
         // const razorpayRefund = await razorpay.refunds.create({ payment_id, amount });
         console.log(`[Payment Service] Simulating Razorpay Refund for Order ${order_id}...`);
         
         try {
           await query(
             `INSERT INTO payment_events (order_id, event_type, payload) VALUES ($1, $2, $3)`,
             [order_id, 'payment.refunded', JSON.stringify({ reason })]
           );
           
           console.log(`[Payment Service] Refund successful for Order ${order_id}. Emitting event.`);
           await publishEvent('payments', 'payment.refunded', {
             order_id,
             status: 'success'
           });
         } catch (err) {
           console.error(`[Payment Service] Failed to process refund for Order ${order_id}:`, err);
         }
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

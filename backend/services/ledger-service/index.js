const express = require('express');
const { pool } = require('../shared/db');
const { connectProducer, createConsumer } = require('../shared/kafka');

const app = express();
app.use(express.json());

app.get('/api/ledger/wallet', async (req, res) => {
  const user_id = req.headers['x-user-id'];
  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT balance, currency FROM wallets WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ wallet: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

const startServer = async () => {
  try {
    await connectProducer();
    console.log('[Ledger Service] Connected to Kafka Producer');
    
    await createConsumer('ledger-service-group', ['orders', 'payments'], async (eventType, payload) => {
      // Handle wallet deductions, refunds, settlements
      const client = await pool.connect();
      try {
        if (eventType === 'payment.refunded') {
           const { order_id, amount, customer_id } = payload;
           await client.query('BEGIN');
           
           // Credit customer wallet for refund
           const walletRes = await client.query(`UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE user_id = $2 RETURNING id`, [amount, customer_id]);
           if (walletRes.rows.length > 0) {
             await client.query(`INSERT INTO ledger_transactions (wallet_id, amount, reference_type, reference_id) VALUES ($1, $2, 'refund', $3)`, [walletRes.rows[0].id, amount, order_id]);
           }
           
           await client.query('COMMIT');
        } else if (eventType === 'settlement.processed') {
           // Credit provider wallet
           const { order_id, amount, provider_id } = payload;
           await client.query('BEGIN');
           
           const walletRes = await client.query(`UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE user_id = (SELECT user_id FROM provider_profiles WHERE id = $2) RETURNING id`, [amount, provider_id]);
           if (walletRes.rows.length > 0) {
             await client.query(`INSERT INTO ledger_transactions (wallet_id, amount, reference_type, reference_id) VALUES ($1, $2, 'settlement', $3)`, [walletRes.rows[0].id, amount, order_id]);
           }
           
           await client.query('COMMIT');
        }
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('[Ledger Service] Transaction failed:', err);
      } finally {
        client.release();
      }
    });

    app.listen(3006, () => {
      console.log('[Ledger Service] Listening on port 3006');
    });
  } catch (err) {
    console.error('Failed to start Ledger Service:', err);
  }
};

startServer();

const express = require('express');
const { pool } = require('../shared/db');

const app = express();
app.use(express.json());

app.post('/api/reviews', async (req, res) => {
  const customer_id = req.headers['x-user-id'];
  const { order_id, provider_id, rating, comment } = req.body;

  if (!customer_id) return res.status(401).json({ error: 'Unauthorized' });
  if (!order_id || !provider_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Missing or invalid fields' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Insert review
    await client.query(
      `INSERT INTO reviews (order_id, customer_id, provider_id, rating, comment) VALUES ($1, $2, $3, $4, $5)`,
      [order_id, customer_id, provider_id, rating, comment]
    );

    // 2. Calculate new average rating for provider
    const avgRes = await client.query(
      `SELECT AVG(rating) as avg_rating FROM reviews WHERE provider_id = $1`,
      [provider_id]
    );
    const new_rating = avgRes.rows[0].avg_rating;

    // 3. Update provider profile
    await client.query(
      `UPDATE provider_profiles SET rating = $1 WHERE id = $2`,
      [new_rating, provider_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Review submitted', new_rating });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Review Service] Error submitting review:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

app.listen(3010, () => {
  console.log('[Review Service] Listening on port 3010');
});

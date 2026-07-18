const express = require('express');
const { pool } = require('../shared/db');

const app = express();
app.use(express.json());

app.post('/api/pricing/calculate', async (req, res) => {
  const { items, coupon_code } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Missing items' });
  }

  const client = await pool.connect();
  try {
    let base_total = 0;
    
    // Calculate base total from DB to prevent client spoofing
    for (const item of items) {
       const dbItem = await client.query(`SELECT price FROM catalog_items WHERE id = $1`, [item.id]);
       if (dbItem.rows.length === 0) continue;
       base_total += Number(dbItem.rows[0].price) * item.quantity;
    }

    let discount = 0;
    
    // Apply coupon if provided
    if (coupon_code) {
       const promo = await client.query(`SELECT discount_percentage, max_discount_amount FROM promotions WHERE code = $1 AND active = true`, [coupon_code]);
       if (promo.rows.length > 0) {
          const { discount_percentage, max_discount_amount } = promo.rows[0];
          let calculated_discount = (base_total * Number(discount_percentage)) / 100;
          if (max_discount_amount && calculated_discount > Number(max_discount_amount)) {
             calculated_discount = Number(max_discount_amount);
          }
          discount = calculated_discount;
       }
    }

    // Apply Surge Pricing (Mock logic: 1.5x if after 6 PM)
    const hour = new Date().getHours();
    const surge_multiplier = (hour >= 18 && hour <= 22) ? 1.5 : 1.0;

    const final_total = (base_total - discount) * surge_multiplier;

    res.json({
       base_total,
       discount,
       surge_multiplier,
       final_total: Math.max(final_total, 0)
    });

  } catch (err) {
    console.error('[Pricing Service] Error calculating price:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

app.listen(3007, () => {
  console.log('[Pricing Service] Listening on port 3007');
});

const express = require('express');
const { query } = require('../shared/db');

const app = express();
app.use(express.json());

app.get('/api/catalog/:vertical', async (req, res) => {
  const { vertical } = req.params;
  
  try {
    const result = await query(
      `SELECT ci.* FROM catalog_items ci JOIN categories c ON ci.category_id = c.id WHERE c.vertical_type = $1 AND ci.active = true`,
      [vertical]
    );
    res.json({ vertical, items: result.rows });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/inventory/:catalogItemId', async (req, res) => {
  const { catalogItemId } = req.params;
  try {
    const result = await query(
      `SELECT * FROM inventory WHERE catalog_item_id = $1`,
      [catalogItemId]
    );
    res.json({ inventory: result.rows });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/inventory/deduct', async (req, res) => {
  const { catalogItemId, locationId, quantity } = req.body;
  try {
    const result = await query(
      `UPDATE inventory SET stock_qty = stock_qty - $1, updated_at = now()
       WHERE catalog_item_id = $2 AND location_id = $3 AND stock_qty >= $1
       RETURNING *`,
      [quantity, catalogItemId, locationId]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Insufficient stock or item not found' });
    }
    res.json({ success: true, inventory: result.rows[0] });
  } catch (error) {
    console.error('Error deducting inventory:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const startServer = () => {
  app.listen(3003, () => {
    console.log('[Catalog Service] Listening on port 3003');
  });
};

startServer();

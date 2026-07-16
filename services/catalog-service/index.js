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

const startServer = () => {
  app.listen(3003, () => {
    console.log('[Catalog Service] Listening on port 3003');
  });
};

startServer();

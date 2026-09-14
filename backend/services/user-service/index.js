const express = require('express');
const { query } = require('../shared/db');

const app = express();
app.use(express.json());

app.post('/api/users/kyc', async (req, res) => {
  const { provider_id, kyc_data } = req.body;
  
  if (!provider_id || !kyc_data) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await query(
      `UPDATE provider_profiles SET kyc_status = 'pending' WHERE user_id = $1 RETURNING *`,
      [provider_id]
    );
    
    res.json({ message: 'KYC submitted successfully', profile: result.rows[0] });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const startServer = () => {
  app.listen(3004, () => {
    console.log('[User Service] Listening on port 3004');
  });
};

startServer();

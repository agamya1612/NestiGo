const express = require('express');
const { pool } = require('../shared/db');

const app = express();
app.use(express.json());

// Provider uploads KYC document
app.post('/api/kyc/upload', async (req, res) => {
  const user_id = req.headers['x-user-id'];
  const { document_type, document_url } = req.body;

  if (!user_id) return res.status(401).json({ error: 'Unauthorized' });
  if (!document_type || !document_url) return res.status(400).json({ error: 'Missing document details' });

  const client = await pool.connect();
  try {
    // Get Provider ID from User ID
    const providerRes = await client.query('SELECT id FROM provider_profiles WHERE user_id = $1', [user_id]);
    if (providerRes.rows.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    const provider_id = providerRes.rows[0].id;

    const result = await client.query(
      `INSERT INTO provider_kyc (provider_id, document_type, document_url) VALUES ($1, $2, $3) RETURNING id, verification_status`,
      [provider_id, document_type, document_url]
    );

    // Set provider status to pending
    await client.query(`UPDATE provider_profiles SET kyc_status = 'pending' WHERE id = $1`, [provider_id]);

    res.status(201).json({ message: 'KYC Document uploaded', document: result.rows[0] });
  } catch (err) {
    console.error('[KYC Service] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Admin verifies KYC
app.put('/api/kyc/:id/verify', async (req, res) => {
  const admin_id = req.headers['x-user-id'];
  const { id } = req.params;
  const { status } = req.body; // 'verified' or 'rejected'

  if (!admin_id) return res.status(401).json({ error: 'Unauthorized' });
  if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const docRes = await client.query(
      `UPDATE provider_kyc SET verification_status = $1, verified_by = $2, updated_at = now() WHERE id = $3 RETURNING provider_id`,
      [status, admin_id, id]
    );

    if (docRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'KYC Document not found' });
    }

    const provider_id = docRes.rows[0].provider_id;
    
    // Determine overall provider status based on this doc
    const new_status = (status === 'verified') ? 'approved' : 'rejected';
    await client.query(`UPDATE provider_profiles SET kyc_status = $1, active = $2 WHERE id = $3`, [new_status, status === 'verified', provider_id]);
    
    await client.query('COMMIT');
    res.json({ message: `KYC Document ${status}` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[KYC Service] Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

app.listen(3008, () => {
  console.log('[KYC Service] Listening on port 3008');
});

const express = require('express');
const { query } = require('../shared/db');

const app = express();
app.use(express.json());

// Middleware to check if user has admin roles
const requireAdmin = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing User ID' });
  }
  
  try {
    const roleCheck = await query(
      `SELECT role FROM admin_roles WHERE user_id = $1`,
      [userId]
    );
    if (roleCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: Requires Admin Privileges' });
    }
    req.adminRole = roleCheck.rows[0].role;
    next();
  } catch (error) {
    console.error('[Admin Service] DB Error checking roles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

app.use(requireAdmin);

// 1. View all orders across verticals
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await query(`
      SELECT o.id, o.status, o.order_type, o.amount_total, o.created_at, p.email as customer_email
      FROM orders o
      JOIN auth.users p ON o.customer_id = p.id
      ORDER BY o.created_at DESC
      LIMIT 100
    `);
    res.json({ orders: orders.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Approve/Reject Pharma Prescriptions
app.post('/api/admin/prescriptions/:orderId/verify', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // 'verified' or 'rejected'
  
  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await query(
      `UPDATE orders SET prescription_status = $1, updated_at = now() 
       WHERE id = $2 AND prescription_status = 'pending'
       RETURNING id, prescription_status`,
      [status, orderId]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Order not found or prescription not pending' });
    }
    
    // If rejected, we might want to also cancel the order here, but for MVP we just update status
    if (status === 'rejected') {
      await query(`UPDATE orders SET status = 'cancelled' WHERE id = $1`, [orderId]);
    }
    
    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error('Error verifying prescription:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Resolve Disputes
app.post('/api/admin/disputes/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { resolution_notes } = req.body;

  try {
    const result = await query(
      `UPDATE disputes SET status = 'resolved', resolution_notes = $1 
       WHERE id = $2 AND status = 'open'
       RETURNING *`,
      [resolution_notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Dispute not found or already closed' });
    }
    
    res.json({ success: true, dispute: result.rows[0] });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const startServer = () => {
  app.listen(3013, () => {
    console.log('[Admin Service] Listening on port 3013');
  });
};

startServer();

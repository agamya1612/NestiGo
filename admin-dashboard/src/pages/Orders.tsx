import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 className="page-title">Orders</h1>
      
      <div className="glass-card">
        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            No orders found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Order ID</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Type</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{order.id.slice(0,8)}...</td>
                    <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem' }}>{order.order_type}</span></td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        color: order.status === 'paid' ? 'var(--success-color)' : order.status === 'pending_payment' ? 'var(--accent-color)' : 'var(--text-primary)'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>₹{order.amount_total}</td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, ShoppingCart, Users, Layers, LogOut } from 'lucide-react';

export const AdminShell = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
      setLoading(false);
    };
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return null;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          NestiGo Admin
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={20} /> Orders
          </NavLink>
          <NavLink to="/providers" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Providers
          </NavLink>
          <NavLink to="/catalog" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Layers size={20} /> Catalog
          </NavLink>
        </nav>
        <div style={{ padding: '1rem' }}>
          <button onClick={handleLogout} className="btn" style={{ width: '100%', border: 'none', color: 'var(--danger-color)', justifyContent: 'flex-start' }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Logged in as Admin
          </div>
        </header>
        
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

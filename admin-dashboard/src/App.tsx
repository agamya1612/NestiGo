import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminShell } from './components/AdminShell';
import { Login } from './pages/Login';
import { Orders } from './pages/Orders';

// Placeholder components for the other routes
const Dashboard = () => <div><h1 className="page-title">Dashboard</h1><div className="glass-card">Welcome to NestiGo Admin. Select a module from the sidebar.</div></div>;
const Providers = () => <div><h1 className="page-title">Providers</h1><div className="glass-card">Provider KYC queue coming soon.</div></div>;
const Catalog = () => <div><h1 className="page-title">Catalog</h1><div className="glass-card">Catalog management coming soon.</div></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route path="/" element={<AdminShell />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="providers" element={<Providers />} />
          <Route path="catalog" element={<Catalog />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

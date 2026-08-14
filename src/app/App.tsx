import { useState, lazy, Suspense } from "react";
import { LoginPage } from "./components/LoginPage";

const CustomerPortal = lazy(() => import("./components/customer/CustomerPortal").then(m => ({ default: m.CustomerPortal })));
const ProviderPortal = lazy(() => import("./components/provider/ProviderPortal").then(m => ({ default: m.ProviderPortal })));
const DriverPortal = lazy(() => import("./components/driver/DriverPortal").then(m => ({ default: m.DriverPortal })));
const AdminPortal = lazy(() => import("./components/admin/AdminPortal").then(m => ({ default: m.AdminPortal })));
const SupportPortal = lazy(() => import("./components/support/SupportPortal").then(m => ({ default: m.SupportPortal })));

type Portal = "customer" | "provider" | "driver" | "admin" | "support" | null;

export default function App() {
  const [activePortal, setActivePortal] = useState<Portal>(null);

  const handleLogin = (portal: string) => {
    setActivePortal(portal as Portal);
  };

  const handleLogout = () => {
    setActivePortal(null);
  };

  if (!activePortal) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">Loading portal...</div>}>
      {activePortal === "customer" && <CustomerPortal onLogout={handleLogout} />}
      {activePortal === "provider" && <ProviderPortal onLogout={handleLogout} />}
      {activePortal === "driver" && <DriverPortal onLogout={handleLogout} />}
      {activePortal === "admin" && <AdminPortal onLogout={handleLogout} />}
      {activePortal === "support" && <SupportPortal onLogout={handleLogout} />}
    </Suspense>
  );
}

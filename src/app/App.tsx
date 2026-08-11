import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { CustomerPortal } from "./components/customer/CustomerPortal";
import { ProviderPortal } from "./components/provider/ProviderPortal";
import { DriverPortal } from "./components/driver/DriverPortal";
import { AdminPortal } from "./components/admin/AdminPortal";
import { SupportPortal } from "./components/support/SupportPortal";

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

  if (activePortal === "customer") return <CustomerPortal onLogout={handleLogout} />;
  if (activePortal === "provider") return <ProviderPortal onLogout={handleLogout} />;
  if (activePortal === "driver") return <DriverPortal onLogout={handleLogout} />;
  if (activePortal === "admin") return <AdminPortal onLogout={handleLogout} />;
  if (activePortal === "support") return <SupportPortal onLogout={handleLogout} />;

  return null;
}

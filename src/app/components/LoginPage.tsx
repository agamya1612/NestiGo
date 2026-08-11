import { useState } from "react";
import { ShoppingBag, Wrench, ShieldCheck, Eye, EyeOff, Zap } from "lucide-react";

const BRAND_GRADIENT = "linear-gradient(90deg, #38BDF8 0%, #7C3AED 35%, #D946EF 70%, #F59E0B 100%)";
const HERO_BG =
  "radial-gradient(circle at top left,#3B2C85 0%,transparent 35%), radial-gradient(circle at bottom center,#4C1D95 0%,transparent 40%), radial-gradient(circle at right,#0F766E 0%,transparent 30%), #0B1020";

const portals = [
  {
    id: "customer",
    label: "Customer",
    sub: "Shop across all verticals",
    icon: ShoppingBag,
    color: "#7C3AED",
  },
  {
    id: "provider",
    label: "Provider",
    sub: "Manage jobs & inventory",
    icon: Wrench,
    color: "#D946EF",
  },
  {
    id: "admin",
    label: "Admin",
    sub: "Command center & analytics",
    icon: ShieldCheck,
    color: "#38BDF8",
  },
];

const demoCredentials: Record<string, { email: string; password: string }> = {
  customer: { email: "priya.sharma@nestigo.com", password: "Demo@123" },
  provider: { email: "sparkle.cleaners@nestigo.com", password: "Demo@123" },
  admin: { email: "ops.admin@nestigo.com", password: "Admin@456" },
};

interface LoginPageProps {
  onLogin: (portal: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedPortal, setSelectedPortal] = useState("customer");
  const [email, setEmail] = useState(demoCredentials.customer.email);
  const [password, setPassword] = useState(demoCredentials.customer.password);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePortalSelect = (id: string) => {
    setSelectedPortal(id);
    setEmail(demoCredentials[id].email);
    setPassword(demoCredentials[id].password);
  };

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(selectedPortal);
    }, 900);
  };

  const selected = portals.find((p) => p.id === selectedPortal)!;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── LEFT HERO PANEL ── */}
      <div
        style={{
          width: "45%",
          minWidth: 340,
          background: HERO_BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem 3.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top: Logo row */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            {/* Gradient pill badge */}
            <div
              style={{
                background: BRAND_GRADIENT,
                borderRadius: 10,
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Zap size={18} color="#fff" fill="#fff" />
            </div>
            {/* NestiGo wordmark with gradient text */}
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "1.45rem",
                letterSpacing: "-0.02em",
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NestiGo
            </span>
            {/* SUPER APP badge */}
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "0.62rem",
                letterSpacing: "0.08em",
                color: "#D946EF",
                background: "rgba(217,70,239,0.12)",
                border: "1px solid rgba(217,70,239,0.3)",
                borderRadius: 999,
                padding: "2px 10px",
              }}
            >
              SUPER APP
            </span>
          </div>
        </div>

        {/* Middle: Headline + stats */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: "2.8rem",
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "#fff",
              margin: "0 0 1.5rem 0",
            }}
          >
            One Platform.
            <br />
            <span
              style={{
                background: BRAND_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Four Verticals.
            </span>
            <br />
            Zero Limits.
          </h1>

          {/* Stats grid 2×2 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 8,
            }}
          >
            {[
              { label: "1.2K+", sub: "Active orders" },
              { label: "85+", sub: "Live providers" },
              { label: "4", sub: "Verticals" },
              { label: "12", sub: "Cities" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.55rem",
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 4,
                  }}
                >
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.22)",
              margin: 0,
            }}
          >
            v1.0.0 · Enterprise Edition · 15 Microservices
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 3.5rem",
          position: "relative",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.65rem",
                color: "#111827",
                margin: "0 0 6px 0",
                letterSpacing: "-0.02em",
              }}
            >
              Sign in to portal
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.875rem",
                color: "#6B7280",
                margin: 0,
              }}
            >
              Select your role to access the right portal
            </p>
          </div>

          {/* Portal selector — 3 buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              marginBottom: 16,
            }}
          >
            {portals.map((p) => {
              const Icon = p.icon;
              const isActive = selectedPortal === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePortalSelect(p.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 4px",
                    borderRadius: 12,
                    border: isActive ? `2px solid ${p.color}` : "2px solid #E5E7EB",
                    background: isActive ? `${p.color}10` : "#F8FAFC",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    outline: "none",
                  }}
                >
                  <Icon size={16} color={isActive ? p.color : "#9CA3AF"} />
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.62rem",
                      color: isActive ? p.color : "#9CA3AF",
                    }}
                  >
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Portal description chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: `${selected.color}08`,
              border: `1px solid ${selected.color}25`,
              borderRadius: 12,
              padding: "10px 14px",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${selected.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <selected.icon size={15} color={selected.color} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.83rem",
                  color: "#111827",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {selected.label} Portal
              </p>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.73rem",
                  color: "#6B7280",
                  margin: 0,
                  marginTop: 2,
                }}
              >
                {selected.sub}
              </p>
            </div>
          </div>

          {/* Form fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: "#4B5563",
                  marginBottom: 6,
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 10,
                  border: "1px solid #E5E7EB",
                  background: "#fff",
                  color: "#111827",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#7C3AED";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  color: "#4B5563",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 42px 11px 14px",
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    color: "#111827",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#7C3AED";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.12)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#9CA3AF",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: loading
                  ? "linear-gradient(135deg,#9D6FE8,#E47EF5)"
                  : "linear-gradient(135deg,#7C3AED,#D946EF)",
                color: "#fff",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.01em",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 25px rgba(124,58,237,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity 0.15s",
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Authenticating...
                </>
              ) : (
                `Enter ${selected.label} Portal`
              )}
            </button>
          </div>

          {/* Demo access note */}
          <div
            style={{
              marginTop: 20,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(124,58,237,0.05)",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.68rem",
                fontWeight: 500,
                color: "#7C3AED",
                margin: 0,
                letterSpacing: "0.04em",
              }}
            >
              DEMO ACCESS — Credentials auto-filled per portal
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel footer ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "45%",
          right: 0,
          padding: "16px 3.5rem",
          borderTop: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#9CA3AF", margin: 0 }}>
          © 2026 NestiGo · Built in India
        </p>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Privacy Policy", "Terms", "Help Center"].map((link) => (
            <a key={link} href="#"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", color: "#9CA3AF", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#7C3AED")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}>
              {link}
            </a>
          ))}
        </div>
      </div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

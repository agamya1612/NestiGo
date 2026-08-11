import { useState } from "react";
import { LogOut, ChevronLeft, ChevronRight, Zap, Menu, X } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface PortalShellProps {
  portalName: string;
  portalColor: string;
  portalIcon: React.ComponentType<{ className?: string }>;
  navItems: NavItem[];
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export function PortalShell({
  portalName,
  portalColor,
  portalIcon: PortalIcon,
  navItems,
  activePage,
  setActivePage,
  onLogout,
  userName,
  userRole,
  children,
}: PortalShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = navItems.find((n) => n.id === activePage);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div
        className="flex items-center gap-3 px-4 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid #2C3244" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7C3AED, #D946EF)" }}
        >
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                color: "#F8FAFC",
              }}
            >
              NestiGo
            </div>
            <div
              style={{
                color: portalColor,
                fontSize: "0.65rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.06em",
                marginTop: "2px",
              }}
            >
              {portalName.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Portal badge pill */}
      {!collapsed && (
        <div
          className="mx-3 mt-3 mb-1 px-3 py-2 rounded-full flex items-center gap-2"
          style={{
            background: `${portalColor}18`,
            border: `1px solid ${portalColor}30`,
          }}
        >
          <PortalIcon
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: portalColor } as React.CSSProperties}
          />
          <span
            style={{
              color: portalColor,
              fontSize: "0.72rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            {portalName}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                collapsed ? "justify-center" : ""
              }`}
              style={{
                background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                color: isActive ? "#7C3AED" : "rgba(248,250,252,0.55)",
                borderLeft: isActive
                  ? "3px solid #7C3AED"
                  : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#1A2235";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(248,250,252,0.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(248,250,252,0.55)";
                }
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.85rem",
                    flex: 1,
                    textAlign: "left",
                  }}
                >
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span
                  className="text-white px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "#7C3AED",
                    fontSize: "0.65rem",
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    minWidth: "18px",
                    textAlign: "center",
                    lineHeight: 1.4,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User section + logout */}
      <div
        className="p-3 space-y-2 flex-shrink-0"
        style={{ borderTop: "1px solid #2C3244" }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-2 px-2 py-2 rounded-lg"
            style={{ background: "#141B2D" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: portalColor,
                fontSize: "0.68rem",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate"
                style={{
                  color: "#F8FAFC",
                  fontSize: "0.75rem",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {userName}
              </p>
              <p
                className="truncate"
                style={{
                  color: "rgba(248,250,252,0.45)",
                  fontSize: "0.65rem",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 1.2,
                }}
              >
                {userRole}
              </p>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: portalColor,
                fontSize: "0.68rem",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            collapsed ? "justify-center" : ""
          }`}
          style={{
            color: "rgba(248,250,252,0.45)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1A2235";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(248,250,252,0.75)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(248,250,252,0.45)";
          }}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && (
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.82rem",
              }}
            >
              Sign out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F1F5F9" }}>
      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0 relative transition-all duration-200"
        style={{
          width: collapsed ? "64px" : "220px",
          background: "#0B1020",
          borderRight: "1px solid rgba(44,50,68,0.8)",
        }}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors"
          style={{
            background: "#141B2D",
            border: "1px solid #2C3244",
            color: "rgba(248,250,252,0.55)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1A2235";
            (e.currentTarget as HTMLButtonElement).style.color = "#7C3AED";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#141B2D";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(248,250,252,0.55)";
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="w-64 flex flex-col h-full flex-shrink-0"
            style={{ background: "#0B1020", borderRight: "1px solid #2C3244" }}
          >
            <div className="flex justify-end px-3 pt-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg"
                style={{
                  color: "rgba(248,250,252,0.55)",
                  background: "#141B2D",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-5 py-3.5 flex-shrink-0"
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E5E7EB",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{
              color: "#6B7280",
              background: "#F3F4F6",
            }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              {activeItem?.label ?? "Dashboard"}
            </h1>
          </div>

          {/* LIVE indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#7C3AED" }}
            />
            <span
              style={{
                color: "#7C3AED",
                fontSize: "0.72rem",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.08em",
              }}
            >
              LIVE
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

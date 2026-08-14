import { useState } from "react";
import { LogOut, ChevronLeft, ChevronRight, Zap, Menu, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";

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
  userAvatarUrl?: string;
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
  userAvatarUrl,
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
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo section */}
      <div className="flex items-center gap-3 px-4 py-5 shrink-0 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-primary to-secondary">
          <Zap className="w-4 h-4 text-white" fill="white" />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <div className="font-[family-name:var(--font-heading)] font-extrabold text-base tracking-tight leading-none text-sidebar-foreground">
              NestiGo
            </div>
            <div
              className="text-[0.65rem] font-[family-name:var(--font-body)] font-semibold tracking-wider mt-0.5"
              style={{ color: portalColor }}
            >
              {portalName.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Portal badge pill */}
      {!collapsed && (
        <div
          className="mx-3 mt-3 mb-1 px-3 py-2 rounded-full flex items-center gap-2 animate-fade-in"
          style={{
            backgroundColor: `${portalColor}18`,
            borderColor: `${portalColor}30`,
            borderWidth: "1px",
            borderStyle: "solid",
          }}
        >
          <PortalIcon className="w-3.5 h-3.5 shrink-0" style={{ color: portalColor }} />
          <span
            className="text-[0.72rem] font-[family-name:var(--font-body)] font-semibold tracking-wide"
            style={{ color: portalColor }}
          >
            {portalName}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav role="navigation" className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto dark-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              aria-current={isActive ? "page" : undefined}
              onClick={() => {
                setActivePage(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 border-l-[3px] group ${
                collapsed ? "justify-center" : ""
              } ${
                isActive 
                  ? "bg-sidebar-accent text-primary border-primary" 
                  : "text-sidebar-foreground/55 border-transparent hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/85"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0 transition-colors" />
              {!collapsed && (
                <span className="font-[family-name:var(--font-body)] font-medium text-[0.85rem] flex-1 text-left animate-fade-in truncate">
                  {item.label}
                </span>
              )}
              {!collapsed && item.badge && (
                <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[0.65rem] font-[family-name:var(--font-body)] font-semibold min-w-[18px] text-center leading-[1.4] animate-fade-in">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User section + logout */}
      <Separator className="bg-sidebar-border" />
      <div className="p-3 space-y-2 shrink-0">
        {!collapsed && (
          <button
            onClick={() => setActivePage("profile")}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors hover:bg-white/5 cursor-pointer bg-black/20 animate-fade-in"
          >
            <Avatar className="w-7 h-7 shrink-0">
              {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
              <AvatarFallback 
                className="text-white text-[0.68rem] font-[family-name:var(--font-heading)] font-bold"
                style={{ backgroundColor: portalColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sidebar-foreground text-[0.75rem] font-[family-name:var(--font-body)] font-semibold leading-[1.2]">
                {userName}
              </p>
              <p className="truncate text-sidebar-foreground/45 text-[0.65rem] font-[family-name:var(--font-body)] leading-[1.2]">
                {userRole}
              </p>
            </div>
          </button>
        )}

        {collapsed && (
          <div className="flex justify-center mb-1 animate-fade-in">
            <Avatar className="w-7 h-7 shrink-0">
              {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
              <AvatarFallback 
                className="text-white text-[0.68rem] font-[family-name:var(--font-heading)] font-bold"
                style={{ backgroundColor: portalColor }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <Button
          variant="ghost"
          onClick={onLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 h-auto rounded-lg transition-all duration-200 ${
            collapsed ? "justify-center" : "justify-start"
          } text-sidebar-foreground/45 hover:text-sidebar-foreground/75 hover:bg-sidebar-accent/50`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <span className="font-[family-name:var(--font-body)] text-[0.82rem] animate-fade-in">
              Sign out
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2">
      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex flex-col shrink-0 relative transition-all duration-300 ease-in-out border-r border-sidebar-border bg-sidebar ${
          collapsed ? "w-[64px]" : "w-[220px]"
        }`}
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors bg-sidebar border-sidebar-border text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-primary hover:border-sidebar-border"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col h-full shrink-0 bg-sidebar border-r border-sidebar-border animate-slide-in-left shadow-xl">
            <div className="flex justify-end px-3 pt-3 pb-1 bg-sidebar">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                className="h-7 w-7 text-sidebar-foreground/55 bg-black/20 hover:bg-black/40 hover:text-sidebar-foreground"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
               <SidebarContent />
            </div>
          </div>
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 py-3.5 shrink-0 bg-background border-b border-border shadow-sm">
          {/* Mobile hamburger */}
          <Button
            variant="secondary"
            size="icon"
            className="lg:hidden h-8 w-8 text-muted-foreground bg-muted hover:bg-muted/80"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-heading)] font-bold text-[1.05rem] text-foreground leading-[1.2] truncate">
              {activeItem?.label ?? "Dashboard"}
            </h1>
          </div>

          {/* LIVE indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse bg-primary" />
            <span className="text-primary text-[0.72rem] font-[family-name:var(--font-body)] font-semibold tracking-[0.08em]">
              LIVE
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

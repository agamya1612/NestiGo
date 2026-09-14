import { useState } from "react";
import { ShoppingBag, Wrench, Zap, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

// Isolated Admin Configuration (Hidden Prototype Feature)
const ADMIN_CONFIG = {
  id: "ops.admin@nestigo.com",
  password: "Admin@456",
};

const portals = [
  {
    id: "customer",
    label: "Customer",
    sub: "Shop across all categories",
    icon: ShoppingBag,
  },
  {
    id: "provider",
    label: "Provider",
    sub: "Manage jobs & inventory",
    icon: Wrench,
  },
];

const demoCredentials: Record<string, { email: string; password: string }> = {
  customer: { email: "priya.sharma@nestigo.com", password: "Demo@123" },
  provider: { email: "sparkle.cleaners@nestigo.com", password: "Demo@123" },
};

interface LoginPageProps {
  onLogin: (portal: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedPortal, setSelectedPortal] = useState("customer");
  const [email, setEmail] = useState(demoCredentials.customer.email);
  const [password, setPassword] = useState(demoCredentials.customer.password);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortalSelect = (id: string) => {
    setSelectedPortal(id);
    setEmail(demoCredentials[id].email);
    setPassword(demoCredentials[id].password);
    setError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      // Admin hidden login intercept
      if (selectedPortal === "customer" && email === ADMIN_CONFIG.id) {
        if (password === ADMIN_CONFIG.password) {
          onLogin("admin");
        } else {
          // If ID matches but password wrong, show generic error
          setError("Invalid credentials. Please check your email and password.");
        }
        return;
      }

      // Normal login flow
      if (
        email === demoCredentials[selectedPortal].email &&
        password === demoCredentials[selectedPortal].password
      ) {
        onLogin(selectedPortal);
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-[family-name:var(--font-body)] bg-background">
      {/* --- LEFT BRANDING PANEL --- */}
      <div className="hidden md:flex w-[45%] max-w-[600px] flex-col justify-between p-14 bg-zinc-950 text-zinc-50 relative overflow-hidden">
        {/* Restrained structural gradients */}
        <div className="absolute top-[-25%] left-[-15%] w-[80%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[80%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Brand / Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-zinc-950" fill="currentColor" />
          </div>
          <span className="font-[family-name:var(--font-heading)] font-extrabold text-2xl tracking-tight text-white">
            NestiGo
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[420px]">
          <h1 className="font-[family-name:var(--font-heading)] font-bold text-[2.75rem] leading-[1.15] tracking-tight mb-6 text-white">
            The platform for <br />
            <span className="text-zinc-400">everything.</span>
          </h1>
          <p className="text-zinc-400 text-[1.05rem] leading-relaxed mb-12 font-medium">
            Connect customers and service providers seamlessly with our enterprise-grade infrastructure.
          </p>
          
          <div className="flex items-center gap-10 border-t border-zinc-800/80 pt-10">
            <div>
              <div className="text-3xl font-bold font-[family-name:var(--font-heading)] text-white">2</div>
              <div className="text-[0.8rem] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Core Portals</div>
            </div>
            <div className="w-px h-12 bg-zinc-800/80" />
            <div>
              <div className="text-3xl font-bold font-[family-name:var(--font-heading)] text-white">99.9%</div>
              <div className="text-[0.8rem] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Uptime SLA</div>
            </div>
            <div className="w-px h-12 bg-zinc-800/80" />
            <div>
              <div className="text-3xl font-bold font-[family-name:var(--font-heading)] text-white">24/7</div>
              <div className="text-[0.8rem] font-medium text-zinc-500 mt-1 uppercase tracking-wider">Support</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[0.7rem] font-medium text-zinc-600 uppercase tracking-widest">
          © 2026 NestiGo Enterprise · Built in India
        </div>
      </div>

      {/* --- RIGHT LOGIN PANEL --- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative min-h-[100dvh]">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-0 left-0 right-0 p-6 flex items-center gap-2 z-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-[family-name:var(--font-heading)] font-extrabold text-xl tracking-tight text-foreground">
            NestiGo
          </span>
        </div>

        <div className="w-full max-w-[380px] animate-fade-in-up mt-12 md:mt-0">
          <div className="mb-8 text-center md:text-left">
            <h2 className="font-[family-name:var(--font-heading)] font-bold text-3xl tracking-tight text-foreground mb-2">
              Sign in
            </h2>
            <p className="text-muted-foreground text-[0.95rem]">
              Select your role and authenticate to continue.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {portals.map((p) => {
              const isActive = selectedPortal === p.id;
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePortalSelect(p.id)}
                  className={`relative flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 outline-none ${
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                      : "border-border bg-card hover:bg-accent/40 hover:border-border/80 text-muted-foreground"
                  }`}
                >
                  <div className={`shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`font-semibold text-sm ${isActive ? "text-foreground" : ""}`}>
                      {p.label}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2 size={16} className="text-primary shrink-0" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-destructive animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-[0.9rem] font-medium leading-snug">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[0.9rem] font-semibold text-foreground">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background text-[0.95rem] transition-shadow focus-visible:ring-primary/30"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[0.9rem] font-semibold text-foreground">Password</Label>
                  <a href="#" className="text-[0.8rem] text-muted-foreground hover:text-primary transition-colors font-medium" tabIndex={-1}>
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background text-[0.95rem] transition-shadow focus-visible:ring-primary/30"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-[0.95rem] font-bold shadow-sm transition-all rounded-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <>
                  Sign in to {portals.find(p => p.id === selectedPortal)?.label}
                  <ChevronRight size={18} className="ml-1.5 opacity-70" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

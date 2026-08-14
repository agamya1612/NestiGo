import { useState, useEffect, useRef } from "react";
import {
  Radar, Package, Wallet, Navigation, MessageSquare,
  CheckCircle2, MapPin, Clock, Send, Truck, TrendingUp, ArrowRight, Zap
} from "lucide-react";
import { PortalShell } from "../PortalShell";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";

const mockJobs = [
  { id: "JOB-9041", orderId: "ORD-2026-4850", type: "service", customer: "Priya Sharma", pickupAddr: "Sparkle Services, Indiranagar", dropAddr: "123 MG Road, Indiranagar, Bengaluru", items: "AC Deep Cleaning (1.5 Ton)", payout: 799, status: "active", distance: "1.2 km", eta: "12 min" },
  { id: "JOB-9038", orderId: "ORD-2026-4812", type: "retail", customer: "Vikram Nair", pickupAddr: "FreshMart, Koramangala", dropAddr: "45 5th Block, Koramangala, Bengaluru", items: "Grocery Bundle (6 items)", payout: 285, status: "completed", distance: "2.1 km", eta: null },
  { id: "JOB-9025", orderId: "ORD-2026-4780", type: "pharma", customer: "Anjali Singh", pickupAddr: "MedQuick, HSR Layout", dropAddr: "78 Sector 2, HSR Layout, Bengaluru", items: "Paracetamol, Vitamin D3", payout: 180, status: "completed", distance: "0.8 km", eta: null },
];

const driverChatMessages = [
  { id: 1, sender: "customer", text: "How far are you?", time: "14:42" },
  { id: 2, sender: "driver", text: "On my way! 5 minutes.", time: "14:43" },
  { id: 3, sender: "customer", text: "Please call when you arrive at the gate. Gate code: 4532", time: "14:44" },
];

const VERTICAL_COLOR: Record<string, string> = {
  pharma: "#8B5CF6",
  retail: "#10B981",
  service: "#3B82F6",
  shifting: "#F59E0B",
  bakery: "#EC4899",
};

// Radar Page (GPS Telemetry)
function RadarPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });
  const [lastPing, setLastPing] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      setCoords((prev) => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
      setLastPing(new Date().toLocaleTimeString());
    }, 3000);
    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 page-enter">
      {/* Status Card */}
      <Card className="text-center overflow-hidden border-2 transition-colors duration-300" 
            style={{ borderColor: isOnline ? "#00D4AA40" : "var(--border)" }}>
        <CardContent className="p-6">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className={`absolute inset-0 rounded-full ${isOnline ? "animate-pulse-dot" : ""}`}
              style={{ background: isOnline ? "#00D4AA20" : "transparent" }} />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{ background: isOnline ? "#00D4AA" : "var(--muted)" }}>
              <Truck className={`w-9 h-9 ${isOnline ? "text-white" : "text-muted-foreground"}`} />
            </div>
          </div>
          <h2 className="text-xl font-[family-name:var(--font-heading)] font-bold transition-colors duration-300" 
              style={{ color: isOnline ? "#00D4AA" : "var(--muted-foreground)" }}>
            {isOnline ? "ON DUTY" : "OFF DUTY"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isOnline ? "Broadcasting location to dispatch" : "Toggle to go online"}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Switch 
              id="duty-toggle"
              checked={isOnline}
              onCheckedChange={setIsOnline}
              aria-label="Toggle duty status"
            />
            <label htmlFor="duty-toggle" className="text-sm font-medium cursor-pointer">
              {isOnline ? "Go Offline" : "Go Online"}
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {/* GPS Data */}
        {isOnline && (
          <Card className="sm:col-span-2 border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider font-[family-name:var(--font-mono)]" style={{ color: "#00D4AA" }}>
                  GPS ACTIVE · LIVE PING
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Latitude", value: coords.lat.toFixed(6) },
                  { label: "Longitude", value: coords.lng.toFixed(6) },
                  { label: "Last Ping", value: lastPing },
                  { label: "Redis GEO Key", value: "active_providers" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-border">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs text-foreground font-[family-name:var(--font-mono)]">{row.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's stats */}
        <Card className="sm:col-span-2 border-border bg-surface-1 shadow-sm">
           <CardContent className="p-4 grid grid-cols-3 gap-2 sm:gap-4 divide-x divide-border">
             {[
              { label: "Jobs Today", value: "4", color: "var(--warning)" },
              { label: "Distance", value: "18.2km", color: "var(--info)" },
              { label: "Earnings", value: "₹1,840", color: "#00D4AA" },
             ].map((s) => (
               <div key={s.label} className="text-center px-2">
                 <p className="font-[family-name:var(--font-heading)] font-bold text-lg md:text-xl" style={{ color: s.color }}>{s.value}</p>
                 <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
               </div>
             ))}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Jobs Page
function JobsPage({ setPage, setActiveJobId }: { setPage: (p: string) => void; setActiveJobId: (id: string) => void }) {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const filtered = mockJobs.filter((j) => tab === "active" ? j.status === "active" : j.status === "completed");

  return (
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="grid w-full sm:w-64 grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 && (
        <Card className="empty-state animate-scale-in">
          <Package className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">No {tab} jobs</p>
          <p className="text-xs text-muted-foreground">Check back later for new requests.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {filtered.map((job) => (
          <Card key={job.id} className={`overflow-hidden hover-lift flex flex-col ${job.status === "active" ? "border-primary/30" : ""}`}
            style={job.status === "active" ? { borderColor: "#00D4AA40" } : {}}>
            <CardHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between space-y-0"
              style={job.status === "active" ? { background: "#00D4AA0A" } : {}}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold font-[family-name:var(--font-mono)]">{job.id}</span>
                <Badge variant="secondary" className="text-[10px] capitalize"
                  style={{ background: `${VERTICAL_COLOR[job.type] ?? "#666"}20`, color: VERTICAL_COLOR[job.type] ?? "#666" }}>
                  {job.type}
                </Badge>
              </div>
              <span className="font-bold text-sm" style={{ color: job.status === "active" ? "#00D4AA" : "var(--success)" }}>
                ₹{job.payout}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-1">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-accent flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{job.pickupAddr}</p>
                </div>
                <div className="w-px h-4 ml-1.5 border-l border-dashed border-border" />
                <div className="flex items-start gap-3">
                  <MapPin className="w-3 h-3 text-success flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">{job.dropAddr}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Package className="w-3 h-3" /> {job.items}
                </span>
                {job.eta && (
                  <Badge variant="outline" className="text-[10px] font-[family-name:var(--font-mono)] text-accent border-accent/30 bg-accent/5">
                    ETA {job.eta}
                  </Badge>
                )}
              </div>
            </CardContent>
            {job.status === "active" && (
              <CardFooter className="p-4 pt-0 gap-2">
                <Button 
                  onClick={() => { setActiveJobId(job.id); setPage("jobdetail"); }}
                  className="flex-1 text-black font-semibold hover:opacity-90"
                  style={{ background: "#00D4AA" }}
                  aria-label={`Navigate to job ${job.id}`}
                >
                  <Navigation className="w-4 h-4 mr-2" /> Navigate
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setPage("driverchat")}
                  className="text-info border-info/30 hover:bg-info/10 hover:text-info"
                  aria-label="Chat with customer"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Job Detail Page
function JobDetailPage({ jobId }: { jobId: string }) {
  const job = mockJobs.find((j) => j.id === jobId) ?? mockJobs[0];
  const [status, setStatus] = useState<"enroute" | "picked_up" | "completed">("enroute");

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 page-enter">
      {/* Map simulation */}
      <Card className="overflow-hidden relative h-48 md:h-64 bg-surface-2 border-border">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "25px 25px",
        }} />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm border-accent/40 text-accent gap-1 font-[family-name:var(--font-mono)] text-[10px]">
            <div className="w-2 h-2 rounded-full bg-accent" /> PICKUP
          </Badge>
          <Badge variant="outline" className="bg-background/90 backdrop-blur-sm gap-1 font-[family-name:var(--font-mono)] text-[10px]" style={{ borderColor: "#00D4AA40", color: "#00D4AA" }}>
            <MapPin className="w-2.5 h-2.5" /> DROP
          </Badge>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-bounce">
            <Truck className="w-8 h-8 md:w-10 md:h-10 drop-shadow-md" style={{ color: "#00D4AA" }} />
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-background/90 backdrop-blur-sm text-accent hover:bg-background/90 font-[family-name:var(--font-mono)] text-xs shadow-sm border-border">
            {job.distance} · {job.eta}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {/* Job info */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-[family-name:var(--font-mono)] text-sm font-semibold">{job.orderId}</span>
              <span className="font-[family-name:var(--font-heading)] font-bold text-lg" style={{ color: "#00D4AA" }}>₹{job.payout}</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Customer</p>
                <p className="text-sm font-medium">{job.customer}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="text-sm">{job.items}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status actions */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold font-[family-name:var(--font-heading)]">Delivery Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {[
              { key: "enroute", label: "En Route to Pickup", color: "var(--accent)" },
              { key: "picked_up", label: "Mark Picked Up", color: "var(--info)" },
              { key: "completed", label: "Complete Delivery", color: "#00D4AA" },
            ].map((step, i) => {
              const statuses = ["enroute", "picked_up", "completed"];
              const stepIdx = statuses.indexOf(step.key);
              const currentIdx = statuses.indexOf(status);
              const done = stepIdx < currentIdx;
              const active = stepIdx === currentIdx;

              return (
                <button
                  key={step.key}
                  disabled={stepIdx !== currentIdx}
                  onClick={() => {
                    if (step.key === "picked_up") setStatus("picked_up");
                    if (step.key === "completed") setStatus("completed");
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? "hover-lift" : ""}`}
                  style={{
                    background: done ? "#00D4AA15" : active ? "var(--surface-2)" : "var(--surface-1)",
                    border: `1px solid ${done ? "#00D4AA40" : active ? step.color : "var(--border)"}`,
                    cursor: active ? "pointer" : "default",
                    opacity: stepIdx > currentIdx ? 0.6 : 1,
                  }}
                  aria-label={step.label}
                  role="button"
                  tabIndex={stepIdx === currentIdx ? 0 : -1}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: done ? "#00D4AA" : active ? step.color : "var(--muted)" }}>
                    {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : (
                      <span className="text-xs font-bold text-white font-[family-name:var(--font-heading)]">{i + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium flex-1 text-left"
                    style={{ color: done ? "#00D4AA" : active ? "var(--foreground)" : "var(--muted-foreground)" }}>
                    {step.label}
                  </span>
                  {active && <ArrowRight className="w-4 h-4" style={{ color: step.color }} />}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {status === "completed" && (
        <Card className="bg-success/10 border-success/30 animate-scale-in text-center">
          <CardContent className="p-6">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-success" />
            <p className="text-success font-[family-name:var(--font-heading)] font-bold text-lg">Delivery Completed!</p>
            <p className="text-sm text-muted-foreground mt-1">₹{job.payout} will be credited within 24h</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Driver Chat Page
function DriverChatPage() {
  const [messages, setMessages] = useState(driverChatMessages);
  const [input, setInput] = useState("");
  const quickReplies = ["I am at the gate", "Stuck in traffic", "On my way!", "Delivered successfully"];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "driver", text: text.trim(), time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[520px] md:h-[600px] page-enter">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-3 p-4 border-b border-border space-y-0 bg-surface-1">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarFallback className="bg-accent text-accent-foreground font-bold">PS</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-semibold">Priya Sharma</CardTitle>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <CardDescription className="text-[11px]">Customer · Online</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 overflow-y-auto space-y-4" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "driver" ? "justify-end" : "justify-start"} animate-fade-in-up`}>
              <div className="max-w-[80%] md:max-w-[70%]">
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.sender === "driver" ? "rounded-tr-sm text-black" : "rounded-tl-sm bg-surface-2 text-foreground"}`}
                  style={msg.sender === "driver" ? { background: "#00D4AA" } : {}}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-muted-foreground mt-1 ${msg.sender === "driver" ? "text-right" : "text-left"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick replies */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border bg-surface-1 dark-scrollbar">
          {quickReplies.map((r) => (
            <Badge key={r} variant="outline" className="cursor-pointer whitespace-nowrap hover:bg-muted py-1 transition-colors"
              style={{ color: "#00D4AA", borderColor: "#00D4AA40" }}
              onClick={() => send(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && send(r)}
            >
              {r}
            </Badge>
          ))}
        </div>

        <CardFooter className="p-3 border-t border-border bg-surface-1 flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Message customer..."
            className="flex-1 bg-background" 
            aria-label="Message input"
          />
          <Button 
            onClick={() => send(input)}
            size="icon"
            style={{ background: "#00D4AA", color: "black" }}
            aria-label="Send message"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Driver Wallet Page
function DriverWalletPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6 page-enter">
      <Card className="bg-gradient-to-br from-surface-1 to-surface-2 border border-border overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Wallet className="w-32 h-32" style={{ color: "#00D4AA" }} />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4" style={{ color: "#00D4AA" }} />
            <span className="text-sm font-medium text-muted-foreground">Driver Wallet</span>
          </div>
          <p className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] tracking-tight" style={{ color: "#00D4AA" }}>
            ₹1,840.00
          </p>
          <p className="text-xs text-muted-foreground mt-2">80% of settled deliveries</p>
          
          <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4">
            {[{ label: "Today", value: "₹639" }, { label: "Week", value: "₹4,210" }, { label: "Month", value: "₹18,400" }].map((s) => (
              <div key={s.label} className="rounded-xl p-3 text-center border border-border bg-background/50 backdrop-blur-sm shadow-sm hover-lift transition-transform">
                <p className="font-bold text-base md:text-lg font-[family-name:var(--font-heading)]" style={{ color: "#00D4AA" }}>{s.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="px-4 py-3 border-b border-border bg-surface-1">
          <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Payout History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border stagger-children">
            {[
              { job: "JOB-9041", amount: 639, date: "2026-07-28", status: "pending" },
              { job: "JOB-9038", amount: 228, date: "2026-07-27", status: "credited" },
              { job: "JOB-9025", amount: 144, date: "2026-07-27", status: "credited" },
              { job: "JOB-9010", amount: 479, date: "2026-07-26", status: "credited" },
            ].map((p, i) => (
              <div key={p.job} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: p.status === "credited" ? "#00D4AA20" : "var(--accent)/20" }}>
                  <TrendingUp className="w-4 h-4" style={{ color: p.status === "credited" ? "#00D4AA" : "var(--accent)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[family-name:var(--font-mono)] text-sm font-medium text-foreground truncate">{p.job}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.date}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <p className="font-bold text-sm font-[family-name:var(--font-heading)]" style={{ color: p.status === "credited" ? "#00D4AA" : "var(--foreground)" }}>
                    +₹{p.amount}
                  </p>
                  <Badge variant="outline" className={`text-[10px] mt-1 capitalize ${p.status === "credited" ? "text-[#00D4AA] border-[#00D4AA]/30" : "text-accent border-accent/30"}`}>
                    {p.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const navItems = [
  { id: "radar", label: "GPS Radar", icon: Radar },
  { id: "jobs", label: "My Jobs", icon: Package },
  { id: "driverchat", label: "Chat", icon: MessageSquare },
  { id: "wallet", label: "Earnings", icon: Wallet },
];

export function DriverPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("radar");
  const [activeJobId, setActiveJobId] = useState(mockJobs[0].id);

  const enrichedNav = [...navItems];
  if (activePage === "jobdetail") enrichedNav.push({ id: "jobdetail", label: "Navigate Job", icon: Navigation });

  return (
    <PortalShell
      portalName="Driver Portal"
      portalColor="#00D4AA"
      portalIcon={Truck}
      navItems={enrichedNav}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      userName="Ramesh Kumar"
      userRole="Delivery Driver"
    >
      {activePage === "radar" && <RadarPage />}
      {activePage === "jobs" && <JobsPage setPage={setActivePage} setActiveJobId={setActiveJobId} />}
      {activePage === "jobdetail" && <JobDetailPage jobId={activeJobId} />}
      {activePage === "driverchat" && <DriverChatPage />}
      {activePage === "wallet" && <DriverWalletPage />}
    </PortalShell>
  );
}

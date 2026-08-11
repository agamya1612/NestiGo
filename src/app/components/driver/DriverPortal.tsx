import { useState, useEffect } from "react";
import {
  Radar, Package, Wallet, Navigation, MessageSquare,
  CheckCircle2, MapPin, Clock, Send, Truck, TrendingUp, ArrowRight, Zap
} from "lucide-react";
import { PortalShell } from "../PortalShell";

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
    <div className="max-w-sm mx-auto space-y-4">
      {/* Status card */}
      <div className="rounded-2xl p-5 text-center"
        style={{ background: "#0C1225", border: `2px solid ${isOnline ? "#00D4AA40" : "rgba(255,255,255,0.06)"}` }}>
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className={`absolute inset-0 rounded-full ${isOnline ? "animate-ping" : ""}`}
            style={{ background: isOnline ? "#00D4AA20" : "transparent" }} />
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: isOnline ? "#00D4AA" : "#162040" }}>
            <Truck className="w-9 h-9 text-white" />
          </div>
        </div>
        <p style={{ color: isOnline ? "#00D4AA" : "#6B7FA0", fontFamily: "Outfit", fontWeight: 800, fontSize: "1.1rem" }}>
          {isOnline ? "ON DUTY" : "OFF DUTY"}
        </p>
        <p style={{ color: "#6B7FA0", fontSize: "0.75rem", fontFamily: "DM Sans", marginTop: "4px" }}>
          {isOnline ? "Broadcasting location to dispatch" : "Toggle to go online"}
        </p>

        <button onClick={() => setIsOnline((v) => !v)}
          className="mt-4 px-8 py-3 rounded-2xl transition-all"
          style={{
            background: isOnline ? "#FF3B5C" : "#00D4AA",
            color: "white",
            fontFamily: "Outfit",
            fontWeight: 800,
            fontSize: "0.95rem",
            boxShadow: isOnline ? "0 4px 20px rgba(255,59,92,0.3)" : "0 4px 20px rgba(0,212,170,0.3)",
          }}>
          {isOnline ? "Go Offline" : "Go Online"}
        </button>
      </div>

      {/* GPS Data */}
      {isOnline && (
        <div className="rounded-xl p-4 space-y-3" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span style={{ color: "#00D4AA", fontFamily: "JetBrains Mono", fontSize: "0.72rem", fontWeight: 600 }}>
              GPS ACTIVE · LIVE PING
            </span>
          </div>
          {[
            { label: "Latitude", value: coords.lat.toFixed(6) },
            { label: "Longitude", value: coords.lng.toFixed(6) },
            { label: "Last Ping", value: lastPing },
            { label: "Redis GEO Key", value: "active_providers" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center py-1.5 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{row.label}</span>
              <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Today's stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Jobs Today", value: "4", color: "#FF6B00" },
          { label: "Distance", value: "18.2km", color: "#3B82F6" },
          { label: "Earnings", value: "₹1,840", color: "#00D4AA" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-3 text-center"
            style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: s.color, fontFamily: "Outfit", fontWeight: 800, fontSize: "1rem" }}>{s.value}</p>
            <p style={{ color: "#6B7FA0", fontSize: "0.65rem", fontFamily: "DM Sans" }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Jobs Page
function JobsPage({ setPage, setActiveJobId }: { setPage: (p: string) => void; setActiveJobId: (id: string) => void }) {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const filtered = mockJobs.filter((j) => tab === "active" ? j.status === "active" : j.status === "completed");

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: "#111D38" }}>
        {(["active", "completed"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg capitalize transition-all"
            style={{
              background: tab === t ? "#00D4AA" : "transparent",
              color: tab === t ? "#06091A" : "#6B7FA0",
              fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem",
            }}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10">
          <Package className="w-10 h-10 mx-auto mb-3" style={{ color: "#3B4A6B" }} />
          <p style={{ color: "#6B7FA0", fontFamily: "DM Sans" }}>No {tab} jobs</p>
        </div>
      )}

      {filtered.map((job) => (
        <div key={job.id} className="rounded-xl overflow-hidden"
          style={{ background: "#0C1225", border: `1px solid ${job.status === "active" ? "#00D4AA30" : "rgba(255,255,255,0.06)"}` }}>
          <div className="flex items-center justify-between px-4 py-2.5 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: job.status === "active" ? "#00D4AA08" : "transparent" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{job.id}</span>
              <span className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: `${VERTICAL_COLOR[job.type] ?? "#666"}20`, color: VERTICAL_COLOR[job.type] ?? "#666", fontFamily: "DM Sans" }}>
                {job.type}
              </span>
            </div>
            <span style={{ color: job.status === "active" ? "#00D4AA" : "#10B981", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.95rem" }}>
              ₹{job.payout}
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0 mt-0.5" />
                  <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{job.pickupAddr}</p>
                </div>
                <div className="w-px h-3 ml-1.5 border-l border-dashed" style={{ borderColor: "rgba(255,255,255,0.15)" }} />
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                  <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{job.dropAddr}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>
                📦 {job.items}
              </span>
              {job.eta && (
                <span style={{ color: "#F59E0B", fontSize: "0.72rem", fontFamily: "JetBrains Mono" }}>
                  ETA {job.eta}
                </span>
              )}
            </div>
            {job.status === "active" && (
              <div className="flex gap-2">
                <button onClick={() => { setActiveJobId(job.id); setPage("jobdetail"); }}
                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
                  style={{ background: "#00D4AA", color: "#06091A", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.85rem" }}>
                  <Navigation className="w-4 h-4" /> Navigate
                </button>
                <button onClick={() => setPage("driverchat")}
                  className="py-2.5 px-4 rounded-xl"
                  style={{ background: "#3B82F620", border: "1px solid #3B82F640", color: "#3B82F6" }}>
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Job Detail Page
function JobDetailPage({ jobId }: { jobId: string }) {
  const job = mockJobs.find((j) => j.id === jobId) ?? mockJobs[0];
  const [status, setStatus] = useState<"enroute" | "picked_up" | "completed">("enroute");

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {/* Map simulation */}
      <div className="rounded-2xl overflow-hidden relative" style={{ height: "200px", background: "#0C1225" }}>
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(0,212,170,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,170,0.08) 1px, transparent 1px)",
          backgroundSize: "25px 25px",
        }} />
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(6,9,26,0.9)", border: "1px solid rgba(255,107,0,0.3)" }}>
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF6B00" }} />
            <p style={{ color: "#FF6B00", fontFamily: "JetBrains Mono", fontSize: "0.72rem" }}>PICKUP</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(6,9,26,0.9)", border: "1px solid rgba(0,212,170,0.3)" }}>
            <MapPin className="w-3 h-3" style={{ color: "#00D4AA" }} />
            <p style={{ color: "#00D4AA", fontFamily: "JetBrains Mono", fontSize: "0.72rem" }}>DROP</p>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-bounce">
            <Truck className="w-8 h-8" style={{ color: "#00D4AA" }} />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(6,9,26,0.9)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color: "#F59E0B", fontFamily: "JetBrains Mono", fontSize: "0.72rem", fontWeight: 700 }}>
            {job.distance} · {job.eta}
          </p>
        </div>
      </div>

      {/* Job info */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between">
          <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: "0.82rem" }}>{job.orderId}</span>
          <span style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 800, fontSize: "1.1rem" }}>₹{job.payout}</span>
        </div>
        <div>
          <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Customer</p>
          <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600 }}>{job.customer}</p>
        </div>
        <div>
          <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Items</p>
          <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.82rem" }}>{job.items}</p>
        </div>
      </div>

      {/* Status actions */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.9rem" }}>Delivery Progress</p>
        {[
          { key: "enroute", label: "En Route to Pickup", color: "#F59E0B" },
          { key: "picked_up", label: "Mark Picked Up", color: "#3B82F6" },
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
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: done ? "#00D4AA10" : active ? `${step.color}18` : "#111D38",
                border: `1px solid ${done ? "#00D4AA30" : active ? `${step.color}40` : "rgba(255,255,255,0.05)"}`,
                cursor: active ? "pointer" : "default",
              }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: done ? "#00D4AA" : active ? step.color : "#162040" }}>
                {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : (
                  <span style={{ color: active ? "white" : "#6B7FA0", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.75rem" }}>{i + 1}</span>
                )}
              </div>
              <span style={{ color: done ? "#00D4AA" : active ? "#E4ECF7" : "#6B7FA0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem", flex: 1, textAlign: "left" }}>
                {step.label}
              </span>
              {active && <ArrowRight className="w-4 h-4" style={{ color: step.color }} />}
            </button>
          );
        })}
      </div>

      {status === "completed" && (
        <div className="rounded-xl p-4 text-center" style={{ background: "#00D4AA10", border: "1px solid #00D4AA30" }}>
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#00D4AA" }} />
          <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 700 }}>Delivery Completed!</p>
          <p style={{ color: "#6B7FA0", fontSize: "0.78rem", fontFamily: "DM Sans" }}>₹{job.payout} will be credited within 24h</p>
        </div>
      )}
    </div>
  );
}

// Driver Chat Page
function DriverChatPage() {
  const [messages, setMessages] = useState(driverChatMessages);
  const [input, setInput] = useState("");
  const quickReplies = ["I am at the gate", "Stuck in traffic", "On my way!", "Delivered successfully"];

  const send = (text: string) => {
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "driver", text, time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <div className="max-w-sm mx-auto flex flex-col" style={{ minHeight: "520px" }}>
      <div className="flex-1 rounded-xl overflow-hidden flex flex-col" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#FF6B00", fontFamily: "Outfit", fontWeight: 700, color: "white", fontSize: "0.8rem" }}>PS</div>
          <div>
            <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>Priya Sharma</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p style={{ color: "#6B7FA0", fontSize: "0.7rem" }}>Customer · Online</p>
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "driver" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[80%]">
                <div className="px-3 py-2 rounded-2xl"
                  style={{
                    background: msg.sender === "driver" ? "#00D4AA" : "#162040",
                    color: msg.sender === "driver" ? "#06091A" : "#E4ECF7",
                    fontFamily: "DM Sans", fontSize: "0.875rem",
                    borderRadius: msg.sender === "driver" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  }}>
                  {msg.text}
                </div>
                <p style={{ color: "#3B4A6B", fontSize: "0.65rem", fontFamily: "DM Sans", textAlign: msg.sender === "driver" ? "right" : "left", marginTop: "2px" }}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        {/* Quick replies */}
        <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {quickReplies.map((r) => (
            <button key={r} onClick={() => send(r)}
              className="px-2.5 py-1 rounded-full whitespace-nowrap text-xs flex-shrink-0"
              style={{ background: "#162040", color: "#00D4AA", border: "1px solid #00D4AA30", fontFamily: "DM Sans" }}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2 p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Message customer..."
            className="flex-1 px-3 py-2 rounded-xl outline-none"
            style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)", color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem" }} />
          <button onClick={() => send(input)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#00D4AA" }}>
            <Send className="w-4 h-4" style={{ color: "#06091A" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Driver Wallet Page
function DriverWalletPage() {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #0C1225, #1A2240)", border: "1px solid rgba(0,212,170,0.2)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4" style={{ color: "#00D4AA" }} />
          <span style={{ color: "#6B7FA0", fontSize: "0.8rem", fontFamily: "DM Sans" }}>Driver Wallet</span>
        </div>
        <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 900, fontSize: "2rem" }}>₹1,840.00</p>
        <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>80% of settled deliveries</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[{ label: "Today", value: "₹639" }, { label: "Week", value: "₹4,210" }, { label: "Month", value: "₹18,400" }].map((s) => (
            <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: "rgba(0,212,170,0.08)" }}>
              <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.875rem" }}>{s.value}</p>
              <p style={{ color: "#6B7FA0", fontSize: "0.65rem", fontFamily: "DM Sans" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Payout History</p>
        </div>
        {[
          { job: "JOB-9041", amount: 639, date: "2026-07-28", status: "pending" },
          { job: "JOB-9038", amount: 228, date: "2026-07-27", status: "credited" },
          { job: "JOB-9025", amount: 144, date: "2026-07-27", status: "credited" },
          { job: "JOB-9010", amount: 479, date: "2026-07-26", status: "credited" },
        ].map((p, i) => (
          <div key={p.job} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: p.status === "credited" ? "#00D4AA20" : "#F59E0B20" }}>
              <TrendingUp className="w-4 h-4" style={{ color: p.status === "credited" ? "#00D4AA" : "#F59E0B" }} />
            </div>
            <div className="flex-1">
              <p style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{p.job}</p>
              <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>{p.date}</p>
            </div>
            <div className="text-right">
              <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 700 }}>+₹{p.amount}</p>
              <p style={{ color: p.status === "credited" ? "#00D4AA" : "#F59E0B", fontSize: "0.7rem", fontFamily: "DM Sans" }}>
                {p.status}
              </p>
            </div>
          </div>
        ))}
      </div>
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

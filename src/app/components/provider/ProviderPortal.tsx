import { useState, useEffect } from "react";
import {
  LayoutDashboard, Briefcase, FileCheck, Package, Grid3x3, Wallet,
  CheckCircle2, XCircle, Clock, AlertTriangle, Plus, Minus, Upload,
  TrendingUp, Star, MapPin, Wrench
} from "lucide-react";
import { PortalShell } from "../PortalShell";

const mockAssignments = [
  { id: "ASN-7821", orderId: "ORD-2026-4891", type: "stationery", customer: "Priya Sharma",  address: "123 MG Road, Indiranagar",    items: "Classmate Notebook x4, Parker Pen x2", payout: 320, distance: "1.8 km", expires: 5 },
  { id: "ASN-7819", orderId: "ORD-2026-4888", type: "grocery",    customer: "Vikram Nair",   address: "45 Koramangala 5th Block",    items: "Grocery Bundle (6 items)",             payout: 180, distance: "0.9 km", expires: 3 },
];

const mockInventory = [
  { id: "i1", name: "Classmate Notebook A4",    category: "stationery", stock: 120, location: "Store A – Indiranagar",  price: 55,  sku: "STA-NB-A4-001" },
  { id: "i2", name: "Parker Vector Pen",         category: "stationery", stock: 60,  location: "Store A – Indiranagar",  price: 199, sku: "STA-PEN-PKR-001" },
  { id: "i3", name: "A4 Paper Ream 75 GSM",      category: "stationery", stock: 80,  location: "Store A – Indiranagar",  price: 299, sku: "STA-PPR-A4-001" },
  { id: "i4", name: "Amul Gold Milk 1L",         category: "grocery",    stock: 200, location: "Store B – Koramangala", price: 64,  sku: "GRO-MLK-AMG-001" },
  { id: "i5", name: "Aashirvaad Atta 5kg",       category: "grocery",    stock: 80,  location: "Store B – Koramangala", price: 249, sku: "GRO-ATT-ASH-001" },
  { id: "i6", name: "Fortune Sunflower Oil 1L",  category: "grocery",    stock: 60,  location: "Store B – Koramangala", price: 149, sku: "GRO-OIL-FRT-001" },
];

const kycDocs = [
  { id: "kyc1", type: "Aadhar Card", status: "verified", uploadedOn: "2026-07-10", url: "https://storage.nestigo.com/signed/docs/prov123/aadhar.pdf" },
  { id: "kyc2", type: "PAN Card", status: "verified", uploadedOn: "2026-07-10", url: "https://storage.nestigo.com/signed/docs/prov123/pan.pdf" },
  { id: "kyc3", type: "Trade License", status: "pending", uploadedOn: "2026-07-25", url: "https://storage.nestigo.com/signed/docs/prov123/trade.pdf" },
];

const VERTICAL_COLOR: Record<string, string> = {
  grocery:    "#22C55E",
  stationery: "#6366F1",
  service:    "#7C3AED",
  shifting:   "#38BDF8",
  bakery:     "#EC4899",
};

function KycStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: "text-green-400 bg-green-400/10 border-green-400/20",
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    rejected: "text-red-400 bg-red-400/10 border-red-400/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${styles[status]}`}
      style={{ fontFamily: "DM Sans" }}>
      {status}
    </span>
  );
}

// Dashboard Page
function DashboardPage() {
  return (
    <div className="space-y-5">
      {/* KYC Warning */}
      <div className="flex items-center gap-3 p-4 rounded-xl"
        style={{ background: "#F59E0B10", border: "1px solid #F59E0B30" }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#F59E0B" }} />
        <div className="flex-1">
          <p style={{ color: "#F59E0B", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.85rem" }}>KYC Pending</p>
          <p style={{ color: "#A0B4D0", fontSize: "0.75rem", fontFamily: "DM Sans" }}>Trade License is under review. Upload to enable all features.</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs"
          style={{ background: "#F59E0B", color: "#06091A", fontFamily: "DM Sans", fontWeight: 700 }}>
          Upload
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Orders", value: "3", color: "#FF6B00", icon: Briefcase },
          { label: "Today's Earnings", value: "₹2,340", color: "#00D4AA", icon: TrendingUp },
          { label: "Rating", value: "4.7 ★", color: "#F59E0B", icon: Star },
          { label: "Completed Jobs", value: "128", color: "#3B82F6", icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>{s.label}</span>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p style={{ color: s.color, fontFamily: "Outfit", fontWeight: 800, fontSize: "1.3rem" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active Orders */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Active Assignments</p>
        </div>
        {[
          { id: "ORD-2026-4850", type: "service",    customer: "Priya Sharma",  status: "picked_up", payout: 799 },
          { id: "ORD-2026-4812", type: "grocery",    customer: "Vikram Nair",   status: "confirmed", payout: 285 },
          { id: "ORD-2026-4791", type: "stationery", customer: "Anjali Singh",  status: "confirmed", payout: 180 },
        ].map((o, i) => (
          <div key={o.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${VERTICAL_COLOR[o.type]}20` }}>
              <Wrench className="w-3.5 h-3.5" style={{ color: VERTICAL_COLOR[o.type] }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem", fontWeight: 600 }}>{o.id}</p>
              <p style={{ color: "#6B7FA0", fontSize: "0.75rem", fontFamily: "DM Sans" }}>{o.customer}</p>
            </div>
            <div className="text-right">
              <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 700 }}>₹{o.payout}</p>
              <span className={`text-xs ${o.status === "picked_up" ? "text-violet-400" : "text-cyan-400"}`}
                style={{ fontFamily: "DM Sans" }}>
                {o.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Provider toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>Availability Status</p>
          <p style={{ color: "#6B7FA0", fontSize: "0.75rem", fontFamily: "DM Sans" }}>Accept new orders when active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span style={{ color: "#00D4AA", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.8rem" }}>ACTIVE</span>
          <div className="w-11 h-6 rounded-full relative cursor-pointer"
            style={{ background: "#00D4AA" }}>
            <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Assignments Page
function AssignmentsPage() {
  const [timers, setTimers] = useState<Record<string, number>>(
    Object.fromEntries(mockAssignments.map((a) => [a.id, a.expires]))
  );
  const [handled, setHandled] = useState<Record<string, "accepted" | "declined">>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { if (next[k] > 0 && !handled[k]) next[k]--; });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [handled]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "#00D4AA10", border: "1px solid #00D4AA20" }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#00D4AA" }} />
        <p style={{ color: "#00D4AA", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.8rem" }}>
          2 new job offers — respond before they expire
        </p>
      </div>

      {mockAssignments.map((a) => {
        const timeLeft = timers[a.id] ?? 0;
        const action = handled[a.id];
        const color = VERTICAL_COLOR[a.type] ?? "#FF6B00";
        return (
          <div key={a.id} className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${action === "accepted" ? "#00D4AA40" : action === "declined" ? "#FF3B5C40" : `${color}40`}`, background: "#0C1225" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.06)", background: `${color}08` }}>
              <div className="flex items-center gap-2">
                <span style={{ color, fontFamily: "JetBrains Mono", fontWeight: 600, fontSize: "0.78rem" }}>{a.id}</span>
                <span className="px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${color}20`, color, fontFamily: "DM Sans", fontWeight: 600 }}>
                  {a.type}
                </span>
              </div>
              {!action && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: timeLeft > 2 ? "#F59E0B" : "#FF3B5C" }} />
                  <span style={{ color: timeLeft > 2 ? "#F59E0B" : "#FF3B5C", fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: "0.875rem" }}>
                    {timeLeft}s
                  </span>
                </div>
              )}
              {action && (
                <span style={{ color: action === "accepted" ? "#00D4AA" : "#FF3B5C", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.8rem" }}>
                  {action === "accepted" ? "✓ Accepted" : "✗ Declined"}
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>Customer</p>
                  <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>{a.customer}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>Distance</p>
                  <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>
                    <MapPin className="w-3 h-3 inline mr-1" style={{ color }} />{a.distance}
                  </p>
                </div>
                <div>
                  <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>Items</p>
                  <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{a.items}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>Payout</p>
                  <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 800, fontSize: "1.1rem" }}>₹{a.payout}</p>
                </div>
              </div>

              {/* Countdown bar */}
              {!action && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#162040" }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / a.expires) * 100}%`, background: timeLeft > 2 ? "#F59E0B" : "#FF3B5C" }} />
                </div>
              )}

              {!action && (
                <div className="flex gap-3">
                  <button onClick={() => setHandled((p) => ({ ...p, [a.id]: "declined" }))}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: "#FF3B5C15", border: "1px solid #FF3B5C40", color: "#FF3B5C", fontFamily: "Outfit", fontWeight: 700 }}>
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                  <button onClick={() => setHandled((p) => ({ ...p, [a.id]: "accepted" }))}
                    className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2"
                    style={{ background: "#00D4AA", color: "#06091A", fontFamily: "Outfit", fontWeight: 700 }}>
                    <CheckCircle2 className="w-4 h-4" /> Accept
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// KYC Page
function KycPage() {
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("");

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-xl p-5" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h3 style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700, marginBottom: "16px" }}>Upload Document</h3>
        <div className="space-y-4">
          <div>
            <label style={{ color: "#A0B4D0", fontSize: "0.8rem", fontFamily: "DM Sans", fontWeight: 600 }}>Document Type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="w-full mt-1.5 px-3 py-2.5 rounded-xl outline-none"
              style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)", color: docType ? "#E4ECF7" : "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.875rem" }}>
              <option value="">Select document type</option>
              <option>Aadhar Card</option>
              <option>PAN Card</option>
              <option>Driving License</option>
              <option>Trade License</option>
              <option>Commercial License</option>
            </select>
          </div>
          <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: "#6B7FA0" }} />
            <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>
              Drop file or click to upload
            </p>
            <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans", marginTop: "4px" }}>
              PDF, JPG, PNG · Max 10MB · Must use signed storage URL
            </p>
            <p style={{ color: "#3B4A6B", fontSize: "0.65rem", fontFamily: "JetBrains Mono", marginTop: "8px" }}>
              URL: https://storage.nestigo.com/signed/...
            </p>
          </div>
          <button
            disabled={!docType || uploading}
            onClick={() => { setUploading(true); setTimeout(() => setUploading(false), 1500); }}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
            style={{ background: docType ? "#FF6B00" : "#162040", color: docType ? "white" : "#6B7FA0", fontFamily: "Outfit", fontWeight: 700 }}>
            {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</> : "Submit Document"}
          </button>
        </div>
      </div>

      {/* Existing docs */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Uploaded Documents</p>
        </div>
        {kycDocs.map((doc, i) => (
          <div key={doc.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <FileCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#6B7FA0" }} />
            <div className="flex-1 min-w-0">
              <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>{doc.type}</p>
              <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "JetBrains Mono" }}>Uploaded {doc.uploadedOn}</p>
            </div>
            <KycStatusBadge status={doc.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Inventory Page
function InventoryPage() {
  const [inventory, setInventory] = useState(mockInventory);
  const [search, setSearch] = useState("");

  const filtered = inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const adjust = (id: string, delta: number) => {
    setInventory((prev) => prev.map((i) => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)" }}>
        <Package className="w-4 h-4" style={{ color: "#6B7FA0" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..."
          className="flex-1 bg-transparent outline-none"
          style={{ color: "#E4ECF7", fontSize: "0.875rem", fontFamily: "DM Sans" }} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Item", "SKU", "Location", "Stock", "Price", "Adjust"].map((h) => (
                <th key={h} className="px-4 py-3 text-left" style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const low = item.stock < 20;
              return (
                <tr key={item.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td className="px-4 py-3">
                    <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 500, fontSize: "0.875rem" }}>{item.name}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${VERTICAL_COLOR[item.category] ?? "#666"}20`, color: VERTICAL_COLOR[item.category] ?? "#666", fontFamily: "DM Sans" }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#3B4A6B", fontFamily: "JetBrains Mono", fontSize: "0.72rem" }}>{item.sku}</td>
                  <td className="px-4 py-3" style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{item.location}</td>
                  <td className="px-4 py-3">
                    <span style={{ color: low ? "#FF3B5C" : "#00D4AA", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.95rem" }}>
                      {item.stock}
                    </span>
                    {low && <span className="ml-1.5 text-xs" style={{ color: "#FF3B5C", fontFamily: "DM Sans" }}>LOW</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#A0B4D0", fontFamily: "Outfit", fontWeight: 600 }}>₹{item.price}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => adjust(item.id, -5)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: "#FF3B5C20", color: "#FF3B5C" }}>
                        <Minus className="w-3 h-3" />
                      </button>
                      <button onClick={() => adjust(item.id, 10)}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: "#00D4AA20", color: "#00D4AA" }}>
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Categories Page
function CategoriesPage() {
  const categories = [
    { name: "Grocery",              vertical: "grocery",    city: "Mumbai, Bengaluru, Chennai, Delhi, Hyderabad", active: true  },
    { name: "Stationery",           vertical: "stationery", city: "Mumbai, Bengaluru, Delhi, Pune",               active: true  },
    { name: "Home Services",        vertical: "service",    city: "Bengaluru, Mumbai",                            active: true  },
    { name: "Home Shifting",        vertical: "shifting",   city: "Mumbai, Delhi, Bengaluru",                     active: false },
    { name: "Bakery & Food",        vertical: "bakery",     city: "Bengaluru, Mumbai",                            active: false },
  ];

  return (
    <div className="max-w-2xl space-y-3">
      {categories.map((cat) => (
        <div key={cat.name} className="flex items-center gap-4 p-4 rounded-xl"
          style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${VERTICAL_COLOR[cat.vertical]}20` }}>
            <Grid3x3 className="w-5 h-5" style={{ color: VERTICAL_COLOR[cat.vertical] }} />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.875rem" }}>{cat.name}</p>
            <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>
              <MapPin className="w-2.5 h-2.5 inline mr-1" />{cat.city}
            </p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs border ${cat.active ? "text-green-400 bg-green-400/10 border-green-400/20" : "text-slate-500 bg-slate-500/10 border-slate-500/20"}`}
            style={{ fontFamily: "DM Sans" }}>
            {cat.active ? "Active" : "Inactive"}
          </span>
        </div>
      ))}
    </div>
  );
}

// Provider Wallet Page
function ProviderWalletPage() {
  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0C1225 0%, #1A2240 100%)", border: "1px solid rgba(59,130,246,0.2)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4" style={{ color: "#3B82F6" }} />
          <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.8rem" }}>Provider Settlement Wallet</span>
        </div>
        <p style={{ color: "#3B82F6", fontFamily: "Outfit", fontWeight: 900, fontSize: "2.4rem", letterSpacing: "-0.02em" }}>
          ₹28,400.00
        </p>
        <p style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.75rem", marginTop: "4px" }}>80% of completed order settlements</p>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 py-2 rounded-xl text-sm"
            style={{ background: "#3B82F6", color: "white", fontFamily: "DM Sans", fontWeight: 600 }}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Settlement History</p>
        </div>
        {[
          { id: "STL-8921", order: "ORD-2026-4850", amount: 639, date: "2026-07-27", status: "processed" },
          { id: "STL-8908", order: "ORD-2026-4812", amount: 228, date: "2026-07-26", status: "processed" },
          { id: "STL-8895", order: "ORD-2026-4780", amount: 479, date: "2026-07-25", status: "processed" },
          { id: "STL-8880", order: "ORD-2026-4760", amount: 3600, date: "2026-07-24", status: "pending" },
        ].map((s, i) => (
          <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex-1">
              <p style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{s.id}</p>
              <p style={{ color: "#6B7FA0", fontSize: "0.7rem", fontFamily: "DM Sans" }}>{s.order} · {s.date}</p>
            </div>
            <div className="text-right">
              <p style={{ color: "#00D4AA", fontFamily: "Outfit", fontWeight: 700 }}>+₹{s.amount}</p>
              <span style={{ color: s.status === "processed" ? "#00D4AA" : "#F59E0B", fontSize: "0.7rem", fontFamily: "DM Sans" }}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assignments", label: "Orders", icon: Briefcase, badge: 2 },
  { id: "kyc", label: "KYC Documents", icon: FileCheck },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "categories", label: "Categories", icon: Grid3x3 },
  { id: "wallet", label: "Earnings", icon: Wallet },
];

export function ProviderPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <PortalShell
      portalName="Provider Portal"
      portalColor="#3B82F6"
      portalIcon={Wrench}
      navItems={navItems}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      userName="Sparkle Home Services"
      userRole="Service Provider"
    >
      {activePage === "dashboard" && <DashboardPage />}
      {activePage === "assignments" && <AssignmentsPage />}
      {activePage === "kyc" && <KycPage />}
      {activePage === "inventory" && <InventoryPage />}
      {activePage === "categories" && <CategoriesPage />}
      {activePage === "wallet" && <ProviderWalletPage />}
    </PortalShell>
  );
}

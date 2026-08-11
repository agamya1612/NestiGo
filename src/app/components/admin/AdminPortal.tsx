import { useState } from "react";
import {
  Package, FileText, LayoutDashboard, BookOpen, Map, BarChart3,
  TrendingUp, Users, CheckCircle2, XCircle, Edit3, Plus, Search,
  ShieldCheck, AlertTriangle, ChevronDown, X
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { PortalShell } from "../PortalShell";

const VERTICAL_COLOR: Record<string, string> = {
  service:    "#7C3AED",
  grocery:    "#22C55E",
  stationery: "#6366F1",
  shifting:   "#38BDF8",
  bakery:     "#EC4899",
};

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  paid: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  confirmed: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  picked_up: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  completed: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  refunded: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

const revenueData = [
  { month: "Feb", service: 42000, grocery: 35000, stationery: 12000, shifting: 55000, bakery: 15000 },
  { month: "Mar", service: 48000, grocery: 41000, stationery: 15000, shifting: 61000, bakery: 18000 },
  { month: "Apr", service: 45000, grocery: 38000, stationery: 14000, shifting: 58000, bakery: 21000 },
  { month: "May", service: 62000, grocery: 53000, stationery: 19000, shifting: 72000, bakery: 25000 },
  { month: "Jun", service: 58000, grocery: 49000, stationery: 17000, shifting: 68000, bakery: 23000 },
  { month: "Jul", service: 71000, grocery: 61000, stationery: 22000, shifting: 84000, bakery: 29000 },
];

const verticalShareData = [
  { name: "Home Services", value: 34, color: "#7C3AED" },
  { name: "Grocery",       value: 26, color: "#22C55E" },
  { name: "Shifting",      value: 24, color: "#38BDF8" },
  { name: "Stationery",    value: 8,  color: "#6366F1" },
  { name: "Bakery",        value: 8,  color: "#EC4899" },
];

const orderVolumeData = [
  { day: "Mon", orders: 142 }, { day: "Tue", orders: 168 }, { day: "Wed", orders: 201 },
  { day: "Thu", orders: 189 }, { day: "Fri", orders: 245 }, { day: "Sat", orders: 312 }, { day: "Sun", orders: 278 },
];

const mockAllOrders = [
  { id: "ORD-2026-4891", customer: "priya.sharma@nestigo.com",  vertical: "stationery", status: "completed",       amount: 340,  prescription: null, created: "2026-07-27 14:32" },
  { id: "ORD-2026-4888", customer: "vikram.nair@nestigo.com",   vertical: "grocery",    status: "confirmed",       amount: 285,  prescription: null, created: "2026-07-28 09:15" },
  { id: "ORD-2026-4885", customer: "anjali.singh@nestigo.com",  vertical: "grocery",    status: "pending_payment", amount: 420,  prescription: null, created: "2026-07-28 10:48" },
  { id: "ORD-2026-4882", customer: "rohan.kumar@nestigo.com",   vertical: "shifting",   status: "confirmed",       amount: 4500, prescription: null, created: "2026-07-28 08:20" },
  { id: "ORD-2026-4879", customer: "sunita.patel@nestigo.com",  vertical: "bakery",     status: "picked_up",       amount: 599,  prescription: null, created: "2026-07-28 11:30" },
  { id: "ORD-2026-4875", customer: "amit.verma@nestigo.com",    vertical: "service",    status: "completed",       amount: 799,  prescription: null, created: "2026-07-27 16:00" },
  { id: "ORD-2026-4870", customer: "deepa.rao@nestigo.com",     vertical: "grocery",    status: "cancelled",       amount: 185,  prescription: null, created: "2026-07-27 12:10" },
];

const mockPrescriptions: Array<{ orderId: string; customer: string; items: string; prescStatus: string; docUrl: string; created: string }> = [];

const mockCatalogItems = [
  { id: "ci1", name: "AC Deep Cleaning (1.5 Ton)", category: "Home Services", price: 799,  unit: "per unit",  rx: false, active: true  },
  { id: "ci2", name: "Amul Gold Milk 1L",          category: "Grocery",       price: 64,   unit: "per litre", rx: false, active: true  },
  { id: "ci3", name: "Fortune Atta 5kg",            category: "Grocery",       price: 259,  unit: "per pack",  rx: false, active: true  },
  { id: "ci4", name: "Classmate Notebook A4",       category: "Stationery",    price: 55,   unit: "pack of 6", rx: false, active: true  },
  { id: "ci5", name: "2BHK Shifting",               category: "Shifting",      price: 4500, unit: "starting",  rx: false, active: false },
  { id: "ci6", name: "Chocolate Truffle Cake",      category: "Bakery",        price: 599,  unit: "500g",      rx: false, active: true  },
];

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Pune", "Kolkata"];
const cityMatrix = [
  { id: "cat1", category: "Home Services", vertical: "service", cities: ["Mumbai", "Bengaluru", "Delhi"] },
  { id: "cat2", category: "Grocery",        vertical: "grocery",    cities: ["Mumbai", "Bengaluru", "Delhi", "Chennai", "Hyderabad"] },
  { id: "cat3", category: "Stationery",     vertical: "stationery", cities: ["Mumbai", "Bengaluru", "Delhi", "Pune"] },
  { id: "cat4", category: "Home Shifting",  vertical: "shifting",   cities: ["Mumbai", "Delhi", "Bengaluru"] },
  { id: "cat5", category: "Bakery & Food",  vertical: "bakery",     cities: ["Bengaluru", "Mumbai"] },
];

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full border text-xs ${STATUS_STYLES[status] ?? ""}`}
      style={{ fontFamily: "DM Sans", fontWeight: 500 }}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function VerticalTag({ vertical }: { vertical: string }) {
  const color = VERTICAL_COLOR[vertical] ?? "#666";
  return (
    <span className="px-2 py-0.5 rounded text-xs"
      style={{ background: `${color}20`, color, fontFamily: "DM Sans", fontWeight: 500 }}>
      {vertical}
    </span>
  );
}

// Analytics Dashboard
function AnalyticsPage() {
  const tooltipStyle = {
    backgroundColor: "#0F1830",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#E4ECF7",
    fontFamily: "DM Sans",
    fontSize: "12px",
  };

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Orders", value: "1,250", change: "+12.4%", color: "#FF6B00", icon: Package },
          { label: "Gross Revenue", value: "₹4,50,250", change: "+18.2%", color: "#00D4AA", icon: TrendingUp },
          { label: "Active Providers", value: "85", change: "+5", color: "#3B82F6", icon: Users },
          { label: "Avg Order Value", value: "₹360", change: "+8.7%", color: "#8B5CF6", icon: BarChart3 },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-4" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>{kpi.label}</span>
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
            </div>
            <p style={{ color: kpi.color, fontFamily: "Outfit", fontWeight: 800, fontSize: "1.3rem" }}>{kpi.value}</p>
            <p style={{ color: "#00D4AA", fontSize: "0.72rem", fontFamily: "DM Sans", marginTop: "4px" }}>↑ {kpi.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl p-5" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700, marginBottom: "16px" }}>Revenue by Vertical (₹)</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#6B7FA0", fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7FA0", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
            {Object.entries(VERTICAL_COLOR).map(([key, color]) => (
              <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={color} fill={`${color}30`} strokeWidth={1.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Order volume */}
        <div className="rounded-xl p-5" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700, marginBottom: "16px" }}>Weekly Order Volume</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={orderVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#6B7FA0", fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7FA0", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="orders" fill="#FF6B00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vertical share */}
        <div className="rounded-xl p-5" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700, marginBottom: "16px" }}>Revenue by Vertical</p>
          <div className="flex items-center gap-4">
            <PieChart width={140} height={140}>
              <Pie data={verticalShareData} dataKey="value" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {verticalShareData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="flex-1 space-y-2">
              {verticalShareData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span style={{ color: "#A0B4D0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>{d.name}</span>
                  </div>
                  <span style={{ color: d.color, fontFamily: "Outfit", fontWeight: 700, fontSize: "0.82rem" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Orders Command Center
function OrdersPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filtered = mockAllOrders.filter((o) =>
    (filter === "all" || o.vertical === filter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-48"
          style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search className="w-4 h-4" style={{ color: "#6B7FA0" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or email..."
            className="bg-transparent outline-none flex-1"
            style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem" }} />
        </div>
        <div className="flex gap-1.5">
          {["all", "service", "grocery", "stationery", "shifting", "bakery"].map((v) => (
            <button key={v} onClick={() => setFilter(v)}
              className="px-3 py-2 rounded-xl capitalize text-xs transition-all"
              style={{
                background: filter === v ? (VERTICAL_COLOR[v] ?? "#FF6B00") + "20" : "#111D38",
                border: `1px solid ${filter === v ? (VERTICAL_COLOR[v] ?? "#FF6B00") + "40" : "rgba(255,255,255,0.06)"}`,
                color: filter === v ? (VERTICAL_COLOR[v] ?? "#FF6B00") : "#6B7FA0",
                fontFamily: "DM Sans",
              }}>
              {v === "all" ? "All" : v}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["Order ID", "Customer Email", "Vertical", "Status", "Amount", "Created", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap"
                    style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr key={order.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.78rem" }}>{order.id}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{order.customer}</span>
                  </td>
                  <td className="px-4 py-3"><VerticalTag vertical={order.vertical} /></td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span style={{ color: "#FF6B00", fontFamily: "Outfit", fontWeight: 700, fontSize: "0.875rem" }}>₹{order.amount}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span style={{ color: "#6B7FA0", fontFamily: "JetBrains Mono", fontSize: "0.7rem" }}>{order.created}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedOrder(order.id)}
                      className="px-3 py-1 rounded-lg text-xs"
                      style={{ background: "#8B5CF620", color: "#8B5CF6", border: "1px solid #8B5CF640", fontFamily: "DM Sans", fontWeight: 600 }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Manage Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "#0F1830", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <h3 style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Manage {selectedOrder}</h3>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5" style={{ color: "#6B7FA0" }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label style={{ color: "#A0B4D0", fontSize: "0.78rem", fontFamily: "DM Sans", fontWeight: 600 }}>Reassign Provider</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                  style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)", color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem" }}>
                  <option>Select new provider...</option>
                  <option>Sparkle Home Services</option>
                  <option>NestiGo Grocery Hub</option>
                  <option>PaperHouse Stationery</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button className="py-2.5 rounded-xl text-sm"
                  style={{ background: "#3B82F620", color: "#3B82F6", border: "1px solid #3B82F640", fontFamily: "DM Sans", fontWeight: 600 }}>
                  Reassign
                </button>
                <button className="py-2.5 rounded-xl text-sm"
                  style={{ background: "#F59E0B20", color: "#F59E0B", border: "1px solid #F59E0B40", fontFamily: "DM Sans", fontWeight: 600 }}>
                  Refund
                </button>
                <button className="py-2.5 rounded-xl text-sm"
                  style={{ background: "#FF3B5C20", color: "#FF3B5C", border: "1px solid #FF3B5C40", fontFamily: "DM Sans", fontWeight: 600 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Prescriptions Verification Page
function PrescriptionsPage() {
  const [handled, setHandled] = useState<Record<string, "verified" | "rejected">>({});

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: "#8B5CF610", border: "1px solid #8B5CF630" }}>
        <AlertTriangle className="w-4 h-4" style={{ color: "#8B5CF6" }} />
        <p style={{ color: "#8B5CF6", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem" }}>
          {mockPrescriptions.filter((p) => !handled[p.orderId]).length} prescriptions pending verification
        </p>
      </div>

      {mockPrescriptions.map((rx) => {
        const action = handled[rx.orderId];
        return (
          <div key={rx.orderId} className="rounded-xl overflow-hidden"
            style={{ background: "#0C1225", border: `1px solid ${action === "verified" ? "#00D4AA40" : action === "rejected" ? "#FF3B5C40" : "rgba(255,255,255,0.06)"}` }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span style={{ color: "#E4ECF7", fontFamily: "JetBrains Mono", fontSize: "0.82rem", fontWeight: 600 }}>{rx.orderId}</span>
              <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>· {rx.customer}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded"
                style={{ background: "#8B5CF620", color: "#8B5CF6", fontFamily: "DM Sans" }}>
                Pharma Order
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Document preview */}
              <div className="rounded-xl overflow-hidden relative" style={{ height: "180px", background: "#111D38", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <FileText className="w-10 h-10" style={{ color: "#8B5CF6" }} />
                  <p style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.78rem", fontWeight: 600 }}>Prescription Document</p>
                  <p style={{ color: "#3B4A6B", fontFamily: "JetBrains Mono", fontSize: "0.65rem", textAlign: "center", padding: "0 8px", wordBreak: "break-all" }}>
                    {rx.docUrl}
                  </p>
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs"
                  style={{ background: "#8B5CF6", color: "white", fontFamily: "JetBrains Mono" }}>SIGNED URL ✓</div>
              </div>

              <div className="space-y-4">
                <div>
                  <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Ordered Items</p>
                  <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem", marginTop: "4px" }}>{rx.items}</p>
                </div>
                <div>
                  <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Submitted</p>
                  <p style={{ color: "#A0B4D0", fontFamily: "JetBrains Mono", fontSize: "0.78rem", marginTop: "4px" }}>{rx.created}</p>
                </div>

                {action ? (
                  <div className="rounded-xl p-3 text-center"
                    style={{ background: action === "verified" ? "#00D4AA10" : "#FF3B5C10", border: `1px solid ${action === "verified" ? "#00D4AA30" : "#FF3B5C30"}` }}>
                    <p style={{ color: action === "verified" ? "#00D4AA" : "#FF3B5C", fontFamily: "Outfit", fontWeight: 700 }}>
                      {action === "verified" ? "✓ Prescription Verified" : "✗ Prescription Rejected"}
                    </p>
                    {action === "verified" && <p style={{ color: "#6B7FA0", fontSize: "0.72rem", fontFamily: "DM Sans" }}>Payment captured event emitted → dispatch triggered</p>}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setHandled((p) => ({ ...p, [rx.orderId]: "rejected" }))}
                      className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                      style={{ background: "#FF3B5C15", border: "1px solid #FF3B5C40", color: "#FF3B5C", fontFamily: "Outfit", fontWeight: 700 }}>
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button onClick={() => setHandled((p) => ({ ...p, [rx.orderId]: "verified" }))}
                      className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm"
                      style={{ background: "#00D4AA", color: "#06091A", fontFamily: "Outfit", fontWeight: 700 }}>
                      <CheckCircle2 className="w-4 h-4" /> Verify
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Catalog Manager Page
function CatalogPage() {
  const [items, setItems] = useState(mockCatalogItems);
  const [showCreate, setShowCreate] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "", price: "", unit: "", rx: false });

  const create = () => {
    if (!newItem.name || !newItem.price) return;
    setItems((prev) => [...prev, { id: `ci${Date.now()}`, name: newItem.name, category: newItem.category, price: Number(newItem.price), unit: newItem.unit, rx: newItem.rx, active: true }]);
    setShowCreate(false);
    setNewItem({ name: "", category: "", price: "", unit: "", rx: false });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.82rem" }}>{items.length} catalog items</p>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: "#FF6B00", color: "white", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.82rem" }}>
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: "#0C1225", border: "1px solid #FF6B0030" }}>
          <h4 style={{ color: "#E4ECF7", fontFamily: "Outfit", fontWeight: 700 }}>Create Catalog Item</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { field: "name", label: "Item Name", type: "text" },
              { field: "category", label: "Category", type: "text" },
              { field: "price", label: "Price (₹)", type: "number" },
              { field: "unit", label: "Unit", type: "text" },
            ].map((f) => (
              <div key={f.field}>
                <label style={{ color: "#A0B4D0", fontSize: "0.75rem", fontFamily: "DM Sans", fontWeight: 600 }}>{f.label}</label>
                <input type={f.type}
                  value={newItem[f.field as keyof typeof newItem] as string}
                  onChange={(e) => setNewItem((p) => ({ ...p, [f.field]: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg outline-none"
                  style={{ background: "#111D38", border: "1px solid rgba(255,255,255,0.07)", color: "#E4ECF7", fontFamily: "DM Sans", fontSize: "0.875rem" }} />
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newItem.rx} onChange={(e) => setNewItem((p) => ({ ...p, rx: e.target.checked }))}
              style={{ accentColor: "#8B5CF6" }} />
            <span style={{ color: "#A0B4D0", fontFamily: "DM Sans", fontSize: "0.82rem" }}>Requires Prescription (Rx)</span>
          </label>
          <div className="flex gap-2">
            <button onClick={create} className="px-5 py-2.5 rounded-xl"
              style={{ background: "#FF6B00", color: "white", fontFamily: "DM Sans", fontWeight: 600 }}>Create</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2.5 rounded-xl"
              style={{ background: "#162040", color: "#A0B4D0", fontFamily: "DM Sans" }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Name", "Category", "Price", "Unit", "Rx", "Active", "Edit"].map((h) => (
                <th key={h} className="px-4 py-3 text-left"
                  style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontWeight: 600, fontSize: "0.7rem", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <td className="px-4 py-3">
                  <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 500, fontSize: "0.875rem" }}>{item.name}</p>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{item.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#FF6B00", fontFamily: "Outfit", fontWeight: 700 }}>₹{item.price}</span>
                </td>
                <td className="px-4 py-3">
                  <span style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.78rem" }}>{item.unit}</span>
                </td>
                <td className="px-4 py-3">
                  {item.rx ? <span style={{ color: "#8B5CF6", fontSize: "0.78rem", fontFamily: "DM Sans" }}>Rx</span> : <span style={{ color: "#3B4A6B" }}>—</span>}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, active: !p.active } : p))}>
                    <div className={`w-9 h-5 rounded-full relative transition-all`}
                      style={{ background: item.active ? "#00D4AA" : "#253558" }}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all`}
                        style={{ left: item.active ? "calc(100% - 18px)" : "2px" }} />
                    </div>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button className="p-1.5 rounded-lg"
                    style={{ background: "#FF6B0015", color: "#FF6B00" }}>
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Cities Config Page
function CitiesPage() {
  const [matrix, setMatrix] = useState(cityMatrix);

  const toggleCity = (catId: string, city: string) => {
    setMatrix((prev) => prev.map((cat) => {
      if (cat.id !== catId) return cat;
      const has = cat.cities.includes(city);
      return { ...cat, cities: has ? cat.cities.filter((c) => c !== city) : [...cat.cities, city] };
    }));
  };

  return (
    <div className="space-y-4">
      <p style={{ color: "#6B7FA0", fontFamily: "DM Sans", fontSize: "0.82rem" }}>
        Configure which cities each service category is available in
      </p>
      {matrix.map((cat) => (
        <div key={cat.id} className="rounded-xl p-4" style={{ background: "#0C1225", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${VERTICAL_COLOR[cat.vertical] ?? "#666"}20` }}>
              <Map className="w-4 h-4" style={{ color: VERTICAL_COLOR[cat.vertical] ?? "#666" }} />
            </div>
            <p style={{ color: "#E4ECF7", fontFamily: "DM Sans", fontWeight: 600 }}>{cat.category}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => {
              const active = cat.cities.includes(city);
              return (
                <button key={city} onClick={() => toggleCity(cat.id, city)}
                  className="px-3 py-1 rounded-full text-xs transition-all"
                  style={{
                    background: active ? `${VERTICAL_COLOR[cat.vertical] ?? "#FF6B00"}20` : "#111D38",
                    border: `1px solid ${active ? `${VERTICAL_COLOR[cat.vertical] ?? "#FF6B00"}40` : "rgba(255,255,255,0.07)"}`,
                    color: active ? (VERTICAL_COLOR[cat.vertical] ?? "#FF6B00") : "#6B7FA0",
                    fontFamily: "DM Sans", fontWeight: 500,
                  }}>
                  {active ? "✓ " : ""}{city}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

const navItems = [
  { id: "analytics", label: "Analytics",     icon: BarChart3 },
  { id: "orders",    label: "Orders",         icon: Package,  badge: 7 },
  { id: "catalog",   label: "Catalog",        icon: BookOpen },
  { id: "cities",    label: "City Coverage",  icon: Map },
];

export function AdminPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("analytics");

  return (
    <PortalShell
      portalName="Admin Portal"
      portalColor="#8B5CF6"
      portalIcon={ShieldCheck}
      navItems={navItems}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      userName="Ops Admin"
      userRole="Super Admin"
    >
      {activePage === "analytics" && <AnalyticsPage />}
      {activePage === "orders" && <OrdersPage />}
      {activePage === "catalog" && <CatalogPage />}
      {activePage === "cities" && <CitiesPage />}
    </PortalShell>
  );
}

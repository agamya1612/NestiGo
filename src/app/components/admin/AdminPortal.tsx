import { useState } from "react";
import {
  Package, FileText, LayoutDashboard, BookOpen, Map, BarChart3,
  TrendingUp, Users, CheckCircle2, XCircle, Edit3, Plus, Search,
  ShieldCheck, AlertTriangle, ChevronDown, X, ClipboardCheck, Camera
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import { PortalShell } from "../PortalShell";

// Shadcn UI Components
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/app/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Switch } from "@/app/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Label } from "@/app/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

const VERTICAL_COLOR: Record<string, string> = {
  service:    "#7C3AED",
  grocery:    "#22C55E",
  stationery: "#6366F1",
  shifting:   "#38BDF8",
  bakery:     "#EC4899",
};

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "text-warning bg-warning/10 border-warning/20",
  paid: "text-info bg-info/10 border-info/20",
  confirmed: "text-info bg-info/10 border-info/20",
  picked_up: "text-primary bg-primary/10 border-primary/20",
  completed: "text-success bg-success/10 border-success/20",
  cancelled: "text-destructive bg-destructive/10 border-destructive/20",
  refunded: "text-warning bg-warning/10 border-warning/20",
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
    <span className={`px-2 py-0.5 rounded-full border text-xs font-[family-name:var(--font-body)] font-medium ${STATUS_STYLES[status] ?? ""}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function VerticalTag({ vertical }: { vertical: string }) {
  const color = VERTICAL_COLOR[vertical] ?? "#666";
  return (
    <span className="px-2 py-0.5 rounded text-xs font-[family-name:var(--font-body)] font-medium"
      style={{ background: `${color}20`, color }}>
      {vertical}
    </span>
  );
}

// Analytics Dashboard
function AnalyticsPage() {
  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
    fontFamily: "var(--font-body)",
    fontSize: "12px",
  };

  return (
    <div className="space-y-5 page-enter">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Orders", value: "1,250", change: "+12.4%", color: "var(--accent)", icon: Package },
          { label: "Gross Revenue", value: "₹4,50,250", change: "+18.2%", color: "var(--success)", icon: TrendingUp },
          { label: "Active Providers", value: "85", change: "+5", color: "var(--info)", icon: Users },
          { label: "Avg Order Value", value: "₹360", change: "+8.7%", color: "var(--primary)", icon: BarChart3 },
        ].map((kpi) => (
          <Card key={kpi.label} className="hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">{kpi.label}</span>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <p className="text-xl md:text-2xl font-bold font-[family-name:var(--font-heading)]" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs text-success font-[family-name:var(--font-body)] mt-1">↑ {kpi.change} vs last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card className="hover-lift">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Revenue by Vertical (₹)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
                {Object.entries(VERTICAL_COLOR).map(([key, color]) => (
                  <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={color} fill={`${color}30`} strokeWidth={1.5} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
        {/* Order volume */}
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Weekly Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="orders" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Vertical share */}
        <Card className="hover-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold font-[family-name:var(--font-heading)]">Revenue Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[160px] w-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={verticalShareData} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={3}>
                      {verticalShareData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {verticalShareData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">{d.name}</span>
                    </div>
                    <span className="text-sm font-bold font-[family-name:var(--font-heading)]" style={{ color: d.color }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-4 page-enter">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search by order ID or email..."
            className="pl-9 font-[family-name:var(--font-body)]"
            aria-label="Search orders"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "service", "grocery", "stationery", "shifting", "bakery"].map((v) => {
            const isSelected = filter === v;
            const vColor = VERTICAL_COLOR[v] || "var(--accent)";
            return (
              <Button 
                key={v} 
                onClick={() => setFilter(v)}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="capitalize font-[family-name:var(--font-body)]"
                style={isSelected ? { backgroundColor: `${vColor}20`, color: vColor, borderColor: `${vColor}40` } : {}}
              >
                {v === "all" ? "All" : v}
              </Button>
            );
          })}
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Order ID", "Customer Email", "Vertical", "Status", "Amount", "Created", "Actions"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-[family-name:var(--font-body)]">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium">No orders found</p>
                      <p className="text-xs">Try adjusting your filters or search query</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-[family-name:var(--font-mono)] text-sm">{order.id}</TableCell>
                    <TableCell className="font-[family-name:var(--font-body)] text-sm text-muted-foreground">{order.customer}</TableCell>
                    <TableCell><VerticalTag vertical={order.vertical} /></TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell className="font-[family-name:var(--font-heading)] font-bold text-accent">₹{order.amount}</TableCell>
                    <TableCell className="font-[family-name:var(--font-mono)] text-xs text-muted-foreground">{order.created}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="h-8 text-xs font-[family-name:var(--font-body)]"
                        onClick={() => setSelectedOrder(order.id)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Order Manage Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-heading)]">Manage {selectedOrder}</DialogTitle>
            <DialogDescription className="font-[family-name:var(--font-body)] text-sm">
              Take actions on the selected order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Reassign Provider</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select new provider..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sparkle">Sparkle Home Services</SelectItem>
                  <SelectItem value="nestigo">NestiGo Grocery Hub</SelectItem>
                  <SelectItem value="paperhouse">PaperHouse Stationery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="text-info border-info/40 bg-info/10 hover:bg-info/20 hover:text-info"
                onClick={() => { alert("Order reassigned"); setSelectedOrder(null); }}
              >
                Reassign
              </Button>
              <Button 
                variant="outline" 
                className="text-warning border-warning/40 bg-warning/10 hover:bg-warning/20 hover:text-warning"
                onClick={() => { alert("Refund initiated"); setSelectedOrder(null); }}
              >
                Refund
              </Button>
              <Button 
                variant="outline" 
                className="text-destructive border-destructive/40 bg-destructive/10 hover:bg-destructive/20 hover:text-destructive"
                onClick={() => { alert("Order cancelled"); setSelectedOrder(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prescriptions Verification Page
function PrescriptionsPage() {
  const [handled, setHandled] = useState<Record<string, "verified" | "rejected">>({});

  const pendingCount = mockPrescriptions.filter((p) => !handled[p.orderId]).length;

  return (
    <div className="space-y-4 max-w-4xl page-enter">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <p className="text-sm font-semibold text-primary font-[family-name:var(--font-body)]">
          {pendingCount} prescriptions pending verification
        </p>
      </div>

      {mockPrescriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ClipboardCheck className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-base font-medium">No pending prescriptions</p>
            <p className="text-sm">All uploaded prescriptions have been verified.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 stagger-children">
          {mockPrescriptions.map((rx) => {
            const action = handled[rx.orderId];
            return (
              <Card key={rx.orderId} className={`overflow-hidden ${action === "verified" ? "border-success/40" : action === "rejected" ? "border-destructive/40" : ""}`}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
                  <span className="font-[family-name:var(--font-mono)] text-sm font-bold">{rx.orderId}</span>
                  <span className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">· {rx.customer}</span>
                  <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary hover:bg-primary/30">
                    Pharma Order
                  </Badge>
                </div>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Document preview */}
                  <div className="rounded-xl overflow-hidden relative h-[200px] bg-surface-2 border border-border flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-primary mb-2" />
                    <p className="text-sm font-semibold text-muted-foreground font-[family-name:var(--font-body)]">Prescription Document</p>
                    <p className="text-xs text-muted-foreground/80 font-[family-name:var(--font-mono)] mt-2 text-center px-4 break-all">
                      {rx.docUrl}
                    </p>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold bg-primary text-primary-foreground font-[family-name:var(--font-mono)]">
                      SIGNED URL ✓
                    </div>
                  </div>

                  <div className="space-y-5 flex flex-col justify-center">
                    <div>
                      <p className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">Ordered Items</p>
                      <p className="text-sm font-medium mt-1 font-[family-name:var(--font-body)]">{rx.items}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-[family-name:var(--font-body)]">Submitted</p>
                      <p className="text-sm font-[family-name:var(--font-mono)] text-muted-foreground mt-1">{rx.created}</p>
                    </div>

                    {action ? (
                      <div className={`rounded-xl p-4 text-center border ${action === "verified" ? "bg-success/10 border-success/30" : "bg-destructive/10 border-destructive/30"}`}>
                        <p className={`font-bold font-[family-name:var(--font-heading)] ${action === "verified" ? "text-success" : "text-destructive"}`}>
                          {action === "verified" ? "✓ Prescription Verified" : "✗ Prescription Rejected"}
                        </p>
                        {action === "verified" && <p className="text-xs text-muted-foreground mt-1 font-[family-name:var(--font-body)]">Payment captured event emitted → dispatch triggered</p>}
                      </div>
                    ) : (
                      <div className="flex gap-3 mt-auto pt-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setHandled((p) => ({ ...p, [rx.orderId]: "rejected" }))}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => setHandled((p) => ({ ...p, [rx.orderId]: "verified" }))}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Verify
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
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
    <div className="space-y-4 page-enter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">{items.length} catalog items</p>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {showCreate && (
        <Card className="border-accent/30 bg-surface-1 animate-scale-in">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-heading)]">Create Catalog Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: "name", label: "Item Name", type: "text" },
                { field: "category", label: "Category", type: "text" },
                { field: "price", label: "Price (₹)", type: "number" },
                { field: "unit", label: "Unit", type: "text" },
              ].map((f) => (
                <div key={f.field} className="space-y-1">
                  <Label htmlFor={`new-item-${f.field}`} className="text-xs font-semibold text-muted-foreground">{f.label}</Label>
                  <Input 
                    id={`new-item-${f.field}`}
                    type={f.type}
                    value={newItem[f.field as keyof typeof newItem] as string}
                    onChange={(e) => setNewItem((p) => ({ ...p, [f.field]: e.target.value }))}
                    className="bg-background"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="rx-mode" 
                checked={newItem.rx} 
                onCheckedChange={(c) => setNewItem((p) => ({ ...p, rx: c }))}
                aria-label="Requires Prescription"
              />
              <Label htmlFor="rx-mode" className="text-sm text-muted-foreground cursor-pointer">Requires Prescription (Rx)</Label>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={create} className="bg-accent hover:bg-accent/90 text-accent-foreground">Create</Button>
            <Button onClick={() => setShowCreate(false)} variant="secondary">Cancel</Button>
          </CardFooter>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {["Name", "Category", "Price", "Unit", "Rx", "Active", "Edit"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-[family-name:var(--font-body)]">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium font-[family-name:var(--font-body)] text-sm">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-[family-name:var(--font-body)]">{item.category}</TableCell>
                  <TableCell className="font-bold font-[family-name:var(--font-heading)] text-accent">₹{item.price}</TableCell>
                  <TableCell className="text-muted-foreground text-sm font-[family-name:var(--font-body)]">{item.unit}</TableCell>
                  <TableCell>
                    {item.rx ? <Badge variant="secondary" className="bg-primary/20 text-primary">Rx</Badge> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={item.active} 
                      onCheckedChange={() => setItems((prev) => prev.map((p) => p.id === item.id ? { ...p, active: !p.active } : p))}
                      aria-label={`Toggle active status for ${item.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10" aria-label="Edit item">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
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
    <div className="space-y-4 page-enter">
      <p className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">
        Configure which cities each service category is available in
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
        {matrix.map((cat) => (
          <Card key={cat.id} className="hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${VERTICAL_COLOR[cat.vertical] ?? "#666"}20` }}>
                  <Map className="w-4 h-4" style={{ color: VERTICAL_COLOR[cat.vertical] ?? "#666" }} />
                </div>
                <CardTitle className="text-base font-semibold font-[family-name:var(--font-body)]">{cat.category}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => {
                  const active = cat.cities.includes(city);
                  return (
                    <Button 
                      key={city} 
                      onClick={() => toggleCity(cat.id, city)}
                      variant={active ? "default" : "outline"}
                      size="sm"
                      className="rounded-full h-7 text-xs font-[family-name:var(--font-body)]"
                      style={active ? { backgroundColor: `${VERTICAL_COLOR[cat.vertical] ?? "var(--accent)"}20`, color: (VERTICAL_COLOR[cat.vertical] ?? "var(--accent)"), borderColor: `${VERTICAL_COLOR[cat.vertical] ?? "var(--accent)"}40` } : {}}
                    >
                      {active ? "✓ " : ""}{city}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Profile Settings Page
function ProfilePage({ name, email, role, avatar, onSave }: { name: string, email: string, role: string, avatar: string, onSave: (n: string, e: string, r: string, a: string) => void }) {
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editRole, setEditRole] = useState(role);
  const [editAvatar, setEditAvatar] = useState(avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSave(editName, editEmail, editRole, editAvatar);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-2xl space-y-6 page-enter">
      <div>
        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-foreground">Profile Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your administrator account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your profile information and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-2 border-border shadow-sm">
                {editAvatar && <AvatarImage src={editAvatar} alt={editName} className="object-cover" />}
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {editName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm font-medium">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    Upload new picture
                  </div>
                </Label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <p className="text-xs text-muted-foreground mt-2 font-[family-name:var(--font-body)]">JPG, GIF or PNG. Max size of 2MB</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name" className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                <Input 
                  id="profile-name" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-role" className="text-xs font-semibold text-muted-foreground">Role</Label>
                <Input 
                  id="profile-role" 
                  value={editRole} 
                  onChange={(e) => setEditRole(e.target.value)} 
                  required 
                  className="bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile-email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
              <Input 
                id="profile-email" 
                type="email"
                value={editEmail} 
                onChange={(e) => setEditEmail(e.target.value)} 
                required 
                className="bg-background"
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              {showSuccess && (
                <span className="text-sm text-success flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Profile updated
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const navItems = [
  { id: "analytics",     label: "Analytics",      icon: BarChart3 },
  { id: "orders",        label: "Orders",         icon: Package,  badge: 7 },
  { id: "prescriptions", label: "Prescriptions",  icon: ClipboardCheck },
  { id: "catalog",       label: "Catalog",        icon: BookOpen },
  { id: "cities",        label: "City Coverage",  icon: Map },
];

export function AdminPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("analytics");
  const [adminName, setAdminName] = useState("Ops Admin");
  const [adminRole, setAdminRole] = useState("Super Admin");
  const [adminEmail, setAdminEmail] = useState("ops.admin@nestigo.com");
  const [adminAvatar, setAdminAvatar] = useState("");

  return (
    <PortalShell
      portalName="Admin Portal"
      portalColor="#8B5CF6"
      portalIcon={ShieldCheck}
      navItems={navItems}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      userName={adminName}
      userRole={adminRole}
      userAvatarUrl={adminAvatar}
    >
      {activePage === "analytics" && <AnalyticsPage />}
      {activePage === "orders" && <OrdersPage />}
      {activePage === "prescriptions" && <PrescriptionsPage />}
      {activePage === "catalog" && <CatalogPage />}
      {activePage === "cities" && <CitiesPage />}
      {activePage === "profile" && (
        <ProfilePage 
          name={adminName} 
          email={adminEmail} 
          role={adminRole} 
          avatar={adminAvatar}
          onSave={(name, email, role, avatar) => {
            setAdminName(name);
            setAdminEmail(email);
            setAdminRole(role);
            setAdminAvatar(avatar);
          }}
        />
      )}
    </PortalShell>
  );
}

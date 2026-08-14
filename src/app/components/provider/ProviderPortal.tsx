import { useState, useEffect } from "react";
import {
  LayoutDashboard, Briefcase, FileCheck, Package, Grid3x3, Wallet,
  CheckCircle2, XCircle, Clock, AlertTriangle, Plus, Minus, Upload,
  TrendingUp, Star, MapPin, Wrench, User, Settings, Camera, ShieldCheck
} from "lucide-react";
import { PortalShell } from "../PortalShell";

// Shadcn imports
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/app/components/ui/table";
import { Switch } from "@/app/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Progress } from "@/app/components/ui/progress";
import { Label } from "@/app/components/ui/label";

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
  return (
    <Badge 
      variant={status === "verified" ? "default" : status === "pending" ? "secondary" : "destructive"}
      className={`font-[family-name:var(--font-body)] ${status === 'verified' ? 'bg-success text-success-foreground' : status === 'pending' ? 'bg-warning text-warning-foreground' : ''}`}
    >
      {status}
    </Badge>
  );
}

// Dashboard Page
function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="space-y-5 page-enter">
      {/* KYC Warning */}
      <Card className="bg-warning/10 border-warning/30 hover-lift">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning" />
          <div className="flex-1">
            <p className="text-warning font-[family-name:var(--font-body)] font-semibold text-sm">KYC Pending</p>
            <p className="text-muted-foreground text-xs font-[family-name:var(--font-body)]">Trade License is under review. Upload to enable all features.</p>
          </div>
          <Button 
            size="sm" 
            className="w-full sm:w-auto bg-warning text-warning-foreground hover:bg-warning/90 font-[family-name:var(--font-body)] font-bold"
            onClick={() => onNavigate("kyc")}
          >
            Upload
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Active Orders", value: "3", color: "#FF6B00", icon: Briefcase },
          { label: "Today's Earnings", value: "₹2,340", color: "#00D4AA", icon: TrendingUp },
          { label: "Rating", value: "4.7 ★", color: "#F59E0B", icon: Star },
          { label: "Completed Jobs", value: "128", color: "#3B82F6", icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-border shadow-sm hover-lift">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-xs font-[family-name:var(--font-body)]">{s.label}</span>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <p className="font-[family-name:var(--font-heading)] font-extrabold text-xl sm:text-2xl" style={{ color: s.color }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Orders */}
      <Card className="bg-card border-border shadow-sm overflow-hidden hover-lift">
        <CardHeader className="px-4 py-3 border-b border-border bg-muted/30">
          <CardTitle className="text-foreground font-[family-name:var(--font-heading)] font-bold text-base">Active Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {[
              { id: "ORD-2026-4850", type: "service",    customer: "Priya Sharma",  status: "picked_up", payout: 799 },
              { id: "ORD-2026-4812", type: "grocery",    customer: "Vikram Nair",   status: "confirmed", payout: 285 },
              { id: "ORD-2026-4791", type: "stationery", customer: "Anjali Singh",  status: "confirmed", payout: 180 },
            ].map((o, i) => (
              <div key={o.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                <Avatar className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: `${VERTICAL_COLOR[o.type]}20` }}>
                  <AvatarFallback className="bg-transparent">
                    <Wrench className="w-3.5 h-3.5" style={{ color: VERTICAL_COLOR[o.type] }} />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-[family-name:var(--font-mono)] text-xs font-semibold truncate">{o.id}</p>
                  <p className="text-muted-foreground text-xs font-[family-name:var(--font-body)] truncate">{o.customer}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-success font-[family-name:var(--font-heading)] font-bold text-sm">₹{o.payout}</p>
                  <span className={`text-xs font-[family-name:var(--font-body)] ${o.status === "picked_up" ? "text-primary" : "text-info"}`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Provider toggle */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <Label htmlFor="availability-toggle" className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm cursor-pointer">Availability Status</Label>
            <p className="text-muted-foreground text-xs font-[family-name:var(--font-body)] mt-0.5">Accept new orders when active</p>
          </div>
          <div className="flex items-center gap-3">
            {isOnline && (
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-success font-[family-name:var(--font-body)] font-semibold text-xs">ACTIVE</span>
              </div>
            )}
            <Switch 
              id="availability-toggle" 
              checked={isOnline} 
              onCheckedChange={setIsOnline} 
              aria-label="Toggle availability"
            />
          </div>
        </CardContent>
      </Card>
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

  const allExpiredOrHandled = mockAssignments.every(a => handled[a.id] || (timers[a.id] ?? 0) <= 0);

  return (
    <div className="space-y-4 page-enter">
      {!allExpiredOrHandled && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-info/10 border border-info/20 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-info animate-pulse" />
          <p className="text-info font-[family-name:var(--font-body)] font-semibold text-xs sm:text-sm">
            New job offers — respond before they expire
          </p>
        </div>
      )}

      {allExpiredOrHandled && (
        <div className="empty-state flex flex-col items-center justify-center p-12 text-center bg-card border border-border rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm font-medium font-[family-name:var(--font-heading)] text-foreground">No active assignments</p>
          <p className="text-xs text-muted-foreground font-[family-name:var(--font-body)] mt-1">All offers have been handled or expired.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {mockAssignments.map((a) => {
          const timeLeft = timers[a.id] ?? 0;
          const action = handled[a.id];
          const isExpired = !action && timeLeft <= 0;
          const color = VERTICAL_COLOR[a.type] ?? "#FF6B00";

          if (isExpired && !action) return null; // Optionally hide expired, or just show them. We'll show handled ones.

          return (
            <Card key={a.id} className="bg-card overflow-hidden hover-lift"
              style={{ borderColor: action === "accepted" ? "var(--success)" : action === "declined" ? "var(--destructive)" : `${color}40` }}>
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-border/50 space-y-0"
                style={{ background: `${color}08` }}>
                <div className="flex items-center gap-2">
                  <span style={{ color }} className="font-[family-name:var(--font-mono)] font-semibold text-xs">{a.id}</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-[family-name:var(--font-body)]" style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}>
                    {a.type}
                  </Badge>
                </div>
                {!action && (
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 ${timeLeft > 2 ? 'text-warning' : 'text-destructive'}`} />
                    <span className={`font-[family-name:var(--font-mono)] font-bold text-sm ${timeLeft > 2 ? 'text-warning' : 'text-destructive'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                )}
                {action && (
                  <span className={`font-[family-name:var(--font-body)] font-semibold text-xs ${action === "accepted" ? "text-success" : "text-destructive"}`}>
                    {action === "accepted" ? "✓ Accepted" : "✗ Declined"}
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase font-[family-name:var(--font-body)] mb-0.5">Customer</p>
                    <p className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm truncate">{a.customer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase font-[family-name:var(--font-body)] mb-0.5">Distance</p>
                    <p className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm flex items-center">
                      <MapPin className="w-3 h-3 mr-1" style={{ color }} />{a.distance}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-[10px] uppercase font-[family-name:var(--font-body)] mb-0.5">Items</p>
                    <p className="text-foreground/80 font-[family-name:var(--font-body)] text-xs line-clamp-1">{a.items}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-[10px] uppercase font-[family-name:var(--font-body)] mb-0.5">Payout</p>
                    <p className="text-success font-[family-name:var(--font-heading)] font-extrabold text-lg">₹{a.payout}</p>
                  </div>
                </div>

                {/* Countdown bar */}
                {!action && (
                  <Progress value={(timeLeft / a.expires) * 100} className={`h-1.5 [&>div]:transition-all [&>div]:duration-1000 ${timeLeft > 2 ? '[&>div]:bg-warning' : '[&>div]:bg-destructive'}`} />
                )}
              </CardContent>
              {!action && (
                <CardFooter className="px-4 pb-4 pt-0 gap-3">
                  <Button variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-[family-name:var(--font-heading)] font-bold"
                    onClick={() => setHandled((p) => ({ ...p, [a.id]: "declined" }))}>
                    <XCircle className="w-4 h-4 mr-2" /> Decline
                  </Button>
                  <Button className="flex-1 bg-success hover:bg-success/90 text-success-foreground font-[family-name:var(--font-heading)] font-bold"
                    onClick={() => setHandled((p) => ({ ...p, [a.id]: "accepted" }))}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                  </Button>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// KYC Page
function KycPage() {
  const [uploading, setUploading] = useState<string | null>(null);

  const reqDocs = [
    { id: "profile", title: "Profile Picture", desc: "Clear face photo (JPG/PNG)", status: "pending", icon: User, required: true },
    { id: "aadhar", title: "Aadhar Card", desc: "Front & Back copy (PDF/JPG)", status: "verified", icon: FileCheck, required: true },
    { id: "pan", title: "PAN Card", desc: "For tax compliance (PDF/JPG)", status: "verified", icon: FileCheck, required: true },
    { id: "police", title: "Police Verification", desc: "Background check certificate", status: "pending", icon: ShieldCheck, required: true },
    { id: "gst", title: "GST / Shop Act", desc: "Business registration proof", status: "pending", icon: Briefcase, required: false },
    { id: "bank", title: "Cancelled Cheque", desc: "For daily settlements", status: "pending", icon: Wallet, required: true },
  ];

  const handleUpload = (id: string) => {
    setUploading(id);
    setTimeout(() => setUploading(null), 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl page-enter">
      <div>
        <h2 className="text-foreground font-[family-name:var(--font-heading)] font-bold text-xl">KYC & Verification</h2>
        <p className="text-muted-foreground font-[family-name:var(--font-body)] text-sm mt-1">Complete your documentation to activate your provider account and receive payouts.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
        {reqDocs.map((doc) => {
          const Icon = doc.icon;
          const isVerified = doc.status === "verified";
          const isUploading = uploading === doc.id;
          
          return (
            <Card key={doc.id} className={`flex flex-col relative overflow-hidden transition-all hover-lift ${isVerified ? 'border-success/40 bg-success/5' : 'bg-card border-border shadow-sm'}`}>
              <CardContent className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className={`w-10 h-10 rounded-xl ${isVerified ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'}`}>
                      <AvatarFallback className="bg-transparent">
                        <Icon className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-foreground font-[family-name:var(--font-heading)] font-bold text-sm flex items-center gap-1">
                        {doc.title} {doc.required && <span className="text-destructive">*</span>}
                      </h3>
                      <p className="text-muted-foreground font-[family-name:var(--font-body)] text-xs mt-0.5">{doc.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  {isVerified ? (
                    <div className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-success/10 border border-success/20">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span className="text-success font-[family-name:var(--font-body)] font-semibold text-xs">Verified & Approved</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div 
                        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer transition-colors hover:bg-muted/50"
                        role="button"
                        tabIndex={0}
                        aria-label={`Upload ${doc.title}`}
                      >
                        <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground font-[family-name:var(--font-body)] font-semibold text-xs">Drop file here to upload</p>
                      </div>
                      <Button 
                        onClick={() => handleUpload(doc.id)}
                        disabled={isUploading}
                        className="w-full font-[family-name:var(--font-heading)] font-bold"
                      >
                        {isUploading ? (
                          <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" /> Uploading...</>
                        ) : "Submit Document"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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
    <div className="space-y-4 page-enter">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-1 border border-border">
        <Package className="w-4 h-4 text-muted-foreground" />
        <Input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Search inventory..."
          className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-1 font-[family-name:var(--font-body)] h-auto"
          aria-label="Search inventory"
        />
      </div>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-[family-name:var(--font-body)] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Item</TableHead>
                <TableHead className="font-[family-name:var(--font-body)] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">SKU</TableHead>
                <TableHead className="font-[family-name:var(--font-body)] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Location</TableHead>
                <TableHead className="font-[family-name:var(--font-body)] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Stock</TableHead>
                <TableHead className="font-[family-name:var(--font-body)] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Price</TableHead>
                <TableHead className="font-[family-name:var(--font-body)] font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Adjust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm font-medium font-[family-name:var(--font-body)]">No items found</p>
                      <p className="text-xs opacity-70 font-[family-name:var(--font-body)] mt-1">Try adjusting your search</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => {
                  const low = item.stock < 20;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="py-3 min-w-[150px]">
                        <p className="text-foreground font-[family-name:var(--font-body)] font-medium text-sm truncate">{item.name}</p>
                        <Badge variant="outline" className="text-[10px] mt-1 font-[family-name:var(--font-body)]"
                          style={{ borderColor: `${VERTICAL_COLOR[item.category] ?? "#666"}40`, color: VERTICAL_COLOR[item.category] ?? "#666", backgroundColor: `${VERTICAL_COLOR[item.category] ?? "#666"}10` }}>
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-muted-foreground font-[family-name:var(--font-mono)] text-xs">{item.sku}</TableCell>
                      <TableCell className="py-3 text-muted-foreground font-[family-name:var(--font-body)] text-xs min-w-[120px]">{item.location}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-[family-name:var(--font-heading)] font-bold text-sm ${low ? "text-destructive" : "text-success"}`}>
                            {item.stock}
                          </span>
                          {low && <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">LOW</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-foreground font-[family-name:var(--font-heading)] font-semibold text-sm">₹{item.price}</TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Button size="icon" variant="outline" className="w-7 h-7 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => adjust(item.id, -5)} aria-label={`Decrease ${item.name} stock`}>
                            <Minus className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="icon" variant="outline" className="w-7 h-7 border-success text-success hover:bg-success/10"
                            onClick={() => adjust(item.id, 10)} aria-label={`Increase ${item.name} stock`}>
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
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
    <div className="max-w-2xl space-y-3 page-enter stagger-children">
      {categories.map((cat) => (
        <Card key={cat.name} className="bg-card border-border shadow-sm hover-lift">
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: `${VERTICAL_COLOR[cat.vertical]}20` }}>
              <AvatarFallback className="bg-transparent">
                <Grid3x3 className="w-5 h-5" style={{ color: VERTICAL_COLOR[cat.vertical] }} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm truncate">{cat.name}</p>
              <p className="text-muted-foreground text-xs font-[family-name:var(--font-body)] truncate mt-0.5 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />{cat.city}
              </p>
            </div>
            <Badge variant={cat.active ? "default" : "secondary"} 
              className={`font-[family-name:var(--font-body)] ${cat.active ? 'bg-success/15 text-success hover:bg-success/20' : ''}`}>
              {cat.active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Provider Wallet Page
function ProviderWalletPage() {
  return (
    <div className="max-w-xl space-y-4 page-enter">
      <Card className="relative overflow-hidden bg-gradient-to-br from-card to-surface-2 border-primary/20 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground font-[family-name:var(--font-body)] text-xs uppercase tracking-wider font-semibold">Provider Settlement Wallet</span>
          </div>
          <p className="text-primary font-[family-name:var(--font-heading)] font-extrabold text-3xl sm:text-4xl tracking-tight">
            ₹28,400.00
          </p>
          <p className="text-muted-foreground font-[family-name:var(--font-body)] text-xs mt-1">80% of completed order settlements</p>
          <div className="mt-5 flex gap-3">
            <Button 
              className="flex-1 font-[family-name:var(--font-body)] font-bold shadow-primary"
              onClick={() => alert("Withdrawal initiated successfully!")}
            >
              Withdraw Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="px-4 py-3 border-b border-border bg-muted/30">
          <CardTitle className="text-foreground font-[family-name:var(--font-heading)] font-bold text-base">Settlement History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {[
              { id: "STL-8921", order: "ORD-2026-4850", amount: 639, date: "2026-07-27", status: "processed" },
              { id: "STL-8908", order: "ORD-2026-4812", amount: 228, date: "2026-07-26", status: "processed" },
              { id: "STL-8895", order: "ORD-2026-4780", amount: 479, date: "2026-07-25", status: "processed" },
              { id: "STL-8880", order: "ORD-2026-4760", amount: 3600, date: "2026-07-24", status: "pending" },
            ].map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-[family-name:var(--font-mono)] font-medium text-xs truncate">{s.id}</p>
                  <p className="text-muted-foreground text-[11px] font-[family-name:var(--font-body)] truncate mt-0.5">{s.order} · {s.date}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-success font-[family-name:var(--font-heading)] font-bold text-sm">+₹{s.amount}</p>
                  <span className={`text-[10px] uppercase font-[family-name:var(--font-body)] font-semibold mt-0.5 ${s.status === "processed" ? "text-success" : "text-warning"}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Profile Management & Settings Page
function ProfilePage({ details, onSave }: { details: any, onSave: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [businessName, setBusinessName] = useState(details.businessName);
  const [city, setCity] = useState(details.city);
  const [email, setEmail] = useState(details.email);
  const [phone, setPhone] = useState(details.phone);
  const [isSaved, setIsSaved] = useState(false);

  // Toggle states
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ businessName, city, email, phone });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6 page-enter">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3 pt-2 font-[family-name:var(--font-body)] font-medium text-sm"
          >
            Profile Management
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 pb-3 pt-2 font-[family-name:var(--font-body)] font-medium text-sm"
          >
            Account Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground font-[family-name:var(--font-heading)] font-bold text-base">Business Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="text-muted-foreground text-xs font-[family-name:var(--font-body)] font-semibold uppercase tracking-wider">Business Name</Label>
                    <Input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="font-[family-name:var(--font-body)] text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-muted-foreground text-xs font-[family-name:var(--font-body)] font-semibold uppercase tracking-wider">Operating City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="font-[family-name:var(--font-body)] text-sm" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-foreground font-[family-name:var(--font-heading)] font-bold text-base">Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground text-xs font-[family-name:var(--font-body)] font-semibold uppercase tracking-wider">Email Address</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="font-[family-name:var(--font-body)] text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-muted-foreground text-xs font-[family-name:var(--font-body)] font-semibold uppercase tracking-wider">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="font-[family-name:var(--font-body)] text-sm" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={isSaved} variant={isSaved ? "outline" : "default"} 
                className={`px-6 font-[family-name:var(--font-heading)] font-bold ${isSaved ? 'border-success text-success bg-success/5' : ''}`}>
                {isSaved ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved Successfully</> : "Save Changes"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <Card className="bg-card border-border shadow-sm animate-fade-in-up">
            <CardHeader>
              <CardTitle className="text-foreground font-[family-name:var(--font-heading)] font-bold text-base">Account Preferences</CardTitle>
              <CardDescription className="font-[family-name:var(--font-body)] text-sm">Manage your notifications and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <Label htmlFor="push-toggle" className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm cursor-pointer">Push Notifications</Label>
                  <p className="text-muted-foreground font-[family-name:var(--font-body)] text-xs mt-0.5">Receive alerts for new orders</p>
                </div>
                <Switch id="push-toggle" checked={pushEnabled} onCheckedChange={setPushEnabled} aria-label="Toggle push notifications" />
              </div>

              <div className="flex items-center justify-between p-6 border-b border-border">
                <div>
                  <Label htmlFor="sms-toggle" className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm cursor-pointer">SMS Alerts</Label>
                  <p className="text-muted-foreground font-[family-name:var(--font-body)] text-xs mt-0.5">Get SMS for important updates</p>
                </div>
                <Switch id="sms-toggle" checked={smsEnabled} onCheckedChange={setSmsEnabled} aria-label="Toggle SMS alerts" />
              </div>
              
              <div className="flex items-center justify-between p-6">
                <div>
                  <Label htmlFor="2fa-toggle" className="text-foreground font-[family-name:var(--font-body)] font-semibold text-sm cursor-pointer">Two-Factor Authentication</Label>
                  <p className="text-muted-foreground font-[family-name:var(--font-body)] text-xs mt-0.5">Enhance account security</p>
                </div>
                <Switch id="2fa-toggle" checked={twoFaEnabled} onCheckedChange={setTwoFaEnabled} aria-label="Toggle Two-Factor Authentication" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
  { id: "profile", label: "Profile", icon: User },
];

export function ProviderPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [providerDetails, setProviderDetails] = useState({
    businessName: "Sparkle Home Services",
    email: "contact@sparkleservices.com",
    phone: "+91 98765 43210",
    city: "Bengaluru"
  });

  return (
    <PortalShell
      portalName="Provider Portal"
      portalColor="#3B82F6"
      portalIcon={Wrench}
      navItems={navItems}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      userName={providerDetails.businessName}
      userRole="Service Provider"
    >
      {activePage === "dashboard" && <DashboardPage onNavigate={setActivePage} />}
      {activePage === "assignments" && <AssignmentsPage />}
      {activePage === "kyc" && <KycPage />}
      {activePage === "inventory" && <InventoryPage />}
      {activePage === "categories" && <CategoriesPage />}
      {activePage === "wallet" && <ProviderWalletPage />}
      {activePage === "profile" && <ProfilePage details={providerDetails} onSave={setProviderDetails} />}
    </PortalShell>
  );
}

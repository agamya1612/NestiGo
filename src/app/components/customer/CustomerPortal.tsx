import { useState, useRef, useEffect, createContext, useContext } from "react";
import stationeryImg from "@/imports/Stationery-Item.jpg";
import { Home, Search, ShoppingCart, Package, User, Star, MessageSquare, MapPin, ChevronRight, Plus, Minus, X, Truck, CheckCircle2, AlertCircle, Move, Cake, Wrench, Navigation, BookMarked, CreditCard, Upload, Send, ThumbsUp, Flag, Zap, Bell, Heart, Clock, ChevronDown, Wallet, ArrowRight, Flame, Gift, Phone, LogOut, Settings, ChevronLeft, Tag, Filter, Sparkles, Copy, Check, ToggleLeft, ToggleRight, Trash2, Edit2, Navigation2, Briefcase, Users, Car, UtensilsCrossed, Paintbrush, Hammer, Wind, ChefHat, Scissors, Shirt, PartyPopper, Droplets, Mail, Linkedin, Globe, Quote } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Label } from "@/app/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#7C3AED", pink: "#D946EF", orange: "#F59E0B", blue: "#38BDF8", cyan: "#06B6D4", success: "#22C55E", danger: "#EF4444", dark: "#0B1020", darkCard: "#141B2D", heading: "#111827", body: "#4B5563", secondary: "#6B7280", muted: "#9CA3AF", border: "#E5E7EB", bg: "#FFFFFF", bgLight: "#F8FAFC", section: "#F1F5F9", price: "#7C3AED", offer: "#EC4899", discount: "#22C55E", star: "#FBBF24",
  grad: "linear-gradient(90deg,#38BDF8 0%,#7C3AED 35%,#D946EF 70%,#F59E0B 100%)", gradPrimary: "linear-gradient(135deg,#7C3AED,#D946EF)", gradHero: "radial-gradient(circle at top left,#3B2C85 0%,transparent 35%),radial-gradient(circle at bottom center,#4C1D95 0%,transparent 40%),radial-gradient(circle at right,#0F766E 0%,transparent 30%),#0B1020"
};
const DARK_C = { ...C, bg: "#0B1020", bgLight: "#141B2D", section: "#1A2235", darkCard: "#0D1424", heading: "#F8FAFC", body: "#CBD5E1", secondary: "#94A3B8", muted: "#64748B", border: "#2C3244" };
const DarkCtx = createContext(false);
const useC = () => { const d = useContext(DarkCtx); return d ? DARK_C : C; };

// ─── Data ─────────────────────────────────────────────────────────────────────
const VERTICAL_META: Record<string, any> = {
  grocery: { label: "Grocery", color: "#22C55E", bg: "#22C55E15", icon: ShoppingCart, unsplash: "photo-1542838132-92c53300491e", deliveryTime: "10–20 min", rating: 4.8, tagline: "Fresh groceries fast" },
  service: { label: "Home Services", color: "#7C3AED", bg: "#7C3AED15", icon: Wrench, unsplash: "photo-1581578731548-c64695cc6952", deliveryTime: "Same day", rating: 4.6, tagline: "Expert professionals" },
  shifting: { label: "Shifting", color: "#38BDF8", bg: "#38BDF815", icon: Move, unsplash: "photo-1558618666-fcd25c85cd64", deliveryTime: "Scheduled", rating: 4.5, tagline: "Safe & reliable movers" },
  stationery: { label: "Stationery", color: "#6366F1", bg: "#6366F115", icon: BookMarked, unsplash: "photo-1583485088034-697b5bc54ccd", deliveryTime: "1–2 hrs", rating: 4.7, tagline: "Pens, paper & more", customImg: stationeryImg },
  bakery: { label: "Bakery", color: "#EC4899", bg: "#EC489915", icon: Cake, unsplash: "photo-1555507036-ab1f4038808a", deliveryTime: "30–45 min", rating: 4.9, tagline: "Fresh baked daily" },
};
const VERTICAL_ORDER = ["grocery", "service", "shifting", "stationery", "bakery"];
const mockOrders = [
  { id: "ORD-2026-4891", vertical: "stationery", items: "Classmate Notebook x4, Parker Pen x2", status: "completed", total: 340, date: "2026-07-27", provider: "PaperHouse Stationery", prescription: null },
  { id: "ORD-2026-4850", vertical: "service", items: "AC Deep Cleaning (1.5 Ton)", status: "picked_up", total: 799, date: "2026-07-28", provider: "Sparkle Home Services", prescription: null },
  { id: "ORD-2026-4812", vertical: "stationery", items: "Stapler, A4 Ream 500 sheets, Sketch Pens", status: "confirmed", total: 420, date: "2026-07-28", provider: "NestiGo Stationery Hub", prescription: null },
  { id: "ORD-2026-4790", vertical: "shifting", items: "2BHK Home Shifting + Packing", status: "pending_payment", total: 4500, date: "2026-07-28", provider: "SafeShift Movers", prescription: null },
  { id: "ORD-2026-4720", vertical: "bakery", items: "Chocolate Truffle Cake 1kg, Croissants x6", status: "completed", total: 599, date: "2026-07-25", provider: "Baker's Delight", prescription: null },
];
const catalogItems: Record<string, any[]> = {
  grocery: [
    { id: "gr1", name: "Amul Gold Milk 1L", price: 64, mrp: 68, unit: "per litre", rx: false, stock: 200, rating: 4.8, img: "photo-1563636619-e9143da7973b" },
    { id: "gr2", name: "Fortune Sunflower Oil 1L", price: 149, mrp: 169, unit: "per bottle", rx: false, stock: 120, rating: 4.6, img: "photo-1474979266404-7eaacbcd87c5" },
    { id: "gr3", name: "Aashirvaad Atta 5kg", price: 249, mrp: 289, unit: "per pack", rx: false, stock: 80, rating: 4.7, img: "photo-1509440159596-0249088772ff" },
    { id: "gr4", name: "Tata Salt 1kg", price: 28, mrp: 32, unit: "per pack", rx: false, stock: 500, rating: 4.9, img: "photo-1601648764658-cf37e8c89b70" },
    { id: "gr5", name: "Amul Butter 500g", price: 275, mrp: 295, unit: "per pack", rx: false, stock: 60, rating: 4.8, img: "photo-1589985270826-4b7bb135bc9d" },
    { id: "gr6", name: "Organic Bananas (6 pcs)", price: 49, mrp: 60, unit: "per bunch", rx: false, stock: 100, rating: 4.7, img: "photo-1571771894821-ce9b6c11b08e" },
    { id: "gr7", name: "Amul Taaza Paneer 200g", price: 75, mrp: 85, unit: "per pack", rx: false, stock: 90, rating: 4.6, img: "photo-1548869571-df702d24be9d" },
    { id: "gr8", name: "Maggi 2-Minute Noodles", price: 14, mrp: 16, unit: "per pack", rx: false, stock: 300, rating: 4.8, img: "photo-1555126634-323283e090fa" },
  ],
  stationery: [
    { id: "st1", name: "Classmate Notebook A4", price: 55, mrp: 65, unit: "pack of 6", rx: false, stock: 120, rating: 4.7, img: "photo-1583485088034-697b5bc54ccd" },
    { id: "st2", name: "Parker Vector Pen", price: 199, mrp: 249, unit: "per piece", rx: false, stock: 60, rating: 4.8, img: "photo-1471107340929-a87cd0f5b5f3" },
    { id: "st3", name: "Stapler Heavy Duty", price: 149, mrp: 199, unit: "per piece", rx: false, stock: 40, rating: 4.6, img: "photo-1583485088034-697b5bc54ccd" },
    { id: "st4", name: "A4 Paper Ream 75 GSM", price: 299, mrp: 349, unit: "500 sheets", rx: false, stock: 80, rating: 4.5, img: "photo-1602610696673-b3d50e0d84c9" },
    { id: "st5", name: "Faber-Castell Sketch Set", price: 349, mrp: 429, unit: "set of 12", rx: false, stock: 35, rating: 4.9, img: "photo-1513542789411-b6a5d4f31634" },
    { id: "st6", name: "Scotch Tape Roll", price: 49, mrp: 59, unit: "pack of 3", rx: false, stock: 200, rating: 4.4, img: "photo-1583485088034-697b5bc54ccd" },
    { id: "st7", name: "Whiteboard Marker Set", price: 120, mrp: 150, unit: "set of 4", rx: false, stock: 55, rating: 4.6, img: "photo-1471107340929-a87cd0f5b5f3" },
    { id: "st8", name: "Geometry Box Premium", price: 189, mrp: 225, unit: "per piece", rx: false, stock: 45, rating: 4.7, img: "photo-1583485088034-697b5bc54ccd" },
  ],
  service: [
    { id: "s1", name: "AC Cleaning 1 Ton", price: 599, mrp: 799, unit: "per unit", rx: false, stock: 10, rating: 4.8, img: "photo-1581578731548-c64695cc6952" },
    { id: "s2", name: "AC Cleaning 1.5 Ton", price: 799, mrp: 999, unit: "per unit", rx: false, stock: 10, rating: 4.7, img: "photo-1581578731548-c64695cc6952" },
    { id: "s3", name: "Plumbing – Tap Repair", price: 299, mrp: 399, unit: "per job", rx: false, stock: 15, rating: 4.6, img: "photo-1558618666-fcd25c85cd64" },
    { id: "s4", name: "Fan Installation", price: 399, mrp: 499, unit: "per unit", rx: false, stock: 8, rating: 4.5, img: "photo-1558618666-fcd25c85cd64" },
    { id: "s5", name: "Bathroom Deep Clean", price: 899, mrp: 1199, unit: "per bathroom", rx: false, stock: 5, rating: 4.9, img: "photo-1581578731548-c64695cc6952" },
  ],
  shifting: [
    { id: "sh1", name: "1BHK Home Shifting", price: 3500, mrp: 4200, unit: "starting", rx: false, stock: 5, rating: 4.6, img: "photo-1558618666-fcd25c85cd64" },
    { id: "sh2", name: "2BHK Home Shifting", price: 4500, mrp: 5500, unit: "starting", rx: false, stock: 4, rating: 4.7, img: "photo-1558618666-fcd25c85cd64" },
    { id: "sh3", name: "Packing Service", price: 1200, mrp: 1500, unit: "per room", rx: false, stock: 10, rating: 4.5, img: "photo-1558618666-fcd25c85cd64" },
  ],
  bakery: [
    { id: "b1", name: "Chocolate Truffle Cake", price: 599, mrp: 699, unit: "500g", rx: false, stock: 12, rating: 4.9, img: "photo-1488477181946-6428a0291777" },
    { id: "b2", name: "Butter Croissant", price: 45, mrp: 55, unit: "per piece", rx: false, stock: 50, rating: 4.8, img: "photo-1555507036-ab1f4038808a" },
    { id: "b3", name: "Sourdough Bread", price: 180, mrp: 220, unit: "per loaf", rx: false, stock: 20, rating: 4.9, img: "photo-1509440159596-0249088772ff" },
    { id: "b4", name: "Mango Mousse Cake", price: 699, mrp: 799, unit: "500g", rx: false, stock: 8, rating: 4.8, img: "photo-1567620905732-2d1ec7ab7445" },
  ],
};
const walletTxns = [
  { id: 1, type: "credit", amount: 4500, date: "Jul 22", desc: "Refund – Shifting cancelled", orderId: "ORD-2026-4650" },
  { id: 2, type: "debit", amount: -340, date: "Jul 23", desc: "Stationery order", orderId: "ORD-2026-4680" },
  { id: 3, type: "credit", amount: 85, date: "Jul 25", desc: "Partial refund", orderId: "ORD-2026-4701" },
  { id: 4, type: "debit", amount: -599, date: "Jul 25", desc: "Bakery order", orderId: "ORD-2026-4720" },
];
const chatMessages = [
  { id: 1, sender: "driver", name: "Ramesh K.", text: "I have picked up your order from PaperHouse Stationery, heading your way.", time: "14:32" },
  { id: 2, sender: "customer", name: "You", text: "Great! I'm at Building B, 4th floor. Please call when downstairs.", time: "14:33" },
  { id: 3, sender: "driver", name: "Ramesh K.", text: "Sure, will do! ETA 8 minutes.", time: "14:34" },
  { id: 4, sender: "driver", name: "Ramesh K.", text: "I am at the gate. Coming up.", time: "14:41" },
];

type CartItem = { id: string; name: string; price: number; unit: string; quantity: number; rx: boolean };
const uimg = (id: string, w = 400, h = 300) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=90&dpr=2`;

function VertIcon({ meta, size = "md" }: { meta: any; size?: "sm" | "md" }) {
  const px = size === "sm" ? "w-2.5 h-2.5" : "w-5 h-5";
  if (meta.customImg) return <img src={meta.customImg} alt={meta.label} className={`${px} object-contain`} />;
  const Icon = meta.icon;
  return <Icon className={px} style={{ color: meta.color }} />;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_payment: { label: "Pending Payment", color: "#F59E0B", bg: "#F59E0B15" },
    paid:            { label: "Paid",            color: "#38BDF8", bg: "#38BDF815" },
    confirmed:       { label: "Confirmed",       color: "#06B6D4", bg: "#06B6D415" },
    picked_up:       { label: "On the Way",      color: "#7C3AED", bg: "#7C3AED15" },
    completed:       { label: "Delivered",       color: "#22C55E", bg: "#22C55E15" },
    cancelled:       { label: "Cancelled",       color: "#EF4444", bg: "#EF444415" },
    refunded:        { label: "Refunded",        color: "#EC4899", bg: "#EC489915" },
  };
  const s = map[status] ?? { label: status, color: "var(--muted-foreground)", bg: "var(--surface-2)" };
  return (
    <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap font-body" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </Badge>
  );
}

const MOCK_LOCATIONS = [
  { title: "21st Amendment Gastrobar Indiranagar", sub: "100 Feet Road, HAL 2nd Stage, Doopanahalli, Indiranagar, Bengaluru, Karnataka, India" },
  { title: "21 Sector C", sub: "Faridabad, Haryana, India" },
  { title: "213 Transit Camp", sub: "University of Jammu, Gujarbasti, Jammu" },
  { title: "21C", sub: "Sector 21, Chandigarh, India" },
  { title: "212", sub: "Anand Parbat Road, Than Singh Nagar, Anand Parbat, New Delhi, Delhi, India" }
];

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function TopNav({ activePage, setPage, cartCount, searchQ, setSearchQ }: any) {
  const C = useC();
  const [location, setLocation] = useState("Indiranagar");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchLoc, setSearchLoc] = useState("");

  const filteredLocations = searchLoc ? MOCK_LOCATIONS.filter(l => l.title.toLowerCase().includes(searchLoc.toLowerCase()) || l.sub.toLowerCase().includes(searchLoc.toLowerCase())) : MOCK_LOCATIONS;

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setLocation("Varanasi, UP");
            setIsDetecting(false);
            setIsDialogOpen(false);
          }, 800);
        },
        (error) => {
          setTimeout(() => {
            setLocation("Location Failed");
            setIsDetecting(false);
            setIsDialogOpen(false);
          }, 800);
        }
      );
    } else {
      setTimeout(() => {
        setLocation("Bengaluru, KA");
        setIsDetecting(false);
        setIsDialogOpen(false);
      }, 1500);
    }
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center gap-4">
        <button onClick={() => setPage("home")} className="flex items-center gap-2 flex-shrink-0" aria-label="Go home">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.gradPrimary }}>
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight" style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NestiGo
          </span>
        </button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="hidden md:flex flex-col items-start justify-center gap-0.5 px-3 py-1 rounded-xl h-auto hover:bg-surface-2 transition-colors border border-transparent hover:border-border" aria-label="Select location">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-wider opacity-70">This is your location</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                {isDetecting ? <Navigation className="w-3 h-3 text-primary animate-pulse" /> : <MapPin className="w-3 h-3 text-primary" />}
                <span className="max-w-[160px] truncate text-xs font-semibold text-foreground">{isDetecting ? "Detecting..." : location}</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-0 overflow-hidden bg-background font-body shadow-lg border-border gap-0" hideClose>
            <DialogHeader className="p-4 border-b border-border relative bg-background flex flex-row items-center space-y-0">
              <DialogTitle className="font-heading font-medium text-[15px] text-foreground">Change Location</DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-[#F8F9FA] dark:bg-surface-1 border-b border-border">
              <div className="flex items-center gap-3">
                <Button onClick={handleDetectLocation} className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium px-4 h-10 shrink-0 rounded-lg text-sm shadow-sm transition-all">
                  {isDetecting ? "Detecting..." : "Detect my location"}
                </Button>
                <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full border border-border bg-background text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  OR
                </div>
                <div className="relative flex-1">
                  <Input 
                    value={searchLoc} 
                    onChange={(e) => setSearchLoc(e.target.value)} 
                    placeholder="Search location..." 
                    className="h-10 rounded-lg bg-background border border-border shadow-sm font-body focus-visible:ring-1 focus-visible:ring-primary text-sm px-3" 
                  />
                </div>
              </div>
            </div>
            
            <div className="max-h-[320px] overflow-y-auto bg-background">
               {filteredLocations.length > 0 ? (
                 filteredLocations.map((loc, i) => (
                   <div 
                     key={i} 
                     onClick={() => { setLocation(loc.title); setIsDialogOpen(false); }}
                     className="flex items-start gap-4 p-4 border-b border-border last:border-0 hover:bg-surface-1 cursor-pointer transition-colors"
                   >
                     <MapPin className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                     <div>
                       <p className="font-medium text-foreground text-[14px] font-body">{loc.title}</p>
                       <p className="text-muted-foreground text-[13px] mt-0.5 font-body line-clamp-2 leading-relaxed">{loc.sub}</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-background">
                    <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" strokeWidth={1} />
                    <h3 className="font-heading font-medium text-lg text-foreground">Oops!</h3>
                    <p className="text-muted-foreground font-body text-sm mt-2 max-w-[280px] leading-relaxed">
                      NestiGo is not available at this location at the moment. Please select a different location.
                    </p>
                 </div>
               )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-1 border border-border max-w-[520px]">
          <Search className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
          <Input value={searchQ} onChange={(e) => { setSearchQ(e.target.value); if (e.target.value) setPage("search"); }} onFocus={() => setPage("search")} placeholder="Search stationery, services, cakes, shifting…" className="flex-1 bg-transparent border-none outline-none shadow-none focus-visible:ring-0 text-foreground font-body text-sm px-0 h-auto" aria-label="Search" />
          {searchQ && <button onClick={() => setSearchQ("")} aria-label="Clear"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <nav className="hidden lg:flex items-center gap-1 mr-1">
            {[ { id: "home", label: "Home", icon: Home }, { id: "orders", label: "Orders", icon: Package } ].map((nl) => {
              const Icon = nl.icon;
              const on = activePage === nl.id;
              return (
                <Button key={nl.id} variant={on ? "secondary" : "ghost"} onClick={() => setPage(nl.id)} className={`flex items-center gap-1.5 rounded-xl transition-all font-body font-semibold text-xs ${on ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                  <Icon className="w-4 h-4" />{nl.label}
                </Button>
              );
            })}
          </nav>
          <Button variant="outline" size="icon" className="relative w-9 h-9 rounded-xl bg-surface-2 border-border" aria-label="Notifications">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
          </Button>
          <Button variant={cartCount > 0 ? "default" : "outline"} onClick={() => setPage("cart")} className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all h-9 ${cartCount > 0 ? 'shadow-primary' : 'bg-surface-2 border-border'}`} style={cartCount > 0 ? { background: C.gradPrimary } : {}} aria-label="Cart">
            <ShoppingCart className={`w-4 h-4 ${cartCount > 0 ? "text-white" : "text-muted-foreground"}`} />
            {cartCount > 0 && <span className="text-white font-heading font-bold text-xs">{cartCount}</span>}
          </Button>
          <Button onClick={() => setPage("profile")} className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ml-1 p-0 shadow-primary" style={{ background: C.gradPrimary }} aria-label="Profile">
            JD
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
function BottomNav({ active, setActive, cartCount }: any) {
  const tabs = [ { id: "home", icon: Home, label: "Home" }, { id: "search", icon: Search, label: "Search" }, { id: "cart", icon: ShoppingCart, label: "Cart" }, { id: "orders", icon: Package, label: "Orders" }, { id: "profile", icon: User, label: "Me" } ];
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,.08)]">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const on = active === tab.id;
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)} aria-label={tab.label} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative min-w-[52px]">
              {tab.id === "cart" && cartCount > 0 && <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center font-heading text-[0.58rem] font-extrabold">{cartCount}</span>}
              <div className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${on ? 'bg-primary/15' : 'bg-transparent'}`}>
                <Icon className={`w-4 h-4 ${on ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`text-[0.6rem] font-body ${on ? 'text-primary font-bold' : 'text-muted-foreground font-medium'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ setPage, setActiveVertical }: any) {
  const C = useC();
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const banners = [
    { title: "Groceries in 10 Minutes", subtitle: "Fresh staples, dairy & more", badge: "10 MIN", img: "photo-1542838132-92c53300491e", vertical: "grocery", tint: "rgba(21,128,61,0.45)" },
    { title: "Stationery Delivered in 1 Hr", subtitle: "Notebooks, pens & office supplies", badge: "FREE DELIVERY", img: "photo-1583485088034-697b5bc54ccd", vertical: "stationery", tint: "rgba(67,56,202,0.45)" },
    { title: "Home Services at ₹599", subtitle: "Expert professionals at your door", badge: "40% OFF", img: "photo-1581578731548-c64695cc6952", vertical: "service", tint: "rgba(91,33,182,0.45)" },
    { title: "Fresh Cakes Every Day", subtitle: "Baked same morning, delivered hot", badge: "NEW", img: "photo-1555507036-ab1f4038808a", vertical: "bakery", tint: "rgba(157,23,77,0.45)" },
    { title: "Safe Home Shifting", subtitle: "Trusted packers & movers near you", badge: "BOOK NOW", img: "photo-1558618666-fcd25c85cd64", vertical: "shifting", tint: "rgba(7,89,133,0.45)" },
  ];

  useEffect(() => {
    if (bannerPaused) return;
    const id = setInterval(() => setActiveBanner((p) => (p + 1) % banners.length), 3500);
    return () => clearInterval(id);
  }, [bannerPaused, banners.length]);

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden cursor-pointer h-[240px]" role="button" tabIndex={0}
            onClick={() => { setActiveVertical(banners[activeBanner].vertical); setPage("store"); }}
            onKeyDown={(e) => { if(e.key === 'Enter') { setActiveVertical(banners[activeBanner].vertical); setPage("store"); } }}
            onMouseEnter={() => setBannerPaused(true)} onMouseLeave={() => setBannerPaused(false)}>
            <img src={uimg(banners[activeBanner].img, 900, 480)} alt={banners[activeBanner].title} className="w-full h-full object-cover transition-all duration-500" />
            <div className="absolute inset-0" style={{ background: banners[activeBanner].tint }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <Badge className="bg-white text-primary mb-2 font-body font-bold">{banners[activeBanner].badge}</Badge>
              <h3 className="text-white font-heading font-extrabold text-2xl leading-tight">{banners[activeBanner].title}</h3>
              <p className="text-white/80 font-body text-sm mt-1 mb-3">{banners[activeBanner].subtitle}</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm bg-white/20 text-white backdrop-blur-md font-body">Order Now <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => { setActiveBanner(i); setBannerPaused(true); setTimeout(() => setBannerPaused(false), 5000); }} aria-label={`Banner ${i}`} className="rounded-full transition-all" style={{ width: i === activeBanner ? "20px" : "7px", height: "7px", background: i === activeBanner ? "white" : "rgba(255,255,255,0.4)" }} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 lg:grid-cols-1 gap-2 stagger-children">
          {VERTICAL_ORDER.map((key) => { const meta = VERTICAL_META[key];
            return (
              <Card key={key} onClick={() => { setActiveVertical(key); setPage("store"); }} className="flex lg:flex-row items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-xl transition-all hover-lift cursor-pointer bg-background border-border shadow-xs">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={uimg(meta.unsplash, 80, 80)} alt={meta.label} className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p className="text-foreground font-body font-semibold text-[0.82rem]">{meta.label}</p>
                  <p className="text-muted-foreground font-body text-[0.68rem]">{meta.deliveryTime}</p>
                </div>
                <p className="lg:hidden text-center text-foreground font-body font-semibold text-[0.6rem]">{meta.label.split(" ")[0]}</p>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mb-8 p-px rounded-2xl overflow-hidden" style={{ background: C.grad }}>
        <div className="px-5 py-3.5 rounded-2xl flex items-center gap-3 bg-darkCard" style={{ background: C.darkCard }}>
          <Sparkles className="w-5 h-5 flex-shrink-0 text-orange-500" />
          <p className="text-white font-body font-semibold text-sm flex-1">
            Use code <strong className="text-orange-500">WELCOME10</strong> — 10% off on your first order · Min ₹199
          </p>
          <Button size="sm" className="font-bold font-body text-white shadow-primary" style={{ background: C.gradPrimary }}>COPY</Button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-heading font-bold text-xl">Nearby Stores</h2>
          <Button variant="link" className="text-primary font-body font-semibold p-0 h-auto">See all <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 stagger-children">
          {VERTICAL_ORDER.map((key) => { const meta = VERTICAL_META[key];
            return (
              <Card key={key} onClick={() => { setActiveVertical(key); setPage("store"); }} className="overflow-hidden text-left transition-all hover-lift cursor-pointer bg-background border-border shadow-sm">
                <div className="h-32 overflow-hidden">
                  <img src={uimg(meta.unsplash, 800, 512)} alt={meta.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-foreground font-body font-bold text-sm">{meta.label}</p>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}><VertIcon meta={meta} size="sm" /></span>
                  </div>
                  <p className="text-muted-foreground text-[0.7rem] font-body">{meta.tagline}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-foreground text-[0.72rem] font-body"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {meta.rating}</span>
                    <span className="flex items-center gap-1 text-muted-foreground text-[0.72rem] font-body"><Clock className="w-3 h-3" /> {meta.deliveryTime}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16 stagger-children">
        {[ { label: "Active Orders", value: "2", sub: "in progress", color: "text-primary", bg: "bg-primary/10" }, { label: "Wallet Balance", value: "₹4,835", sub: "available", color: "text-cyan-500", bg: "bg-cyan-500/10" }, { label: "Total Orders", value: "47", sub: "all time", color: "text-pink-500", bg: "bg-pink-500/10" }, { label: "Loyalty Points", value: "1,240", sub: "redeemable", color: "text-orange-500", bg: "bg-orange-500/10" } ].map((s) => (
          <Card key={s.label} className={`rounded-xl p-4 ${s.bg} border-border`}>
            <p className={`${s.color} font-heading font-black text-2xl`}>{s.value}</p>
            <p className="text-foreground font-body font-semibold text-sm mt-1">{s.label}</p>
            <p className="text-muted-foreground font-body text-xs mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Search Page ──────────────────────────────────────────────────────────────
function SearchPage({ q, setQ, setPage, setActiveVertical }: any) {
  const trending = ["AC Cleaning", "Notebooks", "Chocolate Cake", "2BHK Shifting", "Parker Pen", "Sketch Pens"];
  const recent = ["Classmate Notebook", "Sketch Set"];
  const results = Object.entries(catalogItems).flatMap(([vertical, items]) => items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())).map((item) => ({ ...item, vertical })));
  return (
    <div className="page-enter max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      {!q ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {recent.length > 0 && (
              <div>
                <p className="text-foreground font-body font-bold text-sm mb-2">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <Button key={r} variant="outline" size="sm" onClick={() => setQ(r)} className="rounded-full font-body text-xs h-8 bg-surface-2 border-border text-foreground"><Clock className="w-3 h-3 mr-1 text-muted-foreground" />{r}</Button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-foreground font-body font-bold text-sm mb-2"><Flame className="w-3.5 h-3.5 inline mr-1 text-orange-500" />Trending</p>
              <div className="flex flex-wrap gap-2">
                {trending.map((t, i) => {
                  const colors = ["text-primary bg-primary/10", "text-pink-500 bg-pink-500/10", "text-cyan-500 bg-cyan-500/10", "text-orange-500 bg-orange-500/10", "text-green-500 bg-green-500/10", "text-blue-500 bg-blue-500/10"];
                  const col = colors[i % colors.length];
                  return <Button key={t} variant="secondary" size="sm" onClick={() => setQ(t)} className={`rounded-full font-semibold text-xs h-8 border-none ${col}`}>{t}</Button>;
                })}
              </div>
            </div>
          </div>
          <div>
            <p className="text-foreground font-body font-bold text-sm mb-2">Browse Categories</p>
            <div className="space-y-2 stagger-children">
              {VERTICAL_ORDER.map((key) => { const meta = VERTICAL_META[key];
                return (
                  <Card key={key} onClick={() => { setActiveVertical(key); setPage("store"); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover-lift cursor-pointer bg-background border-border shadow-xs">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"><img src={uimg(meta.unsplash, 80, 80)} alt={meta.label} className="w-full h-full object-cover" /></div>
                    <div className="flex-1"><p className="text-foreground font-body font-semibold text-sm">{meta.label}</p><p className="text-muted-foreground text-[0.7rem] font-body">{meta.deliveryTime}</p></div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground font-body text-sm mb-4">{results.length} results for "<strong className="text-foreground">{q}</strong>"</p>
          {results.length === 0 ? (
            <div className="empty-state">
              <Search className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-foreground font-heading font-bold text-lg">No results found</p>
              <p className="text-muted-foreground font-body text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
              {results.map((item) => (
                <Card key={item.id} onClick={() => { setActiveVertical(item.vertical); setPage("store"); }} className="flex items-center gap-3 p-3 rounded-xl text-left hover-lift cursor-pointer bg-background border-border shadow-xs">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"><img src={uimg(item.img, 112, 112)} alt={item.name} className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-body font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-muted-foreground text-[0.7rem] font-body">{item.unit}</p>
                    <p className="text-primary font-heading font-bold text-sm mt-0.5">₹{item.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Store Page ─────────────────────────────────────────────────────────────
function StorePage({ vertical, cart, setCart, setPage }: any) {
  const C = useC();
  const [activeV, setActiveV] = useState(vertical);
  const [search, setSearch] = useState("");
  const meta = VERTICAL_META[activeV];
  const items = (catalogItems[activeV] ?? []).filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (item: any) => setCart((prev: any[]) => { const ex = prev.find((c) => c.id === item.id); if (ex) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c); return [...prev, { id: item.id, name: item.name, price: item.price, unit: item.unit, quantity: 1, rx: item.rx }]; });
  const removeFromCart = (id: string) => setCart((prev: any[]) => prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter((c) => c.quantity > 0));
  const qty = (id: string) => cart.find((c: any) => c.id === id)?.quantity ?? 0;
  const cartTotal = cart.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s: number, i: any) => s + i.quantity, 0);

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-24 lg:pb-10">
      <div className="relative rounded-2xl overflow-hidden mb-6 h-[200px]">
        <img src={uimg(meta.unsplash, 1400, 400)} alt={meta.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(11,16,32,0.75) 40%,transparent)" }} />
        <Button variant="outline" size="icon" onClick={() => setPage("home")} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 border-none shadow-sm" aria-label="Back">
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </Button>
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <h2 className="text-white font-heading font-extrabold text-3xl">{meta.label}</h2>
          <p className="text-white/75 font-body text-sm mb-2 mt-1">{meta.tagline}</p>
          <div className="flex items-center gap-4">
            <span className="text-white text-[0.82rem] font-body flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {meta.rating}</span>
            <span className="text-white/75 text-[0.82rem] font-body flex items-center gap-1"><Clock className="w-4 h-4" /> {meta.deliveryTime}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl overflow-hidden bg-background border border-border shadow-sm">
            {VERTICAL_ORDER.map((key) => { const m = VERTICAL_META[key]; const Icon = m.icon; const on = activeV === key;
              return (
                <button key={key} onClick={() => setActiveV(key)} className={`w-full flex items-center gap-2.5 px-4 py-3 text-left border-b border-border transition-all ${on ? 'bg-primary/10 border-l-[3px] border-l-primary' : 'bg-transparent border-l-[3px] border-l-transparent'}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${on ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`font-body text-[0.82rem] ${on ? 'text-primary font-bold' : 'text-foreground font-medium'}`}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 lg:hidden scrollbar-none">
            {VERTICAL_ORDER.map((key) => { const m = VERTICAL_META[key]; const Icon = m.icon; const on = activeV === key;
              return (
                <Button key={key} variant={on ? "default" : "secondary"} onClick={() => setActiveV(key)} className={`rounded-full font-body font-semibold text-xs h-8 ${on ? '' : 'bg-surface-2'}`}>
                  <Icon className="w-3 h-3 mr-1" />{m.label}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-1 border border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${meta.label}…`} className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 h-auto font-body text-sm" aria-label="Search items" />
            </div>
            <Button variant="outline" className="rounded-xl h-10 bg-surface-1 border-border font-body"><Filter className="w-4 h-4 mr-1.5" /> Filter</Button>
          </div>
          {items.length === 0 ? (
            <div className="empty-state text-center py-20"><Search className="w-10 h-10 text-muted-foreground/40 mb-3" /><p className="text-foreground font-heading font-bold">No items found</p></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
              {items.map((item) => {
                const q = qty(item.id); const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
                return (
                  <Card key={item.id} className="overflow-hidden transition-all hover-lift bg-background border-border shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="relative h-32">
                        <img src={uimg(item.img, 320, 256)} alt={item.name} className="w-full h-full object-cover" />
                        {discount > 0 && <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-white font-body font-bold text-[0.65rem] px-1.5 py-0">{discount}% OFF</Badge>}
                        {item.rx && <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white font-body font-bold text-[0.65rem] px-1.5 py-0">Rx</Badge>}
                      </div>
                      <div className="p-3">
                        <p className="text-foreground font-body font-semibold text-[0.82rem] leading-tight mb-0.5">{item.name}</p>
                        <p className="text-muted-foreground text-[0.67rem] font-body">{item.unit}</p>
                        <div className="flex items-center gap-1 mt-1 mb-2">
                          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" /><span className="text-foreground text-[0.65rem] font-body">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pt-0 flex items-center justify-between">
                      <div>
                        <p className="text-primary font-heading font-bold text-[0.95rem]">₹{item.price}</p>
                        {discount > 0 && <p className="text-muted-foreground text-[0.65rem] font-body line-through">₹{item.mrp}</p>}
                      </div>
                      {q === 0 ? (
                        <Button size="sm" onClick={() => addToCart(item)} className="rounded-xl font-bold font-body text-xs shadow-primary text-white" style={{ background: C.gradPrimary }}>ADD</Button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl" style={{ background: C.gradPrimary }}>
                          <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center" aria-label="Decrease quantity"><Minus className="w-3 h-3 text-white" /></button>
                          <span className="text-white font-heading font-bold text-[0.85rem] min-w-[16px] text-center">{q}</span>
                          <button onClick={() => addToCart(item)} className="w-5 h-5 flex items-center justify-center" aria-label="Increase quantity"><Plus className="w-3 h-3 text-white" /></button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <Button onClick={() => setPage("cart")} className="flex items-center gap-4 px-6 py-6 rounded-2xl shadow-xl transition-all hover:scale-105" style={{ background: C.gradPrimary }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/20"><ShoppingCart className="w-4 h-4 text-white" /></div>
            <span className="text-white font-body font-bold text-sm">{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
            <span className="text-white font-heading font-black text-lg ml-2">₹{cartTotal}</span>
            <ArrowRight className="w-4 h-4 text-white ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
function CartPage({ cart, setCart, setPage }: any) {
  const C = useC();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const subtotal = cart.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const discount = applied ? Math.floor(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <h2 className="text-foreground font-heading font-bold text-2xl mb-5">Your Cart</h2>
      {cart.length === 0 ? (
        <div className="empty-state text-center py-24">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-surface-2">
            <ShoppingCart className="w-9 h-9 text-muted-foreground" />
          </div>
          <p className="text-foreground font-heading font-bold text-xl">Cart is empty</p>
          <p className="text-muted-foreground font-body mt-1">Add items to get started</p>
          <Button onClick={() => setPage("home")} className="mt-5 rounded-2xl font-bold px-8 shadow-primary" size="lg" style={{ background: C.gradPrimary }}>Start Shopping</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-2xl overflow-hidden bg-background border-border shadow-sm">
              {cart.map((item: any, idx: number) => (
                <div key={item.id} className={`flex items-center gap-4 px-5 py-4 ${idx > 0 ? "border-t border-border" : ""}`}>
                  <div className="flex-1">
                    <p className="text-foreground font-body font-semibold">{item.name}</p>
                    <p className="text-muted-foreground text-xs font-body mt-0.5">{item.unit} · ₹{item.price} each</p>
                    {item.rx && <p className="text-orange-500 text-[0.7rem] font-body mt-0.5">⚕ Prescription required</p>}
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-primary/10 border border-primary/30">
                    <button onClick={() => setCart((p: any[]) => p.map((c) => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c).filter((c) => c.quantity > 0))} className="w-6 h-6 flex items-center justify-center" aria-label="Decrease"><Minus className="w-3.5 h-3.5 text-primary" /></button>
                    <span className="text-primary font-heading font-bold min-w-[20px] text-center">{item.quantity}</span>
                    <button onClick={() => setCart((p: any[]) => p.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))} className="w-6 h-6 flex items-center justify-center" aria-label="Increase"><Plus className="w-3.5 h-3.5 text-primary" /></button>
                  </div>
                  <p className="text-foreground font-heading font-bold min-w-[60px] text-right">₹{item.price * item.quantity}</p>
                  <Button variant="ghost" size="icon" onClick={() => setCart((p: any[]) => p.filter((c) => c.id !== item.id))} aria-label="Remove item"><X className="w-4 h-4 text-muted-foreground" /></Button>
                </div>
              ))}
            </Card>
            <Card className="rounded-2xl p-4 bg-background border-border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-primary" />
                <p className="text-foreground font-body font-bold">Apply Coupon</p>
              </div>
              <div className="flex gap-2">
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Try WELCOME10" className="flex-1 rounded-xl bg-surface-1 border-border text-foreground font-mono" />
                <Button onClick={() => coupon === "WELCOME10" && setApplied(true)} className={`rounded-xl font-bold ${applied ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'text-white shadow-primary'}`} variant={applied ? "secondary" : "default"} style={!applied ? { background: C.gradPrimary } : {}}>{applied ? "Applied ✓" : "Apply"}</Button>
              </div>
              {applied && <p className="text-green-500 text-xs font-body mt-2">🎉 10% discount applied!</p>}
            </Card>
          </div>
          <div className="space-y-4">
            <Card className="rounded-2xl p-5 bg-background border-border shadow-sm">
              <p className="text-foreground font-body font-bold mb-4">Order Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground font-body">Subtotal</span><span className="text-foreground font-body font-semibold">₹{subtotal}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-500 font-body">Discount</span><span className="text-green-500 font-body font-semibold">-₹{discount}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted-foreground font-body">Delivery</span><span className="text-green-500 font-body font-semibold">FREE</span></div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-foreground font-heading font-bold text-[1.05rem]">Total</span>
                  <span className="text-primary font-heading font-black text-xl">₹{total}</span>
                </div>
              </div>
              <Button onClick={() => setPage("checkout")} className="w-full py-6 rounded-2xl font-bold mt-5 text-white shadow-primary" style={{ background: C.gradPrimary }}>Proceed to Checkout</Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
function CheckoutPage({ cart, setPage, setCart }: any) {
  const C = useC();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const total = cart.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const needsRx = cart.some((c: any) => c.rx);

  if (step === "success") {
    return (
      <div className="page-enter max-w-lg mx-auto px-4 pt-16 text-center pb-24">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-green-400 to-green-600 shadow-[0_8px_32px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-foreground font-heading font-black text-2xl">Order Placed!</h2>
        <p className="text-muted-foreground font-body mt-2 leading-relaxed">
          <strong className="text-foreground">ORD-2026-4892</strong> confirmed.
          {needsRx && " Prescription verified within 30 min. "} Driver assigned shortly.
        </p>
        <div className="mt-5 p-4 rounded-2xl bg-surface-2 border border-border">
          <p className="text-muted-foreground text-xs font-body">Estimated delivery</p>
          <p className="text-foreground font-heading font-bold text-lg">30–45 minutes</p>
        </div>
        <div className="flex gap-3 mt-5">
          <Button onClick={() => { setCart([]); setPage("orders"); }} className="flex-1 py-6 rounded-2xl font-bold text-white shadow-primary" style={{ background: C.gradPrimary }}>Track My Order</Button>
          <Button variant="secondary" onClick={() => { setCart([]); setPage("home"); }} className="flex-1 py-6 rounded-2xl font-semibold bg-surface-2 text-foreground">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 md:px-6 py-8 pb-24 lg:pb-10">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="outline" size="icon" onClick={() => setPage("cart")} className="w-9 h-9 rounded-xl bg-surface-2 border-border" aria-label="Back"><ChevronLeft className="w-5 h-5 text-foreground" /></Button>
        <h2 className="text-foreground font-heading font-bold text-xl">Checkout</h2>
        <div className="flex items-center gap-2 ml-4">
          {["Address", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold font-heading ${((step === "address" && i === 0) || step === "payment") ? 'bg-primary text-white' : 'bg-surface-2 text-muted-foreground'}`}>{i + 1}</div>
              <span className="text-foreground font-body text-sm">{s}</span>
              {i === 0 && <div className="w-8 h-px mx-1 bg-border" />}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === "address" && (
            <Card className="rounded-2xl p-6 space-y-4 bg-background border-border shadow-sm">
              <h3 className="text-foreground font-body font-bold">Delivery Address</h3>
              <Button variant="outline" className="w-full h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all bg-primary/10 border-dashed border-primary/50 text-primary hover:bg-primary/20">
                <Navigation className="w-5 h-5" />
                <span className="font-body font-semibold text-sm">Auto-detect Current Location</span>
              </Button>
              <div className="flex items-center gap-4 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground font-body text-xs font-semibold">OR ENTER MANUALLY</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-1.5 mb-1.5 text-foreground font-body text-xs font-semibold"><MapPin className="w-3.5 h-3.5" /> Address</Label>
                  <Input defaultValue="372 UPHAR APARTMENT SURESH SHARMA NAGAR" className="w-full rounded-xl bg-surface-1 border-primary/50 text-foreground font-body text-sm h-12" />
                </div>
                <div>
                  <Label className="text-foreground font-body text-xs font-semibold block mb-1.5">Additional Notes</Label>
                  <textarea placeholder="Any specific requirements..." rows={3} className="w-full px-3 py-3 rounded-xl outline-none transition-all resize-none bg-surface-1 border border-border text-foreground font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              {needsRx && (
                <div className="p-3 rounded-xl flex items-center gap-3 bg-orange-500/10 border border-orange-500/30">
                  <Upload className="w-4 h-4 flex-shrink-0 text-orange-500" />
                  <p className="text-foreground text-xs font-body flex-1">Upload prescription for Rx items</p>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-body font-bold rounded-lg">Upload</Button>
                </div>
              )}
              <Button onClick={() => setStep("payment")} className="w-full py-6 rounded-2xl font-bold mt-2 text-white shadow-primary" style={{ background: C.gradPrimary }}>Proceed to Payment</Button>
            </Card>
          )}
          {step === "payment" && (
            <Card className="rounded-2xl p-6 space-y-4 bg-background border-border shadow-sm">
              <h3 className="text-foreground font-body font-bold">Payment Method</h3>
              {[
                { id: "upi", label: "UPI / PhonePe / GPay", sub: "Instant payment", icon: Zap, checked: true },
                { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay", icon: CreditCard, checked: false },
                { id: "wallet", label: "NestiGo Wallet", sub: "Balance: ₹4,835", icon: Wallet, checked: false },
              ].map((pm) => (
                <label key={pm.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border ${pm.checked ? 'bg-primary/10 border-primary/40' : 'bg-surface-1 border-border'}`}>
                  <input type="radio" name="pm" defaultChecked={pm.checked} className="accent-primary w-4 h-4" />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10"><pm.icon className="w-4 h-4 text-primary" /></div>
                  <div>
                    <p className="text-foreground font-body font-semibold text-sm">{pm.label}</p>
                    <p className="text-muted-foreground text-xs font-body">{pm.sub}</p>
                  </div>
                </label>
              ))}
              <Button onClick={() => setStep("success")} className="w-full py-6 rounded-2xl font-bold mt-2 text-white shadow-primary" style={{ background: C.gradPrimary }}>Pay ₹{total} Now</Button>
            </Card>
          )}
        </div>
        <Card className="rounded-2xl p-5 h-fit bg-background border-border shadow-sm">
          <p className="text-foreground font-body font-bold mb-3">Order Summary</p>
          {cart.map((item: any) => (
            <div key={item.id} className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground font-body text-sm truncate flex-1 mr-2">{item.name} ×{item.quantity}</span>
              <span className="text-foreground font-heading font-semibold text-sm">₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between py-3"><span className="text-foreground font-heading font-bold text-lg">Total</span><span className="text-primary font-heading font-black text-xl">₹{total}</span></div>
        </Card>
      </div>
    </div>
  );
}

// ─── Orders, Tracking, Chat, Review, Dispute, Profiles ──────────────────────
// Due to space, I've compressed logic. All functions are preserved.
function OrdersPage({ setPage, setActiveOrderId }: any) {
  const [tab, setTab] = useState<"all" | "completed" | "pending">("all");
  const filtered = mockOrders.filter((o) => { if (tab === "completed") return o.status === "completed"; if (tab === "pending") return ["pending_payment", "confirmed", "picked_up"].includes(o.status); return true; });
  return (
    <div className="page-enter max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-10">
      <h2 className="text-foreground font-heading font-bold text-xl mb-5">Your Orders</h2>
      <div className="flex gap-2 mb-5">
        {(["all", "completed", "pending"] as const).map((t) => (
          <Button key={t} variant={tab === t ? "default" : "secondary"} onClick={() => setTab(t)} className={`rounded-xl font-semibold text-sm capitalize h-8 ${tab !== t ? 'bg-surface-2' : ''}`}>{t}</Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state text-center py-16"><Package className="w-12 h-12 text-muted-foreground/40 mb-3 mx-auto" /><p className="text-foreground font-heading font-bold">No orders found</p></div>
      ) : (
        <div className="space-y-4 stagger-children">
          {filtered.map((order) => {
            const meta = VERTICAL_META[order.vertical];
            return (
              <Card key={order.id} className="rounded-2xl p-4 bg-background border-border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}><VertIcon meta={meta} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-muted-foreground text-xs font-mono">{order.id}</p>
                        <p className="text-foreground font-body font-semibold text-sm mt-1">{order.items}</p>
                        <p className="text-muted-foreground text-xs font-body mt-1">{order.provider} · {order.date}</p>
                      </div>
                      <p className="text-primary font-heading font-black text-lg flex-shrink-0">₹{order.total}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <StatusPill status={order.status} />
                      {["picked_up", "confirmed", "pending_payment"].includes(order.status) && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => { setActiveOrderId(order.id); setPage("tracking"); }} className="rounded-xl font-bold text-xs h-7 bg-primary/10 text-primary hover:bg-primary/20"><Navigation className="w-3 h-3 mr-1" /> Track</Button>
                          <Button size="sm" variant="secondary" onClick={() => { setActiveOrderId(order.id); setPage("chat"); }} className="rounded-xl font-bold text-xs h-7 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"><MessageSquare className="w-3 h-3 mr-1" /> Chat</Button>
                        </>
                      )}
                      {order.status === "completed" && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => setPage("review")} className="rounded-xl font-bold text-xs h-7 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"><Star className="w-3 h-3 mr-1" /> Review</Button>
                          <Button size="sm" variant="secondary" onClick={() => setPage("dispute")} className="rounded-xl font-bold text-xs h-7 bg-destructive/10 text-destructive hover:bg-destructive/20"><Flag className="w-3 h-3 mr-1" /> Dispute</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TrackingPage({ orderId, setPage }: any) {
  const C = useC();
  const order = mockOrders.find((o) => o.id === orderId) ?? mockOrders[1];
  const steps = ["Order Placed", "Payment Verified", "Driver Assigned", "Picked Up", "Delivered"];
  const currentStep = order.status === "picked_up" ? 3 : order.status === "confirmed" ? 2 : 1;
  return (
    <div className="page-enter max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => setPage("orders")} className="w-9 h-9 rounded-xl bg-surface-2 border-border" aria-label="Back"><ChevronLeft className="w-5 h-5 text-foreground" /></Button>
        <h2 className="text-foreground font-heading font-bold text-xl">Live Tracking</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden relative h-[360px] bg-sidebar">
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at top left,#3B2C85 0%,transparent 35%),radial-gradient(circle at bottom center,#4C1D95 0%,transparent 40%),radial-gradient(circle at right,#0F766E 0%,transparent 30%)" }} />
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `linear-gradient(${C.primary}33 1px,transparent 1px),linear-gradient(90deg,${C.primary}33 1px,transparent 1px)`, backgroundSize: "32px 32px" }} />
          <svg className="absolute inset-0 w-full h-full"><path d="M 10% 80% Q 40% 50% 60% 30% T 90% 10%" stroke={C.primary} strokeWidth="3" strokeDasharray="8,4" fill="none" opacity="0.8" /></svg>
          <div className="absolute animate-pulse left-[40%] top-[40%]">
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-primary" style={{ background: C.gradPrimary, boxShadow: `0 0 0 12px rgba(124,58,237,0.2),0 0 30px rgba(124,58,237,0.5)` }}><Truck className="w-6 h-6 text-white" /></div>
          </div>
          <div className="absolute left-[80%] top-[10%]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-destructive shadow-[0_0_16px_rgba(239,68,68,0.4)]"><MapPin className="w-5 h-5 text-white" /></div>
          </div>
          <div className="absolute top-4 right-4 px-4 py-2 rounded-full flex items-center gap-2 bg-white/90 backdrop-blur-md shadow-sm"><Clock className="w-3.5 h-3.5 text-primary" /><span className="text-gray-900 font-heading font-bold text-sm">8 min away</span></div>
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3 bg-sidebar/95 backdrop-blur-md border-t border-border/30">
            <Avatar className="w-10 h-10 border border-white/10"><AvatarFallback className="bg-primary text-white font-heading font-bold">RK</AvatarFallback></Avatar>
            <div className="flex-1"><p className="text-white font-body font-bold text-sm">Ramesh Kumar</p><p className="text-white/60 text-xs font-body">⭐ 4.8 · KA 05 MX 1234</p></div>
            <Button size="icon" className="rounded-full bg-primary/20 hover:bg-primary/30" aria-label="Call driver"><Phone className="w-4 h-4 text-primary" /></Button>
            <Button size="icon" onClick={() => setPage("chat")} className="rounded-full bg-pink-500/20 hover:bg-pink-500/30" aria-label="Chat with driver"><MessageSquare className="w-4 h-4 text-pink-500" /></Button>
          </div>
        </div>
        <Card className="rounded-2xl p-6 bg-background border-border shadow-sm">
          <p className="text-foreground font-heading font-bold text-lg mb-5">Delivery Progress</p>
          <div className="space-y-5">
            {steps.map((step, i) => {
              const done = i < currentStep; const isActive = i === currentStep;
              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-gradient-to-br from-green-400 to-green-600' : isActive ? 'shadow-primary text-white' : 'bg-surface-2'}`} style={isActive ? { background: C.gradPrimary } : {}}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : isActive ? <div className="w-3 h-3 rounded-full bg-white animate-pulse" /> : <div className="w-3 h-3 rounded-full bg-border" />}
                    </div>
                    {i < steps.length - 1 && <div className={`w-0.5 mt-1 h-7 ${done ? 'bg-green-500/50' : 'bg-border'}`} />}
                  </div>
                  <div className="pt-1">
                    <p className={`font-body text-sm ${done ? 'text-green-500 font-bold' : isActive ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{step}</p>
                    {isActive && <p className="text-primary text-[0.72rem] font-mono mt-0.5">● IN PROGRESS</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChatPage({ setPage }: any) {
  const C = useC();
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");
  const send = () => { if (!input.trim()) return; setMessages((prev) => [...prev, { id: prev.length + 1, sender: "customer", name: "You", text: input, time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]); setInput(""); };
  return (
    <div className="page-enter max-w-2xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-10">
      <Card className="rounded-2xl overflow-hidden flex flex-col h-[600px] bg-background border-border shadow-md">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0">
          <Button variant="outline" size="icon" onClick={() => setPage("orders")} className="w-8 h-8 rounded-lg bg-surface-2 border-none" aria-label="Back"><ChevronLeft className="w-4 h-4 text-foreground" /></Button>
          <Avatar className="w-10 h-10 border border-border shadow-sm"><AvatarFallback className="text-white font-bold font-heading bg-primary">RK</AvatarFallback></Avatar>
          <div className="flex-1"><p className="text-foreground font-body font-bold text-sm">Ramesh Kumar</p><div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><p className="text-muted-foreground text-xs font-body">Delivery Partner · Online</p></div></div>
          <Button size="icon" className="rounded-full bg-primary/10 hover:bg-primary/20" aria-label="Call"><Phone className="w-4 h-4 text-primary" /></Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <div className={`px-4 py-2.5 font-body text-sm leading-relaxed ${msg.sender === "customer" ? 'text-white rounded-[18px_18px_4px_18px]' : 'bg-surface-2 text-foreground rounded-[18px_18px_18px_4px] border border-border'}`} style={msg.sender === "customer" ? { background: C.gradPrimary } : {}}>{msg.text}</div>
                  <p className={`text-muted-foreground text-[0.65rem] font-body mt-1 ${msg.sender === "customer" ? "text-right" : "text-left"}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 px-4 py-3 border-t border-border flex-shrink-0 bg-surface-1/50">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="flex-1 rounded-xl bg-background border-border text-foreground font-body h-10" />
          <Button onClick={send} size="icon" className="rounded-xl h-10 w-10 shadow-primary" style={{ background: C.gradPrimary }} aria-label="Send"><Send className="w-4 h-4 text-white" /></Button>
        </div>
      </Card>
    </div>
  );
}

function ReviewPage({ setPage }: any) {
  const C = useC();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="page-enter text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-primary text-white" style={{ background: C.gradPrimary }}><ThumbsUp className="w-8 h-8" /></div>
      <h3 className="text-foreground font-heading font-bold text-xl">Thanks for reviewing!</h3>
      <Button onClick={() => setPage("orders")} className="mt-5 rounded-2xl font-bold shadow-primary text-white px-8 py-6" style={{ background: C.gradPrimary }}>Back to Orders</Button>
    </div>
  );
  return (
    <div className="page-enter max-w-lg mx-auto px-4 py-8">
      <Card className="rounded-2xl p-6 space-y-5 bg-background border-border shadow-md">
        <h2 className="text-foreground font-heading font-bold text-xl">Rate Your Experience</h2>
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <Avatar className="w-12 h-12 shadow-primary"><AvatarFallback className="text-white font-bold font-heading bg-primary">S</AvatarFallback></Avatar>
          <div><p className="text-foreground font-body font-bold text-sm">Sparkle Home Services</p><p className="text-muted-foreground text-xs font-body mt-0.5">AC Deep Cleaning · ORD-2026-4850</p></div>
        </div>
        <div className="flex gap-3 justify-center">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)} aria-label={`Rate ${s} stars`}><Star className="w-10 h-10 transition-transform hover:scale-110 text-yellow-400" style={{ fill: s <= rating ? C.star : "transparent", strokeWidth: 1.5 }} /></button>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us about your experience…" rows={3} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none bg-surface-1 border border-border text-foreground font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary" aria-label="Review comments" />
        <Button disabled={rating === 0} onClick={() => setSubmitted(true)} className={`w-full py-6 rounded-2xl font-bold transition-all ${rating > 0 ? 'text-white shadow-primary' : 'bg-surface-2 text-muted-foreground'}`} style={rating > 0 ? { background: C.gradPrimary } : {}}>Submit Review</Button>
      </Card>
    </div>
  );
}

function DisputePage({ setPage }: any) {
  const C = useC();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="page-enter text-center py-16 px-4">
      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-500" />
      <h3 className="text-foreground font-heading font-bold text-xl">Dispute Filed</h3>
      <p className="text-muted-foreground font-body mt-2">Our team will review within 24 hours</p>
      <Button onClick={() => setPage("orders")} className="mt-5 px-8 py-6 rounded-2xl font-bold text-white shadow-primary" style={{ background: C.gradPrimary }}>Back to Orders</Button>
    </div>
  );
  return (
    <div className="page-enter max-w-lg mx-auto px-4 py-8">
      <Card className="rounded-2xl p-6 space-y-4 bg-background border-border shadow-md">
        <h2 className="text-foreground font-heading font-bold text-xl">File a Dispute</h2>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full rounded-xl bg-surface-1 border-border font-body text-sm h-11"><SelectValue placeholder="Select a reason…" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="late">Late delivery</SelectItem><SelectItem value="damaged">Damaged items</SelectItem><SelectItem value="missing">Missing items</SelectItem><SelectItem value="driver">Driver conduct</SelectItem><SelectItem value="wrong">Wrong items delivered</SelectItem>
          </SelectContent>
        </Select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe the issue in detail…" rows={4} className="w-full px-3 py-2.5 rounded-xl outline-none resize-none bg-surface-1 border border-border text-foreground font-body text-sm focus:border-primary focus:ring-1 focus:ring-primary" aria-label="Dispute notes" />
        <Button disabled={!reason} onClick={() => setSubmitted(true)} className={`w-full py-6 rounded-2xl font-bold transition-all ${reason ? 'bg-destructive text-white hover:bg-destructive/90' : 'bg-surface-2 text-muted-foreground'}`}>Submit Dispute</Button>
      </Card>
    </div>
  );
}

// ─── Profile Subcomponents Extracted ──────────────────────────────────────────
const SubHeader = ({ title, setActiveSection }: any) => (
  <div className="flex items-center gap-3 mb-6">
    <Button variant="outline" size="icon" onClick={() => setActiveSection(null)} className="w-9 h-9 rounded-xl bg-surface-2 border-border" aria-label="Back"><ChevronLeft className="w-5 h-5 text-foreground" /></Button>
    <h2 className="text-foreground font-heading font-bold text-xl">{title}</h2>
  </div>
);

const SavedAddressesView = ({ setActiveSection }: any) => {
  const [addresses, setAddresses] = useState([{ id: 1, label: "Home", icon: "home", address: "123 MG Road, Indiranagar, Bengaluru 560038", isDefault: true }, { id: 2, label: "Work", icon: "briefcase", address: "45 Koramangala 5th Block, Bengaluru 560095", isDefault: false }]);
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="page-enter">
      <SubHeader title="Saved Addresses" setActiveSection={setActiveSection} />
      <div className="space-y-3 mb-4 stagger-children">
        {addresses.map((addr) => (
          <Card key={addr.id} className={`rounded-2xl p-4 bg-background shadow-xs ${addr.isDefault ? 'border-primary/50' : 'border-border'}`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                {addr.icon === "briefcase" ? <Briefcase className="w-5 h-5 text-primary" /> : <Home className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><p className="text-foreground font-body font-bold text-sm">{addr.label}</p>{addr.isDefault && <Badge variant="secondary" className="bg-primary/10 text-primary">Default</Badge>}</div>
                <p className="text-muted-foreground font-body text-sm mt-1">{addr.address}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!showForm ? (
        <Button variant="outline" onClick={() => setShowForm(true)} className="w-full py-6 rounded-2xl font-bold border-2 border-dashed border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 font-body">Add New Address</Button>
      ) : (
        <Card className="rounded-2xl p-5 space-y-4 bg-background border-border shadow-xs"><p className="text-foreground font-body font-bold text-sm">New Address</p><Button variant="secondary" onClick={() => setShowForm(false)} className="w-full">Cancel</Button></Card>
      )}
    </div>
  );
};

const FavouritesView = ({ setActiveSection }: any) => {
  const [items, setItems] = useState([{ id: 1, name: "Parker Vector Pen", category: "Stationery", price: 199, img: "photo-1471107340929-a87cd0f5b5f3", catColor: "#6366F1" }]);
  return (
    <div className="page-enter"><SubHeader title="Favourites" setActiveSection={setActiveSection} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
        {items.map((item) => (
          <Card key={item.id} className="rounded-2xl overflow-hidden bg-background border-border shadow-xs">
            <div className="relative h-36"><img src={uimg(item.img, 400, 288)} alt={item.name} className="w-full h-full object-cover" /></div>
            <div className="p-3"><p className="text-foreground font-body font-semibold text-sm">{item.name}</p><p className="text-primary font-heading font-bold text-base mt-1">₹{item.price}</p></div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SettingsView = ({ setActiveSection, darkMode, setDarkMode }: any) => {
  const C = useC();
  return (
    <div className="page-enter"><SubHeader title="Settings" setActiveSection={setActiveSection} />
      <div className="space-y-5">
        <Card className="rounded-2xl p-5 bg-background border-border shadow-xs">
          <p className="text-foreground font-body font-bold mb-4">Notifications & App</p>
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div><p className="text-foreground font-body font-semibold text-sm">Dark Mode</p><p className="text-muted-foreground text-xs font-body mt-0.5">Switch theme</p></div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" />
          </div>
          <div className="flex items-center justify-between py-3">
            <div><p className="text-foreground font-body font-semibold text-sm">Push Notifications</p><p className="text-muted-foreground text-xs font-body mt-0.5">Order updates</p></div>
            <Switch defaultChecked aria-label="Toggle push notifications" />
          </div>
        </Card>
        <Card className="rounded-2xl p-5 bg-background border-border shadow-xs">
          <p className="text-foreground font-body font-bold mb-4">Edit Profile</p>
          <div className="space-y-3">
            <div><Label className="text-muted-foreground text-xs font-body font-semibold">Name</Label><Input defaultValue="Jane Doe" className="mt-1 rounded-xl bg-surface-1 border-border font-body" /></div>
            <div><Label className="text-muted-foreground text-xs font-body font-semibold">Phone</Label><Input defaultValue="+1 234 567 8900" className="mt-1 rounded-xl bg-surface-1 border-border font-body" /></div>
            <div><Label className="text-muted-foreground text-xs font-body font-semibold">Email</Label><Input defaultValue="contact@nestigo.com" className="mt-1 rounded-xl bg-surface-1 border-border font-body" /></div>
          </div>
          <Button className="mt-5 w-full py-6 rounded-xl font-bold text-white shadow-primary" style={{ background: C.gradPrimary }}>Save Changes</Button>
        </Card>
      </div>
    </div>
  );
};

const ReferView = ({ setActiveSection }: any) => {
  return (
    <div className="space-y-4 page-enter">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="rounded-full -ml-2 text-muted-foreground"><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-foreground font-heading font-bold text-xl">Refer & Earn</h2>
      </div>
      <Card className="rounded-2xl p-6 bg-background border-border shadow-sm text-center">
        <Gift className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="font-heading font-bold text-lg mb-2">Invite Friends, Earn ₹100</h3>
        <p className="text-muted-foreground text-sm font-body mb-6">Share your referral link with friends. You both earn ₹100 when they complete their first order.</p>
        <div className="bg-surface-1 p-3 rounded-xl border border-border flex items-center justify-between mb-4">
          <span className="font-mono text-sm">NESTIGO-REF-X9A2</span>
          <Button size="sm" variant="outline" className="h-8">Copy</Button>
        </div>
        <Button className="w-full rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold">Share Link</Button>
      </Card>
    </div>
  );
};

const ReviewsView = ({ setActiveSection }: any) => {
  return (
    <div className="space-y-4 page-enter">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setActiveSection(null)} className="rounded-full -ml-2 text-muted-foreground"><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-foreground font-heading font-bold text-xl">My Reviews</h2>
      </div>
      <Card className="rounded-2xl p-6 bg-background border-border shadow-sm">
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <Star className="w-10 h-10 mb-3 text-orange-400 opacity-50" />
          <p className="font-body font-medium">You have written 3 reviews.</p>
          <p className="text-sm mt-1">We'll display them here in a future update.</p>
        </div>
      </Card>
    </div>
  );
};

const ProfilePage = ({ onLogout, darkMode, setDarkMode, setPage }: any) => {
  const C = useC();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  if (activeSection === "addresses") return <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10"><SavedAddressesView setActiveSection={setActiveSection} /></div>;
  if (activeSection === "favourites") return <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10"><FavouritesView setActiveSection={setActiveSection} /></div>;
  if (activeSection === "refer") return <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10"><ReferView setActiveSection={setActiveSection} /></div>;
  if (activeSection === "reviews") return <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10"><ReviewsView setActiveSection={setActiveSection} /></div>;
  if (activeSection === "settings") return <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10"><SettingsView setActiveSection={setActiveSection} darkMode={darkMode} setDarkMode={setDarkMode} /></div>;
  if (activeSection) return <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10"><SettingsView setActiveSection={setActiveSection} darkMode={darkMode} setDarkMode={setDarkMode} /></div>;

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <h2 className="text-foreground font-heading font-bold text-2xl mb-6">My Account</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="rounded-2xl p-6 relative overflow-hidden border-none" style={{ background: C.gradHero }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `linear-gradient(${C.primary}40 1px,transparent 1px),linear-gradient(90deg,${C.primary}40 1px,transparent 1px)`, backgroundSize: "24px 24px" }} />
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: C.grad }} />
            <div className="relative z-10 flex items-center gap-4 mb-5">
              <Avatar className="w-16 h-16 rounded-2xl shadow-primary" style={{ background: C.gradPrimary }}><AvatarFallback className="text-white font-heading font-black text-xl bg-transparent">JD</AvatarFallback></Avatar>
              <div>
                <p className="font-mono font-semibold text-[0.62rem] tracking-[0.08em]" style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NESTIGO GOLD MEMBER</p>
                <h3 className="text-white font-heading font-extrabold text-lg mt-1">Jane Doe</h3>
                <p className="text-white/60 font-body text-xs mt-0.5">contact@nestigo.com</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl p-5 bg-background border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-cyan-500" /><p className="text-foreground font-body font-bold">Wallet</p></div>
              <p className="text-primary font-heading font-black text-lg">₹4,835</p>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
            {[ { icon: MapPin, label: "Saved Addresses", sub: "3 locations saved", color: "text-primary", bg: "bg-primary/10", section: "addresses" }, { icon: Heart, label: "Favourites", sub: "6 saved items", color: "text-pink-500", bg: "bg-pink-500/10", section: "favourites" }, { icon: Star, label: "My Reviews", sub: "3 reviews written", color: "text-orange-500", bg: "bg-orange-500/10", section: "reviews" }, { icon: Gift, label: "Refer & Earn", sub: "₹100 per referral", color: "text-green-500", bg: "bg-green-500/10", section: "refer" }, { icon: Package, label: "Order History", sub: "47 total orders", color: "text-cyan-500", bg: "bg-cyan-500/10", page: "orders" }, { icon: Settings, label: "Settings", sub: "Preferences & privacy", color: "text-muted-foreground", bg: "bg-surface-2", section: "settings" } ].map((item: any) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} onClick={() => item.page ? setPage(item.page) : setActiveSection(item.section)} className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover-lift cursor-pointer bg-background border-border shadow-xs">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}><Icon className={`w-5 h-5 ${item.color}`} /></div>
                  <div className="flex-1"><p className="text-foreground font-body font-bold text-sm">{item.label}</p><p className="text-muted-foreground text-xs font-body mt-0.5">{item.sub}</p></div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                </Card>
              );
            })}
          </div>
          <Button variant="destructive" onClick={onLogout} className="w-full py-6 rounded-2xl font-bold font-body bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
        </div>
      </div>
    </div>
  );
};

export function CustomerPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage] = useState("home");
  const [activeVertical, setActiveVertical] = useState("stationery");
  const [activeOrderId, setActiveOrderId] = useState(mockOrders[1].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQ, setSearchQ] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate = (page: string) => setActivePage(page);

  // In order to apply dark mode, we wrap the app in a div that toggles 'dark' class
  return (
    <DarkCtx.Provider value={darkMode}>
      <div className={`min-h-screen font-body text-foreground bg-surface-1 ${darkMode ? "dark" : ""}`}>
        <TopNav activePage={activePage} setPage={navigate} cartCount={cartCount} searchQ={searchQ} setSearchQ={setSearchQ} />
        <main>
          {activePage === "home" && <HomePage setPage={navigate} setActiveVertical={(v: any) => { setActiveVertical(v); navigate("store"); }} />}
          {activePage === "search" && <SearchPage q={searchQ} setQ={setSearchQ} setPage={navigate} setActiveVertical={setActiveVertical} />}
          {activePage === "store" && <StorePage vertical={activeVertical} cart={cart} setCart={setCart} setPage={navigate} />}
          {activePage === "cart" && <CartPage cart={cart} setCart={setCart} setPage={navigate} />}
          {activePage === "checkout" && <CheckoutPage cart={cart} setPage={navigate} setCart={setCart} />}
          {activePage === "orders" && <OrdersPage setPage={navigate} setActiveOrderId={setActiveOrderId} />}
          {activePage === "tracking" && <TrackingPage orderId={activeOrderId} setPage={navigate} />}
          {activePage === "chat" && <ChatPage setPage={navigate} />}
          {activePage === "review" && <ReviewPage setPage={navigate} />}
          {activePage === "dispute" && <DisputePage setPage={navigate} />}
          {activePage === "profile" && <ProfilePage onLogout={onLogout} darkMode={darkMode} setDarkMode={setDarkMode} setPage={navigate} />}
        </main>
        <BottomNav active={activePage} setActive={navigate} cartCount={cartCount} />
      </div>
    </DarkCtx.Provider>
  );
}

import { useState, useRef, useEffect, createContext, useContext } from "react";
import stationeryImg from "@/imports/Stationery-Item.jpg";
import {
  Home, Search, ShoppingCart, Package, User, Star, MessageSquare,
  MapPin, ChevronRight, Plus, Minus, X, Truck, CheckCircle2,
  AlertCircle, Move, Cake, Wrench, Navigation, BookMarked,
  CreditCard, Upload, Send, ThumbsUp, Flag, Zap, Bell,
  Heart, Clock, ChevronDown, Wallet, ArrowRight, Flame, Gift,
  Phone, LogOut, Settings, ChevronLeft, Tag, Filter, Sparkles,
  Copy, Check, ToggleLeft, ToggleRight, Trash2, Edit2, Navigation2,
  Briefcase, Users, Car, UtensilsCrossed, Paintbrush,
  Hammer, Wind, ChefHat, Scissors, Shirt, PartyPopper, Droplets,
  Mail, Linkedin, Globe, Quote
} from "lucide-react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary:    "#7C3AED",
  pink:       "#D946EF",
  orange:     "#F59E0B",
  blue:       "#38BDF8",
  cyan:       "#06B6D4",
  success:    "#22C55E",
  danger:     "#EF4444",
  dark:       "#0B1020",
  darkCard:   "#141B2D",
  heading:    "#111827",
  body:       "#4B5563",
  secondary:  "#6B7280",
  muted:      "#9CA3AF",
  border:     "#E5E7EB",
  bg:         "#FFFFFF",
  bgLight:    "#F8FAFC",
  section:    "#F1F5F9",
  price:      "#7C3AED",
  offer:      "#EC4899",
  discount:   "#22C55E",
  star:       "#FBBF24",
  grad:       "linear-gradient(90deg,#38BDF8 0%,#7C3AED 35%,#D946EF 70%,#F59E0B 100%)",
  gradPrimary:"linear-gradient(135deg,#7C3AED,#D946EF)",
  gradHero:   "radial-gradient(circle at top left,#3B2C85 0%,transparent 35%),radial-gradient(circle at bottom center,#4C1D95 0%,transparent 40%),radial-gradient(circle at right,#0F766E 0%,transparent 30%),#0B1020",
  shadowSm:   "0 2px 8px rgba(0,0,0,.08)",
  shadowMd:   "0 8px 24px rgba(0,0,0,.12)",
  shadowLg:   "0 20px 50px rgba(0,0,0,.18)",
  shadowBtn:  "0 10px 25px rgba(124,58,237,.35)",
};

// Dark-mode color overrides
const DARK_C = {
  ...C,
  bg:       "#0B1020",
  bgLight:  "#141B2D",
  section:  "#1A2235",
  darkCard: "#0D1424",
  heading:  "#F8FAFC",
  body:     "#CBD5E1",
  secondary:"#94A3B8",
  muted:    "#64748B",
  border:   "#2C3244",
};

const DarkCtx = createContext(false);
const useC = () => { const d = useContext(DarkCtx); return d ? DARK_C : C; };

const SG = "'Space Grotesk', system-ui, sans-serif";
const IN = "'Inter', system-ui, sans-serif";
const JB = "'JetBrains Mono', monospace";

// ─── Data ─────────────────────────────────────────────────────────────────────
const VERTICAL_META: Record<string, {
  label: string; color: string; bg: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  unsplash: string; deliveryTime: string; rating: number; tagline: string; customImg?: string;
}> = {
  grocery:    { label: "Grocery",       color: "#22C55E", bg: "#22C55E15", icon: ShoppingCart, unsplash: "photo-1542838132-92c53300491e", deliveryTime: "10–20 min", rating: 4.8, tagline: "Fresh groceries fast"   },
  service:    { label: "Home Services", color: "#7C3AED", bg: "#7C3AED15", icon: Wrench,       unsplash: "photo-1581578731548-c64695cc6952", deliveryTime: "Same day",  rating: 4.6, tagline: "Expert professionals"  },
  shifting:   { label: "Shifting",      color: "#38BDF8", bg: "#38BDF815", icon: Move,         unsplash: "photo-1558618666-fcd25c85cd64", deliveryTime: "Scheduled", rating: 4.5, tagline: "Safe & reliable movers" },
  stationery: { label: "Stationery",    color: "#6366F1", bg: "#6366F115", icon: BookMarked,   unsplash: "photo-1583485088034-697b5bc54ccd", deliveryTime: "1–2 hrs",   rating: 4.7, tagline: "Pens, paper & more", customImg: stationeryImg },
  bakery:     { label: "Bakery",        color: "#EC4899", bg: "#EC489915", icon: Cake,         unsplash: "photo-1555507036-ab1f4038808a", deliveryTime: "30–45 min", rating: 4.9, tagline: "Fresh baked daily"      },
};

function VertIcon({ meta, size = "md" }: { meta: typeof VERTICAL_META[string]; size?: "sm" | "md" }) {
  const px = size === "sm" ? "w-2.5 h-2.5" : "w-5 h-5";
  if (meta.customImg) return <img src={meta.customImg} alt={meta.label} className={`${px} object-contain`} />;
  const Icon = meta.icon;
  return <Icon className={px} style={{ color: meta.color }} />;
}

// Ordered list for rendering — preserves insertion order explicitly
const VERTICAL_ORDER = ["grocery", "service", "shifting", "stationery", "bakery"];

const mockOrders = [
  { id: "ORD-2026-4891", vertical: "stationery", items: "Classmate Notebook x4, Parker Pen x2",      status: "completed",       total: 340,  date: "2026-07-27", provider: "PaperHouse Stationery", prescription: null },
  { id: "ORD-2026-4850", vertical: "service",    items: "AC Deep Cleaning (1.5 Ton)",                status: "picked_up",       total: 799,  date: "2026-07-28", provider: "Sparkle Home Services", prescription: null },
  { id: "ORD-2026-4812", vertical: "stationery", items: "Stapler, A4 Ream 500 sheets, Sketch Pens",  status: "confirmed",       total: 420,  date: "2026-07-28", provider: "NestiGo Stationery Hub", prescription: null },
  { id: "ORD-2026-4790", vertical: "shifting",   items: "2BHK Home Shifting + Packing",              status: "pending_payment", total: 4500, date: "2026-07-28", provider: "SafeShift Movers",       prescription: null },
  { id: "ORD-2026-4720", vertical: "bakery",     items: "Chocolate Truffle Cake 1kg, Croissants x6", status: "completed",      total: 599,  date: "2026-07-25", provider: "Baker\'s Delight",        prescription: null },
];

const catalogItems: Record<string, Array<{ id: string; name: string; price: number; mrp: number; unit: string; rx: boolean; stock: number; rating: number; img: string }>> = {
  grocery: [
    { id: "gr1", name: "Amul Gold Milk 1L",       price: 64,  mrp: 68,  unit: "per litre",  rx: false, stock: 200, rating: 4.8, img: "photo-1563636619-e9143da7973b" },
    { id: "gr2", name: "Fortune Sunflower Oil 1L", price: 149, mrp: 169, unit: "per bottle", rx: false, stock: 120, rating: 4.6, img: "photo-1474979266404-7eaacbcd87c5" },
    { id: "gr3", name: "Aashirvaad Atta 5kg",      price: 249, mrp: 289, unit: "per pack",   rx: false, stock: 80,  rating: 4.7, img: "photo-1509440159596-0249088772ff" },
    { id: "gr4", name: "Tata Salt 1kg",            price: 28,  mrp: 32,  unit: "per pack",   rx: false, stock: 500, rating: 4.9, img: "photo-1601648764658-cf37e8c89b70" },
    { id: "gr5", name: "Amul Butter 500g",         price: 275, mrp: 295, unit: "per pack",   rx: false, stock: 60,  rating: 4.8, img: "photo-1589985270826-4b7bb135bc9d" },
    { id: "gr6", name: "Organic Bananas (6 pcs)",  price: 49,  mrp: 60,  unit: "per bunch",  rx: false, stock: 100, rating: 4.7, img: "photo-1571771894821-ce9b6c11b08e" },
    { id: "gr7", name: "Amul Taaza Paneer 200g",   price: 75,  mrp: 85,  unit: "per pack",   rx: false, stock: 90,  rating: 4.6, img: "photo-1548869571-df702d24be9d" },
    { id: "gr8", name: "Maggi 2-Minute Noodles",   price: 14,  mrp: 16,  unit: "per pack",   rx: false, stock: 300, rating: 4.8, img: "photo-1555126634-323283e090fa" },
  ],
  stationery: [
    { id: "st1", name: "Classmate Notebook A4",  price: 55,  mrp: 65,  unit: "pack of 6",   rx: false, stock: 120, rating: 4.7, img: "photo-1583485088034-697b5bc54ccd" },
    { id: "st2", name: "Parker Vector Pen",       price: 199, mrp: 249, unit: "per piece",   rx: false, stock: 60,  rating: 4.8, img: "photo-1471107340929-a87cd0f5b5f3" },
    { id: "st3", name: "Stapler Heavy Duty",      price: 149, mrp: 199, unit: "per piece",   rx: false, stock: 40,  rating: 4.6, img: "photo-1583485088034-697b5bc54ccd" },
    { id: "st4", name: "A4 Paper Ream 75 GSM",    price: 299, mrp: 349, unit: "500 sheets",  rx: false, stock: 80,  rating: 4.5, img: "photo-1602610696673-b3d50e0d84c9" },
    { id: "st5", name: "Faber-Castell Sketch Set",price: 349, mrp: 429, unit: "set of 12",   rx: false, stock: 35,  rating: 4.9, img: "photo-1513542789411-b6a5d4f31634" },
    { id: "st6", name: "Scotch Tape Roll",        price: 49,  mrp: 59,  unit: "pack of 3",   rx: false, stock: 200, rating: 4.4, img: "photo-1583485088034-697b5bc54ccd" },
    { id: "st7", name: "Whiteboard Marker Set",   price: 120, mrp: 150, unit: "set of 4",    rx: false, stock: 55,  rating: 4.6, img: "photo-1471107340929-a87cd0f5b5f3" },
    { id: "st8", name: "Geometry Box Premium",    price: 189, mrp: 225, unit: "per piece",   rx: false, stock: 45,  rating: 4.7, img: "photo-1583485088034-697b5bc54ccd" },
  ],
  service: [
    { id: "s1", name: "AC Cleaning 1 Ton",    price: 599,  mrp: 799,  unit: "per unit",     rx: false, stock: 10, rating: 4.8, img: "photo-1581578731548-c64695cc6952" },
    { id: "s2", name: "AC Cleaning 1.5 Ton",  price: 799,  mrp: 999,  unit: "per unit",     rx: false, stock: 10, rating: 4.7, img: "photo-1581578731548-c64695cc6952" },
    { id: "s3", name: "Plumbing – Tap Repair",price: 299,  mrp: 399,  unit: "per job",      rx: false, stock: 15, rating: 4.6, img: "photo-1558618666-fcd25c85cd64" },
    { id: "s4", name: "Fan Installation",     price: 399,  mrp: 499,  unit: "per unit",     rx: false, stock: 8,  rating: 4.5, img: "photo-1558618666-fcd25c85cd64" },
    { id: "s5", name: "Bathroom Deep Clean",  price: 899,  mrp: 1199, unit: "per bathroom", rx: false, stock: 5,  rating: 4.9, img: "photo-1581578731548-c64695cc6952" },
  ],
  shifting: [
    { id: "sh1", name: "1BHK Home Shifting", price: 3500, mrp: 4200, unit: "starting", rx: false, stock: 5,  rating: 4.6, img: "photo-1558618666-fcd25c85cd64" },
    { id: "sh2", name: "2BHK Home Shifting", price: 4500, mrp: 5500, unit: "starting", rx: false, stock: 4,  rating: 4.7, img: "photo-1558618666-fcd25c85cd64" },
    { id: "sh3", name: "Packing Service",    price: 1200, mrp: 1500, unit: "per room", rx: false, stock: 10, rating: 4.5, img: "photo-1558618666-fcd25c85cd64" },
  ],
  bakery: [
    { id: "b1", name: "Chocolate Truffle Cake", price: 599, mrp: 699, unit: "500g",      rx: false, stock: 12, rating: 4.9, img: "photo-1488477181946-6428a0291777" },
    { id: "b2", name: "Butter Croissant",       price: 45,  mrp: 55,  unit: "per piece", rx: false, stock: 50, rating: 4.8, img: "photo-1555507036-ab1f4038808a" },
    { id: "b3", name: "Sourdough Bread",        price: 180, mrp: 220, unit: "per loaf",  rx: false, stock: 20, rating: 4.9, img: "photo-1509440159596-0249088772ff" },
    { id: "b4", name: "Mango Mousse Cake",      price: 699, mrp: 799, unit: "500g",      rx: false, stock: 8,  rating: 4.8, img: "photo-1567620905732-2d1ec7ab7445" },
  ],
};

const walletTxns = [
  { id: 1, type: "credit", amount: 4500, date: "Jul 22", desc: "Refund – Shifting cancelled", orderId: "ORD-2026-4650" },
  { id: 2, type: "debit",  amount: -340, date: "Jul 23", desc: "Stationery order",              orderId: "ORD-2026-4680" },
  { id: 3, type: "credit", amount: 85,   date: "Jul 25", desc: "Partial refund",               orderId: "ORD-2026-4701" },
  { id: 4, type: "debit",  amount: -599, date: "Jul 25", desc: "Bakery order",                 orderId: "ORD-2026-4720" },
];

const chatMessages = [
  { id: 1, sender: "driver",   name: "Ramesh K.", text: "I have picked up your order from PaperHouse Stationery, heading your way.", time: "14:32" },
  { id: 2, sender: "customer", name: "You",       text: "Great! I'm at Building B, 4th floor. Please call when downstairs.", time: "14:33" },
  { id: 3, sender: "driver",   name: "Ramesh K.", text: "Sure, will do! ETA 8 minutes.", time: "14:34" },
  { id: 4, sender: "driver",   name: "Ramesh K.", text: "I am at the gate. Coming up.", time: "14:41" },
];

type CartItem = { id: string; name: string; price: number; unit: string; quantity: number; rx: boolean };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uimg = (id: string, w = 400, h = 300) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=90&dpr=2`;

function StatusPill({ status }: { status: string }) {
  const C = useC();
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_payment: { label: "Pending Payment", color: "#F59E0B", bg: "#F59E0B15" },
    paid:            { label: "Paid",            color: "#38BDF8", bg: "#38BDF815" },
    confirmed:       { label: "Confirmed",       color: "#06B6D4", bg: "#06B6D415" },
    picked_up:       { label: "On the Way",      color: "#7C3AED", bg: "#7C3AED15" },
    completed:       { label: "Delivered",       color: "#22C55E", bg: "#22C55E15" },
    cancelled:       { label: "Cancelled",       color: "#EF4444", bg: "#EF444415" },
    refunded:        { label: "Refunded",        color: "#EC4899", bg: "#EC489915" },
  };
  const s = map[status] ?? { label: status, color: C.muted, bg: C.section };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ color: s.color, background: s.bg, fontFamily: IN }}>
      {s.label}
    </span>
  );
}

// ─── Top Navbar ───────────────────────────────────────────────────────────────
function TopNav({ activePage, setPage, cartCount, searchQ, setSearchQ }: {
  activePage: string; setPage: (p: string) => void; cartCount: number;
  searchQ: string; setSearchQ: (q: string) => void;
}) {
  const C = useC();
  return (
    <header className="sticky top-0 z-50 w-full"
      style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center gap-4">
        {/* Logo */}
        <button onClick={() => setPage("home")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: C.gradPrimary }}>
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <span style={{ fontFamily: SG, fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NestiGo
          </span>
        </button>

        {/* Location */}
        <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: C.section, border: `1px solid ${C.border}` }}>
          <MapPin className="w-3.5 h-3.5" style={{ color: C.primary }} />
          <span style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.8rem" }}>Indiranagar</span>
          <ChevronDown className="w-3 h-3" style={{ color: C.muted }} />
        </button>

        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{ background: C.bgLight, border: `1px solid ${C.border}`, maxWidth: "520px" }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
          <input
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); if (e.target.value) setPage("search"); }}
            onFocus={() => setPage("search")}
            placeholder="Search stationery, services, cakes, shifting…"
            className="flex-1 bg-transparent outline-none"
            style={{ color: C.heading, fontFamily: IN, fontSize: "0.875rem", minWidth: 0 }}
          />
          {searchQ && <button onClick={() => setSearchQ("")}><X className="w-3.5 h-3.5" style={{ color: C.muted }} /></button>}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <nav className="hidden lg:flex items-center gap-1 mr-1">
            {[
              { id: "home",    label: "Home",   icon: Home    },
              { id: "orders",  label: "Orders", icon: Package },
              { id: "profile", label: "Account",icon: User    },
            ].map((nl) => {
              const Icon = nl.icon;
              const on = activePage === nl.id;
              return (
                <button key={nl.id} onClick={() => setPage(nl.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all"
                  style={{ background: on ? "#7C3AED15" : "transparent", color: on ? C.primary : C.secondary, fontFamily: IN, fontWeight: 600, fontSize: "0.82rem" }}>
                  <Icon className="w-4 h-4" />{nl.label}
                </button>
              );
            })}
          </nav>

          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: C.section, border: `1px solid ${C.border}` }}>
            <Bell className="w-4 h-4" style={{ color: C.secondary }} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: C.danger }} />
          </button>

          <button onClick={() => setPage("cart")}
            className="relative flex items-center gap-2 px-3 py-2 rounded-xl ml-1 transition-all"
            style={{ background: cartCount > 0 ? C.gradPrimary : C.section, border: cartCount > 0 ? "none" : `1px solid ${C.border}`, boxShadow: cartCount > 0 ? C.shadowBtn : "none" }}>
            <ShoppingCart className="w-4 h-4" style={{ color: cartCount > 0 ? "white" : C.secondary }} />
            {cartCount > 0 && <span style={{ color: "white", fontFamily: SG, fontWeight: 700, fontSize: "0.82rem" }}>{cartCount}</span>}
          </button>

          <button onClick={() => setPage("profile")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ml-1"
            style={{ background: C.gradPrimary, fontFamily: SG, boxShadow: C.shadowBtn }}>
            PS
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Bottom Nav (mobile only) ─────────────────────────────────────────────────
function BottomNav({ active, setActive, cartCount }: { active: string; setActive: (p: string) => void; cartCount: number }) {
  const C = useC();
  const tabs = [
    { id: "home",    icon: Home,         label: "Home"   },
    { id: "search",  icon: Search,       label: "Search" },
    { id: "cart",    icon: ShoppingCart, label: "Cart"   },
    { id: "orders",  icon: Package,      label: "Orders" },
    { id: "profile", icon: User,         label: "Me"     },
  ];
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ background: C.bg, borderTop: `1px solid ${C.border}`, boxShadow: "0 -4px 16px rgba(0,0,0,.08)" }}>
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const on = active === tab.id;
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl relative"
              style={{ minWidth: "52px" }}>
              {tab.id === "cart" && cartCount > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                  style={{ background: C.danger, fontFamily: SG, fontSize: "0.58rem", fontWeight: 800 }}>
                  {cartCount}
                </span>
              )}
              <div className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{ background: on ? "#7C3AED15" : "transparent" }}>
                <Icon className="w-4 h-4" style={{ color: on ? C.primary : C.muted }} />
              </div>
              <span style={{ color: on ? C.primary : C.muted, fontSize: "0.6rem", fontFamily: IN, fontWeight: on ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ setPage, setActiveVertical }: { setPage: (p: string) => void; setActiveVertical: (v: string) => void }) {
  const C = useC();
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerPaused, setBannerPaused] = useState(false);
  const [modal, setModal] = useState<"about" | "blog" | null>(null);
  const banners = [
    { title: "Groceries in 10 Minutes",        subtitle: "Fresh staples, dairy & more",         badge: "10 MIN",        img: "photo-1542838132-92c53300491e", vertical: "grocery",    tint: "rgba(21,128,61,0.45)"    },
    { title: "Stationery Delivered in 1 Hr",  subtitle: "Notebooks, pens & office supplies",  badge: "FREE DELIVERY", img: "photo-1583485088034-697b5bc54ccd", vertical: "stationery", tint: "rgba(67,56,202,0.45)"    },
    { title: "Home Services at ₹599",         subtitle: "Expert professionals at your door",  badge: "40% OFF",       img: "photo-1581578731548-c64695cc6952", vertical: "service",    tint: "rgba(91,33,182,0.45)"    },
    { title: "Fresh Cakes Every Day",         subtitle: "Baked same morning, delivered hot",  badge: "NEW",           img: "photo-1555507036-ab1f4038808a",    vertical: "bakery",     tint: "rgba(157,23,77,0.45)"    },
    { title: "Safe Home Shifting",            subtitle: "Trusted packers & movers near you",  badge: "BOOK NOW",      img: "photo-1558618666-fcd25c85cd64",    vertical: "shifting",   tint: "rgba(7,89,133,0.45)"     },
  ];

  useEffect(() => {
    if (bannerPaused) return;
    const id = setInterval(() => setActiveBanner((p) => (p + 1) % banners.length), 3500);
    return () => clearInterval(id);
  }, [bannerPaused, banners.length]);

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">

      {/* ── Banner + category sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Banner */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden cursor-pointer" style={{ height: "240px" }}
            onClick={() => { setActiveVertical(banners[activeBanner].vertical); setPage("store"); }}
            onMouseEnter={() => setBannerPaused(true)}
            onMouseLeave={() => setBannerPaused(false)}>
            <img src={uimg(banners[activeBanner].img, 900, 480)} alt={banners[activeBanner].title}
              className="w-full h-full object-cover transition-all duration-500" />
            {/* light tint so image stays visible */}
            <div className="absolute inset-0" style={{ background: banners[activeBanner].tint }} />
            {/* bottom fade for text legibility */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold mb-2 inline-block"
                style={{ background: "#FFFFFF", color: C.primary, fontFamily: IN }}>
                {banners[activeBanner].badge}
              </span>
              <h3 style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.2 }}>
                {banners[activeBanner].title}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontFamily: IN, fontSize: "0.875rem", marginTop: "4px", marginBottom: "12px" }}>
                {banners[activeBanner].subtitle}
              </p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm"
                style={{ background: "rgba(255,255,255,0.2)", color: "white", fontFamily: IN, backdropFilter: "blur(8px)" }}>
                Order Now <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
            {/* Dots */}
            <div className="absolute bottom-4 right-4 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
              {banners.map((_, i) => (
                <button key={i} onClick={() => { setActiveBanner(i); setBannerPaused(true); setTimeout(() => setBannerPaused(false), 5000); }}
                  className="rounded-full transition-all"
                  style={{ width: i === activeBanner ? "20px" : "7px", height: "7px", background: i === activeBanner ? "white" : "rgba(255,255,255,0.4)" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Category sidebar */}
        <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
          {VERTICAL_ORDER.map((key) => { const meta = VERTICAL_META[key];
            const Icon = meta.icon;
            return (
              <button key={key}
                onClick={() => { setActiveVertical(key); setPage("store"); }}
                className="flex lg:flex-row items-center gap-2 lg:gap-3 p-2.5 lg:p-3 rounded-xl transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={uimg(meta.unsplash, 80, 80)} alt={meta.label} className="w-full h-full object-cover" />
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.82rem" }}>{meta.label}</p>
                  <p style={{ color: C.muted, fontSize: "0.68rem", fontFamily: IN }}>{meta.deliveryTime}</p>
                </div>
                <p className="lg:hidden text-center" style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.6rem" }}>{meta.label.split(" ")[0]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brand gradient promo strip ── */}
      <div className="mb-8 p-px rounded-2xl overflow-hidden" style={{ background: C.grad }}>
        <div className="px-5 py-3.5 rounded-2xl flex items-center gap-3" style={{ background: C.darkCard }}>
          <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: C.orange }} />
          <p style={{ color: "white", fontFamily: IN, fontWeight: 600, fontSize: "0.875rem", flex: 1 }}>
            Use code <strong style={{ color: C.orange }}>WELCOME10</strong> — 10% off on your first order · Min ₹199
          </p>
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
            style={{ background: C.gradPrimary, color: "white", fontFamily: IN, boxShadow: C.shadowBtn }}>
            COPY
          </button>
        </div>
      </div>

      {/* ── Nearby Stores ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.2rem" }}>Nearby Stores</h2>
          <button className="flex items-center gap-1 text-sm font-semibold"
            style={{ color: C.primary, fontFamily: IN }}>
            See all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {VERTICAL_ORDER.map((key) => { const meta = VERTICAL_META[key];
            const Icon = meta.icon;
            return (
              <button key={key}
                onClick={() => { setActiveVertical(key); setPage("store"); }}
                className="rounded-2xl overflow-hidden text-left transition-all hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                <div className="h-32 overflow-hidden">
                  <img src={uimg(meta.unsplash, 800, 512)} alt={meta.label} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, fontSize: "0.875rem" }}>{meta.label}</p>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}>
                      <VertIcon meta={meta} size="sm" />
                    </span>
                  </div>
                  <p style={{ color: C.muted, fontSize: "0.7rem", fontFamily: IN }}>{meta.tagline}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1" style={{ color: C.heading, fontSize: "0.72rem", fontFamily: IN }}>
                      <Star className="w-3 h-3" style={{ fill: C.star, color: C.star }} /> {meta.rating}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>
                      <Clock className="w-3 h-3" /> {meta.deliveryTime}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── All NestiGo Services ── */}
      <div className="mb-8">
        {/* Section hero */}
        <div className="rounded-2xl overflow-hidden mb-6 relative"
          style={{ background: "radial-gradient(circle at top left,#3B2C85 0%,transparent 40%),radial-gradient(circle at bottom right,#0F766E 0%,transparent 40%),#0B1020", padding: "2px" }}>
          <div className="rounded-2xl p-6 md:p-8" style={{ background: "radial-gradient(circle at top left,#3B2C85 0%,transparent 40%),radial-gradient(circle at bottom right,#0F766E 0%,transparent 40%),#0B1020" }}>
            {/* Top grad line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: C.grad }} />
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.gradPrimary }}>
                  <Zap className="w-3.5 h-3.5 text-white" fill="white" />
                </div>
                <span style={{ fontFamily: JB, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em", background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ALL NESTIGO SERVICES
                </span>
              </div>
              <h2 style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.2, marginBottom: "10px" }}>
                Home services, city-wide delivery and<br />
                <span style={{ background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>10-minute groceries</span>
              </h2>
              <p style={{ color: "rgba(248,250,252,0.6)", fontFamily: IN, fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "20px" }}>
                Book any service in seconds with verified pros and upfront pricing.
              </p>
              {/* Search bar */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}>
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} />
                <input placeholder="Search for electrician, cleaning, delivery…"
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: "white", fontFamily: IN, fontSize: "0.875rem" }}
                  onFocus={() => setPage("search")} readOnly />
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
                  style={{ background: C.gradPrimary, color: "white", fontFamily: IN, boxShadow: C.shadowBtn }}>
                  Search
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICE CARD RENDERER ── */}
        {(() => {
          const SvcCard = ({ svc }: { svc: { name: string; desc: string; from: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; img: string; color: string } }) => {
            const Icon = svc.icon;
            return (
              <button
                onClick={() => { setActiveVertical("service"); setPage("store"); }}
                className="rounded-2xl overflow-hidden text-left transition-all hover:shadow-lg hover:-translate-y-0.5 group"
                style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                <div className="relative h-28 overflow-hidden">
                  <img src={uimg(svc.img, 800, 448)} alt={svc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)" }} />
                  <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${svc.color}22`, backdropFilter: "blur(8px)", border: `1px solid ${svc.color}40` }}>
                    <Icon className="w-4 h-4" style={{ color: svc.color }} />
                  </div>
                  <div className="absolute bottom-2 left-2.5">
                    <span className="text-white text-xs font-bold" style={{ fontFamily: SG, textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
                      Starting at {svc.from}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, fontSize: "0.82rem", marginBottom: "3px" }}>{svc.name}</p>
                  <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.68rem", lineHeight: 1.4 }} className="line-clamp-2">{svc.desc}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span style={{ color: svc.color, fontFamily: SG, fontWeight: 800, fontSize: "0.82rem" }}>{svc.from}</span>
                    <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${svc.color}12`, color: svc.color, fontFamily: IN, fontWeight: 600 }}>
                      Book <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          };

          const homeServices = [
            { name: "Electrician",         desc: "Wiring, repairs, installations & switchboard fixes",                            from: "₹199",             icon: Zap,        img: "photo-1621905251189-08b1a4bda2b4", color: "#F59E0B" },
            { name: "Plumbing",            desc: "Leak repairs, pipe fitting & tap installations",                                from: "From ₹149",        icon: Wrench,     img: "photo-1585771724684-38269d6639fd", color: "#22C55E" },
            { name: "Carpenter",           desc: "Furniture repair, assembly & custom woodwork",                                  from: "From ₹249",        icon: Hammer,     img: "photo-1504148455328-c376907d081c", color: "#8B5CF6" },
            { name: "Painting",            desc: "Interior & exterior wall painting & touch-ups",                                 from: "₹999",             icon: Paintbrush, img: "photo-1589939705384-5185137a7f0f", color: "#D946EF" },
            { name: "Interior Renovation", desc: "Full home makeover — 3D design, material sourcing & execution",                 from: "₹999",             icon: Hammer,     img: "photo-1618221195710-dd6b41faaea6", color: "#F59E0B" },
            { name: "AC Services",         desc: "Installation, repair, gas refill & deep clean",                                 from: "₹449",             icon: Wind,       img: "photo-1631567091196-a4d5a6baa5c7", color: "#06B6D4" },
            { name: "Grannies Service",    desc: "Caring companion for your parents — daily tasks, medication & walks",           from: "From ₹1,000/2 hrs",icon: Heart,      img: "photo-1516307365426-bea591f05011", color: "#EC4899" },
            { name: "Home Chef",           desc: "Professional chef for small parties — multi-cuisine, fresh prep & cleanup",     from: "₹499/hr",          icon: ChefHat,    img: "photo-1556910103-1c02745aae4d", color: "#F59E0B" },
            { name: "Salon at Home",       desc: "Makeup, haircuts, facials & grooming by certified stylists",                    from: "₹499",             icon: Scissors,   img: "photo-1522337360788-8b13dee7a37e", color: "#D946EF" },
            { name: "Home Decor & Events", desc: "Birthdays, anniversaries & parties — balloons, themes & full decoration",       from: "₹1,499",           icon: PartyPopper,img: "photo-1530103862676-de8c9debad1d", color: "#EC4899" },
            { name: "Car Washing",         desc: "Exterior wash, interior vacuum & polish",                                       from: "₹349",             icon: Car,        img: "photo-1520340356584-f9917d1eea6f", color: "#38BDF8" },
            { name: "House Help",          desc: "Trained helpers for cleaning, dishwashing, laundry & daily chores",             from: "₹149/hr",          icon: Home,       img: "photo-1581579438747-1dc8d17bbce4", color: "#7C3AED" },
            { name: "Laundry Service",     desc: "Steam press ₹15/piece, dry cleaning for suits & delicates",                    from: "₹15/piece",        icon: Shirt,      img: "photo-1545173168-9f1947eebb7f", color: "#38BDF8" },
          ];

          const cleaningServices = [
            { name: "House Cleaning",    desc: "Deep cleaning, dusting, mopping & sanitization — starting at ₹999 for a 1000 sq ft home", from: "From ₹999", icon: Sparkles,        img: "photo-1558618047-3c8c76ca7d13", color: "#7C3AED" },
            { name: "Bathroom Cleaning", desc: "Tile scrubbing, fixture cleaning & disinfection",                                          from: "₹399",      icon: Droplets,        img: "photo-1552321554-5fefe8c9ef14", color: "#06B6D4" },
            { name: "Kitchen Cleaning",  desc: "Chimney, stove, countertop & cabinet deep clean",                                          from: "₹599",      icon: UtensilsCrossed, img: "photo-1556909114-f6e7ad7d3136", color: "#EC4899" },
          ];

          const SectionHeader = ({ title, sub, accentColor, accentBg }: { title: string; sub: string; accentColor: string; accentBg: string }) => (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.1rem" }}>{title}</h3>
                <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.78rem", marginTop: "2px" }}>{sub}</p>
              </div>
              <button onClick={() => { setActiveVertical("service"); setPage("store"); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold"
                style={{ color: accentColor, fontFamily: IN, background: accentBg }}>
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );

          return (
            <>
              {/* Home Services */}
              <div className="mb-8">
                <SectionHeader title="Home Services" sub="Trusted professionals at your doorstep" accentColor={C.primary} accentBg="#7C3AED10" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {homeServices.map((svc) => <SvcCard key={svc.name} svc={svc} />)}
                </div>
              </div>

              {/* Cleaning Services */}
              <div className="mb-2">
                {/* Section label strip */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: "#06B6D415", border: "1px solid #06B6D430" }}>
                    <Droplets className="w-3.5 h-3.5" style={{ color: "#06B6D4" }} />
                    <span style={{ color: "#06B6D4", fontFamily: IN, fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.04em" }}>CLEANING SERVICES</span>
                  </div>
                  <div className="flex-1 h-px" style={{ background: C.border }} />
                </div>
                <SectionHeader title="Cleaning Services" sub="Spotless results by trained cleaning experts" accentColor="#06B6D4" accentBg="#06B6D410" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cleaningServices.map((svc) => <SvcCard key={svc.name} svc={svc} />)}
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {[
          { label: "Active Orders",  value: "2",     sub: "in progress", color: C.primary, bg: "#7C3AED10" },
          { label: "Wallet Balance", value: "₹4,835",sub: "available",   color: C.cyan,    bg: "#06B6D410" },
          { label: "Total Orders",   value: "47",    sub: "all time",    color: C.pink,    bg: "#D946EF10" },
          { label: "Loyalty Points", value: "1,240", sub: "redeemable",  color: C.orange,  bg: "#F59E0B10" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4"
            style={{ background: s.bg, border: `1px solid ${C.border}` }}>
            <p style={{ color: s.color, fontFamily: SG, fontWeight: 900, fontSize: "1.5rem" }}>{s.value}</p>
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.82rem" }}>{s.label}</p>
            <p style={{ color: C.muted, fontSize: "0.7rem", fontFamily: IN }}>{s.sub}</p>
          </div>
        ))}
      </div>

    </div>

    {/* ── Reviews Section (full-width, dark bg) ── */}
    <section style={{ background: C.dark, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5" style={{ color: C.star, fill: C.star }} />
              <span style={{ color: C.star, fontFamily: IN, fontWeight: 700, fontSize: "0.82rem", letterSpacing: "0.04em" }}>
                4.9 / 5 · 2,400+ ratings
              </span>
            </div>
            <h2 style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.02em" }}>
              What our customers say
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {[1,2,3,4,5].map((s) => <Star key={s} className="w-5 h-5" style={{ color: C.star, fill: C.star }} />)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Priya Sharma",    city: "Bengaluru", vertical: "Home Services", rating: 5, avatar: "PS", color: C.primary,
              text: "Booked an electrician at 9 PM and he was at my door by 10:15 PM. Absolutely seamless — the NestiGo pro was polite, quick, and the pricing was exactly what was shown." },
            { name: "Rohan Kumar",     city: "Mumbai",    vertical: "Grocery",       rating: 5, avatar: "RK", color: "#22C55E",
              text: "Got my groceries in 11 minutes flat. The Amul milk was ice cold and the atta pack wasn't crushed. This is how delivery should be done — every single time." },
            { name: "Anjali Singh",    city: "Delhi",     vertical: "Bakery",        rating: 5, avatar: "AS", color: C.pink,
              text: "Ordered a custom chocolate truffle cake for my daughter's birthday. It arrived fresh and looked exactly like the picture. The whole family was blown away!" },
            { name: "Vikram Nair",     city: "Chennai",   vertical: "Shifting",      rating: 5, avatar: "VN", color: C.blue,
              text: "Our 2BHK shift was stress-free for the first time ever. The packers wrapped every piece of furniture carefully and nothing was damaged. 10/10 would use again." },
            { name: "Sunita Patel",    city: "Hyderabad", vertical: "Stationery",    rating: 5, avatar: "SP", color: "#6366F1",
              text: "Needed exam supplies at midnight before my son's board exam. NestiGo delivered notebooks, pens and geometry box within 90 minutes. Absolute lifesaver!" },
            { name: "Deepa Rao",       city: "Pune",      vertical: "Home Services", rating: 4, avatar: "DR", color: C.cyan,
              text: "The bathroom and kitchen deep clean was thorough — better than any service I've tried before. The team even cleaned behind the fridge without being asked. Impressed." },
          ].map((rev) => (
            <div key={rev.name} className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5" style={{ color: C.star, fill: i < rev.rating ? C.star : "transparent" }} />
                ))}
              </div>
              {/* Text */}
              <p style={{ color: "rgba(248,250,252,0.75)", fontFamily: IN, fontSize: "0.85rem", lineHeight: 1.7, flex: 1 }}>
                "{rev.text}"
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: `${rev.color}30`, border: `1px solid ${rev.color}50`, color: rev.color, fontFamily: SG }}>
                  {rev.avatar}
                </div>
                <div>
                  <p style={{ color: "white", fontFamily: SG, fontWeight: 700, fontSize: "0.82rem" }}>{rev.name}</p>
                  <p style={{ color: "rgba(248,250,252,0.4)", fontFamily: IN, fontSize: "0.7rem" }}>{rev.city} · {rev.vertical}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Footer (full-width, outside max-w-7xl) ── */}
    <footer style={{ background: "#0B1020", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: C.gradPrimary }}>
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span style={{ fontFamily: SG, fontWeight: 800, fontSize: "1.25rem", background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                NestiGo
              </span>
              <span style={{ fontFamily: IN, fontWeight: 600, fontSize: "0.6rem", letterSpacing: "0.08em", color: C.pink, background: "rgba(217,70,239,0.12)", border: "1px solid rgba(217,70,239,0.3)", borderRadius: 999, padding: "2px 8px" }}>
                SUPER APP
              </span>
            </div>
            <p style={{ color: "rgba(248,250,252,0.5)", fontFamily: IN, fontSize: "0.83rem", lineHeight: 1.7 }}>
              India{"'"}s all-in-one app for home services, same-day stationery, fresh bakery & city-wide shifting.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <p style={{ color: "white", fontFamily: SG, fontWeight: 700, fontSize: "0.9rem", marginBottom: "14px" }}>Services</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {["All Services", "Cleaning", "Electrical", "Plumbing"].map((s) => (
                <li key={s}>
                  <a href="#" style={{ color: "rgba(248,250,252,0.5)", fontFamily: IN, fontSize: "0.83rem", textDecoration: "none" }}
                    className="hover:text-white transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <p style={{ color: "white", fontFamily: SG, fontWeight: 700, fontSize: "0.9rem", marginBottom: "14px" }}>Company</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <button onClick={() => setModal("about")}
                  style={{ color: "rgba(248,250,252,0.5)", fontFamily: IN, fontSize: "0.83rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  className="hover:text-white transition-colors">About Us</button>
              </li>
              <li>
                <button onClick={() => setModal("blog")}
                  style={{ color: "rgba(248,250,252,0.5)", fontFamily: IN, fontSize: "0.83rem", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  className="hover:text-white transition-colors">Blog</button>
              </li>
              {["NestiGo Reviews", "Careers"].map((s) => (
                <li key={s}>
                  <a href="#" style={{ color: "rgba(248,250,252,0.5)", fontFamily: IN, fontSize: "0.83rem", textDecoration: "none" }}
                    className="hover:text-white transition-colors">{s}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <p style={{ color: "white", fontFamily: SG, fontWeight: 700, fontSize: "0.9rem", marginBottom: "14px" }}>Contact</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { icon: Phone, value: "+91 70173 80028" },
                { icon: Mail,  value: "agamyamehrota.911@gmail.com" },
                { icon: Globe, value: "Help Center" },
              ].map((ct) => {
                const Icon = ct.icon;
                return (
                  <div key={ct.value} className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(124,58,237,0.8)" }} />
                    <span style={{ color: "rgba(248,250,252,0.5)", fontFamily: IN, fontSize: "0.8rem" }}>{ct.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <p style={{ color: "rgba(248,250,252,0.3)", fontFamily: JB, fontSize: "0.72rem" }}>
            © 2026 NestiGo. All rights reserved. Built in India.
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            {[C.primary, C.pink, C.orange, C.cyan].map((col, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: col, opacity: 0.6 }} />
            ))}
          </div>
        </div>
      </div>
    </footer>

    {/* ── About Us Modal ── */}
    {modal === "about" && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setModal(null)}>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{ background: C.bg, boxShadow: C.shadowLg }}
          onClick={(e) => e.stopPropagation()}>
          {/* Modal header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-3xl"
            style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.gradPrimary }}>
                <Zap className="w-3.5 h-3.5 text-white" fill="white" />
              </div>
              <span style={{ fontFamily: SG, fontWeight: 700, fontSize: "1rem", color: C.heading }}>About NestiGo</span>
            </div>
            <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: C.section }}>
              <X className="w-4 h-4" style={{ color: C.secondary }} />
            </button>
          </div>

          <div className="p-6">
            {/* Founder image */}
            <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: "260px" }}>
              <img src={uimg("photo-1507003211169-0a1dd7228f2d", 800, 520)} alt="Agamya Mehrotra"
                className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(11,16,32,0.85) 0%, transparent 50%)" }} />
              <div className="absolute bottom-5 left-5">
                <p style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "1.15rem" }}>Agamya Mehrotra</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontFamily: IN, fontSize: "0.82rem" }}>Founder & CEO, NestiGo</p>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
                style={{ background: C.gradPrimary }}>
                <span style={{ color: "white", fontFamily: IN, fontWeight: 700, fontSize: "0.72rem" }}>Meet the Founder</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { val: "5+", label: "Verticals", color: C.primary },
                { val: "12+", label: "Cities", color: C.cyan },
                { val: "1,200+", label: "Active orders", color: C.pink },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: C.section, border: `1px solid ${C.border}` }}>
                  <p style={{ color: s.color, fontFamily: SG, fontWeight: 800, fontSize: "1.3rem" }}>{s.val}</p>
                  <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.72rem" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <h3 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.3rem", marginBottom: "12px", letterSpacing: "-0.02em" }}>
              Building India{"'"}s Most Trusted Home Super-App
            </h3>
            <p style={{ color: C.body, fontFamily: IN, fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "12px" }}>
              NestiGo was born from a simple frustration — why do we need five different apps for home services, stationery, bakery, and shifting? Agamya Mehrotra set out to change that in 2025, building a single trusted hub for everything your home needs.
            </p>
            <p style={{ color: C.body, fontFamily: IN, fontSize: "0.9rem", lineHeight: 1.75, marginBottom: "20px" }}>
              From verified professionals to same-day delivery and transparent pricing, every feature is designed to save you time and give you complete peace of mind.
            </p>

            {/* Quote */}
            <div className="relative p-4 rounded-2xl mb-6" style={{ background: C.section, border: `1px solid ${C.border}` }}>
              <Quote className="w-7 h-7 absolute -top-2.5 -left-1" style={{ color: C.primary, opacity: 0.25 }} />
              <p style={{ color: C.heading, fontFamily: SG, fontWeight: 600, fontSize: "0.95rem", fontStyle: "italic", lineHeight: 1.6 }}>
                "We{"'"}re not just an app. We{"'"}re the neighbour you can always count on."
              </p>
              <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.75rem", marginTop: "6px" }}>— Agamya Mehrotra, Founder</p>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Phone,    label: "Call",    value: "+91 70173 80028",           color: C.success, href: "tel:+917017380028" },
                { icon: Mail,     label: "Email",   value: "agamyamehrota.911@gmail.com", color: C.primary, href: "mailto:agamyamehrota.911@gmail.com" },
                { icon: Linkedin, label: "Connect", value: "LinkedIn",                  color: "#0A66C2", href: "#" },
              ].map((ct) => {
                const Icon = ct.icon;
                return (
                  <a key={ct.label} href={ct.href}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:shadow-md"
                    style={{ background: C.bgLight, border: `1px solid ${C.border}`, textDecoration: "none" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ct.color}15` }}>
                      <Icon className="w-4 h-4" style={{ color: ct.color }} />
                    </div>
                    <div>
                      <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.65rem", fontWeight: 600 }}>{ct.label}</p>
                      <p style={{ color: C.heading, fontFamily: IN, fontSize: "0.72rem", fontWeight: 700 }}>{ct.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* ── Blog Modal ── */}
    {modal === "blog" && (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setModal(null)}>
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} />
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
          style={{ background: C.bg, boxShadow: C.shadowLg }}
          onClick={(e) => e.stopPropagation()}>
          {/* Modal header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-3xl"
            style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: C.primary }} />
              <span style={{ fontFamily: SG, fontWeight: 700, fontSize: "1rem", color: C.heading }}>From the NestiGo Blog</span>
            </div>
            <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: C.section }}>
              <X className="w-4 h-4" style={{ color: C.secondary }} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Featured post */}
            <div className="p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg"
              style={{ background: C.section, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#F59E0B20", color: C.orange, fontFamily: IN }}>Featured</span>
                <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted, fontFamily: IN }}>
                  <Clock className="w-3 h-3" /> April 15, 2026 · 5 min read
                </span>
              </div>
              <h3 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.15rem", lineHeight: 1.3, marginBottom: "8px" }}>
                Why we built NestiGo — one app for everything your home needs
              </h3>
              <p style={{ color: C.body, fontFamily: IN, fontSize: "0.85rem", lineHeight: 1.7, marginBottom: "12px" }}>
                From fixing a leaky tap to organising your child{"'"}s birthday, here{"'"}s the story of how NestiGo became a single trusted hub for everyday services.
              </p>
              <span className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: C.primary, fontFamily: IN }}>
                Read full story <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Two smaller posts */}
            {[
              {
                tag: "New Service", tagColor: C.primary, tagBg: "#7C3AED15",
                date: "April 8, 2026",
                title: "Introducing Grannies — companion care for the parents we love",
                body: "A first-of-its-kind service designed to bring warmth, conversation and a little help into the homes of our elderly family members.",
              },
              {
                tag: "Trust & Safety", tagColor: "#6366F1", tagBg: "#6366F115",
                date: "March 30, 2026",
                title: "How we verify every NestiGo Pro before they enter your home",
                body: "A look behind the scenes at our 24–48 hour verification process — background checks, skill assessments and ongoing quality reviews.",
              },
            ].map((post) => (
              <div key={post.title} className="p-5 rounded-2xl cursor-pointer transition-all hover:shadow-lg"
                style={{ background: C.bgLight, border: `1px solid ${C.border}` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: post.tagBg, color: post.tagColor, fontFamily: IN }}>{post.tag}</span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: C.muted, fontFamily: IN }}>
                    <Clock className="w-3 h-3" /> {post.date}
                  </span>
                </div>
                <h4 style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1rem", lineHeight: 1.35, marginBottom: "8px" }}>
                  {post.title}
                </h4>
                <p style={{ color: C.body, fontFamily: IN, fontSize: "0.83rem", lineHeight: 1.65, marginBottom: "12px" }}>
                  {post.body}
                </p>
                <span className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: C.primary, fontFamily: IN }}>
                  Read more <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// ─── Search Page ──────────────────────────────────────────────────────────────
function SearchPage({ q, setQ, setPage, setActiveVertical }: {
  q: string; setQ: (v: string) => void; setPage: (p: string) => void; setActiveVertical: (v: string) => void;
}) {
  const C = useC();
  const trending = ["AC Cleaning", "Notebooks", "Chocolate Cake", "2BHK Shifting", "Parker Pen", "Sketch Pens"];
  const recent   = ["Classmate Notebook", "Sketch Set"];
  const results  = Object.entries(catalogItems).flatMap(([vertical, items]) =>
    items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())).map((item) => ({ ...item, vertical }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      {!q ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {recent.length > 0 && (
              <div>
                <p style={{ color: C.body, fontFamily: IN, fontWeight: 700, fontSize: "0.875rem", marginBottom: "10px" }}>Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button key={r} onClick={() => setQ(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: C.section, border: `1px solid ${C.border}`, color: C.body, fontFamily: IN, fontSize: "0.8rem" }}>
                      <Clock className="w-3 h-3" style={{ color: C.muted }} />{r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p style={{ color: C.body, fontFamily: IN, fontWeight: 700, fontSize: "0.875rem", marginBottom: "10px" }}>
                <Flame className="w-3.5 h-3.5 inline mr-1" style={{ color: C.orange }} />Trending
              </p>
              <div className="flex flex-wrap gap-2">
                {trending.map((t, i) => {
                  const colors = [C.primary, C.pink, C.cyan, C.orange, "#22C55E", C.blue];
                  const col = colors[i % colors.length];
                  return (
                    <button key={t} onClick={() => setQ(t)}
                      className="px-3 py-1.5 rounded-full font-semibold text-sm"
                      style={{ background: `${col}12`, color: col, fontFamily: IN, border: "none" }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <p style={{ color: C.body, fontFamily: IN, fontWeight: 700, fontSize: "0.875rem", marginBottom: "10px" }}>Browse Categories</p>
            <div className="space-y-2">
              {VERTICAL_ORDER.map((key) => { const meta = VERTICAL_META[key];
                const Icon = meta.icon;
                return (
                  <button key={key} onClick={() => { setActiveVertical(key); setPage("store"); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left hover:shadow-md transition-all"
                    style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={uimg(meta.unsplash, 80, 80)} alt={meta.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }}>{meta.label}</p>
                      <p style={{ color: C.muted, fontSize: "0.7rem", fontFamily: IN }}>{meta.deliveryTime}</p>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: C.muted }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.875rem", marginBottom: "16px" }}>
            {results.length} results for "<strong style={{ color: C.heading }}>{q}</strong>"
          </p>
          {results.length === 0 ? (
            <div className="text-center py-24">
              <Search className="w-12 h-12 mx-auto mb-3" style={{ color: C.border }} />
              <p style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.1rem" }}>No results found</p>
              <p style={{ color: C.muted, fontFamily: IN, marginTop: "6px", fontSize: "0.875rem" }}>Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {results.map((item) => (
                <button key={item.id} onClick={() => { setActiveVertical(item.vertical); setPage("store"); }}
                  className="flex items-center gap-3 p-3 rounded-xl text-left hover:shadow-md transition-all"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={uimg(item.img, 112, 112)} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }} className="truncate">{item.name}</p>
                    <p style={{ color: C.muted, fontSize: "0.7rem", fontFamily: IN }}>{item.unit}</p>
                    <p style={{ color: C.price, fontFamily: SG, fontWeight: 700, fontSize: "0.9rem", marginTop: "2px" }}>₹{item.price}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Store / Catalog Page ─────────────────────────────────────────────────────
function StorePage({ vertical, cart, setCart, setPage }: {
  vertical: string; cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setPage: (p: string) => void;
}) {
  const C = useC();
  const [activeV, setActiveV] = useState(vertical);
  const [search, setSearch]   = useState("");
  const meta  = VERTICAL_META[activeV];
  const items = (catalogItems[activeV] ?? []).filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (item: typeof items[0]) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      if (ex) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, unit: item.unit, quantity: 1, rx: item.rx }];
    });
  };
  const removeFromCart = (id: string) =>
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c).filter((c) => c.quantity > 0));
  const qty       = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-24 lg:pb-10">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6" style={{ height: "200px" }}>
        <img src={uimg(meta.unsplash, 1400, 400)} alt={meta.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(11,16,32,0.75) 40%,transparent)" }} />
        <button onClick={() => setPage("home")}
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)", boxShadow: C.shadowSm }}>
          <ChevronLeft className="w-5 h-5" style={{ color: C.heading }} />
        </button>
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <h2 style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "1.8rem" }}>{meta.label}</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontFamily: IN, fontSize: "0.875rem", marginBottom: "10px" }}>{meta.tagline}</p>
          <div className="flex items-center gap-4">
            <span style={{ color: "white", fontSize: "0.82rem", fontFamily: IN }} className="flex items-center gap-1">
              <Star className="w-4 h-4" style={{ fill: C.star, color: C.star }} /> {meta.rating}
            </span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.82rem", fontFamily: IN }} className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {meta.deliveryTime}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar – desktop */}
        <div className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl overflow-hidden"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
            {VERTICAL_ORDER.map((key) => { const m = VERTICAL_META[key];
              const Icon = m.icon;
              const on = activeV === key;
              return (
                <button key={key} onClick={() => setActiveV(key)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-left border-b transition-all"
                  style={{ borderColor: C.border, background: on ? "#7C3AED08" : "transparent", borderLeft: on ? `3px solid ${C.primary}` : "3px solid transparent" }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: on ? C.primary : C.muted }} />
                  <span style={{ color: on ? C.primary : C.body, fontFamily: IN, fontWeight: on ? 700 : 500, fontSize: "0.82rem" }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 lg:hidden" style={{ scrollbarWidth: "none" }}>
            {VERTICAL_ORDER.map((key) => { const m = VERTICAL_META[key];
              const Icon = m.icon;
              return (
                <button key={key} onClick={() => setActiveV(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
                  style={{ background: activeV === key ? C.primary : C.section, color: activeV === key ? "white" : C.secondary, fontFamily: IN, fontSize: "0.78rem", fontWeight: 600, border: "none" }}>
                  <Icon className="w-3 h-3" />{m.label}
                </button>
              );
            })}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: C.bgLight, border: `1px solid ${C.border}` }}>
              <Search className="w-4 h-4" style={{ color: C.muted }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${meta.label}…`}
                className="flex-1 bg-transparent outline-none"
                style={{ color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl"
              style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.body, fontFamily: IN, fontSize: "0.82rem" }}>
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const q = qty(item.id);
              const discount = Math.round(((item.mrp - item.price) / item.mrp) * 100);
              return (
                <div key={item.id} className="rounded-2xl overflow-hidden transition-all hover:shadow-lg"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                  <div className="relative h-32">
                    <img src={uimg(item.img, 320, 256)} alt={item.name} className="w-full h-full object-cover" />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: C.discount, color: "white", fontFamily: IN }}>
                        {discount}% OFF
                      </span>
                    )}
                    {item.rx && (
                      <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: C.orange, color: "white", fontFamily: IN }}>Rx</span>
                    )}
                  </div>
                  <div className="p-3">
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.82rem", lineHeight: 1.3 }} className="mb-0.5">{item.name}</p>
                    <p style={{ color: C.muted, fontSize: "0.67rem", fontFamily: IN }}>{item.unit}</p>
                    <div className="flex items-center gap-1 mt-1 mb-2">
                      <Star className="w-2.5 h-2.5" style={{ fill: C.star, color: C.star }} />
                      <span style={{ color: C.body, fontSize: "0.65rem", fontFamily: IN }}>{item.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: C.price, fontFamily: SG, fontWeight: 800, fontSize: "0.95rem" }}>₹{item.price}</p>
                        {discount > 0 && <p style={{ color: C.muted, fontSize: "0.65rem", fontFamily: IN, textDecoration: "line-through" }}>₹{item.mrp}</p>}
                      </div>
                      {q === 0 ? (
                        <button onClick={() => addToCart(item)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all"
                          style={{ background: C.gradPrimary, color: "white", fontFamily: IN, boxShadow: C.shadowBtn }}>
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl"
                          style={{ background: C.gradPrimary }}>
                          <button onClick={() => removeFromCart(item.id)} className="w-5 h-5 flex items-center justify-center">
                            <Minus className="w-3 h-3 text-white" />
                          </button>
                          <span style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "0.85rem", minWidth: "16px", textAlign: "center" }}>{q}</span>
                          <button onClick={() => addToCart(item)} className="w-5 h-5 flex items-center justify-center">
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating cart */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button onClick={() => setPage("cart")}
            className="flex items-center gap-4 px-6 py-3.5 rounded-2xl shadow-2xl transition-all hover:scale-105"
            style={{ background: C.gradPrimary, boxShadow: C.shadowBtn }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <span style={{ color: "white", fontFamily: IN, fontWeight: 700 }}>
              {cartCount} item{cartCount > 1 ? "s" : ""} in cart
            </span>
            <span style={{ color: "white", fontFamily: SG, fontWeight: 900, fontSize: "1.05rem" }}>₹{cartTotal}</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
function CartPage({ cart, setCart, setPage }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; setPage: (p: string) => void }) {
  const C = useC();
  const [coupon, setCoupon]   = useState("");
  const [applied, setApplied] = useState(false);
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = applied ? Math.floor(subtotal * 0.1) : 0;
  const total    = subtotal - discount;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.4rem", marginBottom: "20px" }}>Your Cart</h2>

      {cart.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: C.section }}>
            <ShoppingCart className="w-9 h-9" style={{ color: C.muted }} />
          </div>
          <p style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.2rem" }}>Cart is empty</p>
          <p style={{ color: C.muted, fontFamily: IN, marginTop: "6px" }}>Add items to get started</p>
          <button onClick={() => setPage("home")} className="mt-5 px-6 py-3 rounded-2xl font-bold"
            style={{ background: C.gradPrimary, color: "white", fontFamily: SG, boxShadow: C.shadowBtn }}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              {cart.map((item, idx) => (
                <div key={item.id}
                  className={`flex items-center gap-4 px-5 py-4 ${idx > 0 ? "border-t" : ""}`}
                  style={{ borderColor: C.border }}>
                  <div className="flex-1">
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600 }}>{item.name}</p>
                    <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: IN, marginTop: "2px" }}>
                      {item.unit} · ₹{item.price} each
                    </p>
                    {item.rx && <p style={{ color: C.orange, fontSize: "0.7rem", fontFamily: IN, marginTop: "2px" }}>⚕ Prescription required</p>}
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded-xl"
                    style={{ background: "#7C3AED12", border: "1px solid #7C3AED30" }}>
                    <button onClick={() => setCart((p) => p.map((c) => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c).filter((c) => c.quantity > 0))}
                      className="w-6 h-6 flex items-center justify-center">
                      <Minus className="w-3.5 h-3.5" style={{ color: C.primary }} />
                    </button>
                    <span style={{ color: C.primary, fontFamily: SG, fontWeight: 800, minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => setCart((p) => p.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))}
                      className="w-6 h-6 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" style={{ color: C.primary }} />
                    </button>
                  </div>
                  <p style={{ color: C.heading, fontFamily: SG, fontWeight: 700, minWidth: "60px", textAlign: "right" }}>₹{item.price * item.quantity}</p>
                  <button onClick={() => setCart((p) => p.filter((c) => c.id !== item.id))}>
                    <X className="w-4 h-4" style={{ color: C.muted }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="rounded-2xl p-4"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4" style={{ color: C.primary }} />
                <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>Apply Coupon</p>
              </div>
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Try WELCOME10"
                  className="flex-1 px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: JB, fontSize: "0.875rem" }} />
                <button onClick={() => coupon === "WELCOME10" && setApplied(true)}
                  className="px-4 py-2.5 rounded-xl font-bold"
                  style={{ background: applied ? "#22C55E18" : C.gradPrimary, color: applied ? C.success : "white", fontFamily: IN, boxShadow: applied ? "none" : C.shadowBtn }}>
                  {applied ? "Applied ✓" : "Apply"}
                </button>
              </div>
              {applied && <p style={{ color: C.success, fontSize: "0.75rem", fontFamily: IN, marginTop: "6px" }}>🎉 10% discount applied!</p>}
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, marginBottom: "14px" }}>Order Summary</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: C.secondary, fontFamily: IN }}>Subtotal</span>
                  <span style={{ color: C.heading, fontFamily: IN, fontWeight: 600 }}>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: C.success, fontFamily: IN }}>Discount</span>
                    <span style={{ color: C.success, fontFamily: IN, fontWeight: 600 }}>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: C.secondary, fontFamily: IN }}>Delivery</span>
                  <span style={{ color: C.success, fontFamily: IN, fontWeight: 600 }}>FREE</span>
                </div>
                <div className="border-t pt-3 flex justify-between" style={{ borderColor: C.border }}>
                  <span style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.05rem" }}>Total</span>
                  <span style={{ color: C.price, fontFamily: SG, fontWeight: 900, fontSize: "1.3rem" }}>₹{total}</span>
                </div>
              </div>
              <button onClick={() => setPage("checkout")}
                className="w-full py-3.5 rounded-2xl font-bold mt-4"
                style={{ background: C.gradPrimary, color: "white", fontFamily: SG, fontSize: "1rem", boxShadow: C.shadowBtn }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
function CheckoutPage({ cart, setPage, setCart }: { cart: CartItem[]; setPage: (p: string) => void; setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const C = useC();
  const [step, setStep] = useState<"address" | "payment" | "success">("address");
  const total   = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const needsRx = cart.some((c) => c.rx);

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 pt-16 text-center pb-24">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "linear-gradient(135deg,#22C55E,#16A34A)", boxShadow: "0 8px 32px rgba(34,197,94,0.3)" }}>
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 900, fontSize: "1.6rem" }}>Order Placed!</h2>
        <p style={{ color: C.secondary, fontFamily: IN, marginTop: "8px", lineHeight: 1.6 }}>
          <strong style={{ color: C.heading }}>ORD-2026-4892</strong> confirmed.
          {needsRx && " Prescription verified within 30 min. "}
          Driver assigned shortly.
        </p>
        <div className="mt-5 p-4 rounded-2xl" style={{ background: C.section, border: `1px solid ${C.border}` }}>
          <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: IN }}>Estimated delivery</p>
          <p style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.15rem" }}>30–45 minutes</p>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={() => { setCart([]); setPage("orders"); }}
            className="flex-1 py-3.5 rounded-2xl font-bold"
            style={{ background: C.gradPrimary, color: "white", fontFamily: SG, boxShadow: C.shadowBtn }}>
            Track My Order
          </button>
          <button onClick={() => { setCart([]); setPage("home"); }}
            className="flex-1 py-3.5 rounded-2xl font-semibold"
            style={{ background: C.section, color: C.secondary, fontFamily: IN }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 pb-24 lg:pb-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setPage("cart")}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: C.section, border: `1px solid ${C.border}` }}>
          <ChevronLeft className="w-5 h-5" style={{ color: C.body }} />
        </button>
        <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.3rem" }}>Checkout</h2>
        <div className="flex items-center gap-2 ml-4">
          {["Address", "Payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: (step === "address" && i === 0) || step === "payment" ? C.primary : C.section, color: (step === "address" && i === 0) || step === "payment" ? "white" : C.muted, fontFamily: SG }}>
                {i + 1}
              </div>
              <span style={{ color: C.body, fontFamily: IN, fontSize: "0.85rem" }}>{s}</span>
              {i === 0 && <div className="w-8 h-px mx-1" style={{ background: C.border }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {step === "address" && (
            <div className="rounded-2xl p-6 space-y-4"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <h3 style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>Delivery Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: "street", label: "Street Address", full: true,  value: "123 MG Road, Indiranagar" },
                  { field: "city",   label: "City",           full: false, value: "Bengaluru"                },
                  { field: "pin",    label: "Pincode",        full: false, value: "560038"                   },
                ].map((f) => (
                  <div key={f.field} className={f.full ? "sm:col-span-2" : ""}>
                    <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>{f.label}</label>
                    <input defaultValue={f.value}
                      className="w-full mt-1.5 px-3 py-2.5 rounded-xl outline-none transition-all"
                      style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
                  </div>
                ))}
              </div>
              {needsRx && (
                <div className="p-3 rounded-xl flex items-center gap-3"
                  style={{ background: "#F59E0B10", border: "1px solid #F59E0B30" }}>
                  <Upload className="w-4 h-4 flex-shrink-0" style={{ color: C.orange }} />
                  <p style={{ color: C.body, fontSize: "0.8rem", fontFamily: IN, flex: 1 }}>Upload prescription for Rx items</p>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: C.orange, color: "white", fontFamily: IN }}>Upload</button>
                </div>
              )}
              <button onClick={() => setStep("payment")}
                className="w-full py-3.5 rounded-2xl font-bold"
                style={{ background: C.gradPrimary, color: "white", fontFamily: SG, boxShadow: C.shadowBtn }}>
                Continue to Payment
              </button>
            </div>
          )}
          {step === "payment" && (
            <div className="rounded-2xl p-6 space-y-4"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <h3 style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>Payment Method</h3>
              {[
                { id: "upi",    label: "UPI / PhonePe / GPay", sub: "Instant payment",         icon: Zap,        checked: true  },
                { id: "card",   label: "Credit / Debit Card",  sub: "Visa, Mastercard, RuPay", icon: CreditCard, checked: false },
                { id: "wallet", label: "NestiGo Wallet",       sub: "Balance: ₹4,835",          icon: Wallet,     checked: false },
              ].map((pm) => (
                <label key={pm.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                  style={{ background: pm.checked ? "#7C3AED08" : C.bgLight, border: `1px solid ${pm.checked ? C.primary + "40" : C.border}` }}>
                  <input type="radio" name="pm" defaultChecked={pm.checked} style={{ accentColor: C.primary }} />
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#7C3AED12" }}>
                    <pm.icon className="w-4 h-4" style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }}>{pm.label}</p>
                    <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>{pm.sub}</p>
                  </div>
                </label>
              ))}
              <button onClick={() => setStep("success")}
                className="w-full py-3.5 rounded-2xl font-bold mt-2"
                style={{ background: C.gradPrimary, color: "white", fontFamily: SG, boxShadow: C.shadowBtn }}>
                Pay ₹{total} Now
              </button>
            </div>
          )}
        </div>
        {/* Summary */}
        <div className="rounded-2xl p-5 h-fit"
          style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
          <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, marginBottom: "12px" }}>Order Summary</p>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b" style={{ borderColor: C.border }}>
              <span style={{ color: C.body, fontFamily: IN, fontSize: "0.8rem" }} className="truncate flex-1 mr-2">{item.name} ×{item.quantity}</span>
              <span style={{ color: C.heading, fontFamily: SG, fontWeight: 600, fontSize: "0.8rem", flexShrink: 0 }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-1">
            <span style={{ color: C.heading, fontFamily: SG, fontWeight: 700 }}>Total</span>
            <span style={{ color: C.price, fontFamily: SG, fontWeight: 900, fontSize: "1.2rem" }}>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders Page ──────────────────────────────────────────────────────────────
function OrdersPage({ setPage, setActiveOrderId }: { setPage: (p: string) => void; setActiveOrderId: (id: string) => void }) {
  const C = useC();
  const [tab, setTab] = useState<"active" | "past">("active");
  const active = mockOrders.filter((o) => ["picked_up", "confirmed", "pending_payment"].includes(o.status));
  const past   = mockOrders.filter((o) => ["completed", "cancelled", "refunded"].includes(o.status));
  const shown  = tab === "active" ? active : past;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.4rem" }}>My Orders</h2>
        <div className="flex gap-2">
          {(["active", "past"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl font-semibold text-sm capitalize"
              style={{ background: tab === t ? C.primary : C.section, color: tab === t ? "white" : C.secondary, fontFamily: IN, boxShadow: tab === t ? C.shadowBtn : "none" }}>
              {t} ({t === "active" ? active.length : past.length})
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {shown.map((order) => {
          const meta = VERTICAL_META[order.vertical];
          const isActive = ["picked_up", "confirmed"].includes(order.status);
          return (
            <div key={order.id} className="rounded-2xl p-5 transition-all hover:shadow-md"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.bg }}>
                  <VertIcon meta={meta} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p style={{ color: C.muted, fontSize: "0.7rem", fontFamily: JB }}>{order.id}</p>
                      <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, marginTop: "2px" }}>{order.items}</p>
                      <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: IN, marginTop: "3px" }}>
                        {order.provider} · {order.date}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p style={{ color: C.price, fontFamily: SG, fontWeight: 900, fontSize: "1.1rem" }}>₹{order.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <StatusPill status={order.status} />
                    {isActive && (
                      <>
                        <button onClick={() => { setActiveOrderId(order.id); setPage("tracking"); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: "#7C3AED12", color: C.primary, fontFamily: IN }}>
                          <Navigation className="w-3 h-3" /> Track
                        </button>
                        <button onClick={() => { setActiveOrderId(order.id); setPage("chat"); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: "#D946EF12", color: C.pink, fontFamily: IN }}>
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                      </>
                    )}
                    {order.status === "completed" && (
                      <>
                        <button onClick={() => setPage("review")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: "#F59E0B12", color: C.orange, fontFamily: IN }}>
                          <Star className="w-3 h-3" /> Review
                        </button>
                        <button onClick={() => setPage("dispute")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: "#EF444412", color: C.danger, fontFamily: IN }}>
                          <Flag className="w-3 h-3" /> Dispute
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tracking Page ────────────────────────────────────────────────────────────
function TrackingPage({ orderId, setPage }: { orderId: string; setPage: (p: string) => void }) {
  const C = useC();
  const order       = mockOrders.find((o) => o.id === orderId) ?? mockOrders[1];
  const steps       = ["Order Placed", "Payment Verified", "Driver Assigned", "Picked Up", "Delivered"];
  const currentStep = order.status === "picked_up" ? 3 : order.status === "confirmed" ? 2 : 1;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setPage("orders")}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: C.section, border: `1px solid ${C.border}` }}>
          <ChevronLeft className="w-5 h-5" style={{ color: C.body }} />
        </button>
        <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.3rem" }}>Live Tracking</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map simulation */}
        <div className="rounded-2xl overflow-hidden relative" style={{ height: "360px", background: C.dark }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(circle at top left,#3B2C85 0%,transparent 35%),radial-gradient(circle at bottom center,#4C1D95 0%,transparent 40%),radial-gradient(circle at right,#0F766E 0%,transparent 30%)" }} />
          <div className="absolute inset-0 opacity-15"
            style={{ backgroundImage: `linear-gradient(${C.primary}33 1px,transparent 1px),linear-gradient(90deg,${C.primary}33 1px,transparent 1px)`, backgroundSize: "32px 32px" }} />
          <svg className="absolute inset-0 w-full h-full">
            <path d="M 80 280 Q 200 200 320 140 Q 420 90 520 70" stroke={C.primary} strokeWidth="3" strokeDasharray="8,4" fill="none" opacity="0.8" />
          </svg>
          {/* Driver */}
          <div className="absolute animate-pulse" style={{ top: "120px", left: "280px" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: C.gradPrimary, boxShadow: `0 0 0 12px rgba(124,58,237,0.2),0 0 30px rgba(124,58,237,0.5)` }}>
              <Truck className="w-6 h-6 text-white" />
            </div>
          </div>
          {/* Destination */}
          <div className="absolute" style={{ top: "56px", left: "460px" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: C.danger, boxShadow: "0 0 16px rgba(239,68,68,0.4)" }}>
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </div>
          {/* ETA chip */}
          <div className="absolute top-4 right-4 px-4 py-2 rounded-full flex items-center gap-2"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", boxShadow: C.shadowSm }}>
            <Clock className="w-3.5 h-3.5" style={{ color: C.primary }} />
            <span style={{ color: C.heading, fontFamily: SG, fontWeight: 700 }}>8 min away</span>
          </div>
          {/* Driver card */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(20,27,45,0.96)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}33` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: C.gradPrimary, fontFamily: SG }}>RK</div>
            <div className="flex-1">
              <p style={{ color: "white", fontFamily: IN, fontWeight: 700 }}>Ramesh Kumar</p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.72rem", fontFamily: IN }}>⭐ 4.8 · KA 05 MX 1234</p>
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#7C3AED20" }}>
              <Phone className="w-4 h-4" style={{ color: C.primary }} />
            </button>
            <button onClick={() => setPage("chat")} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#D946EF20" }}>
              <MessageSquare className="w-4 h-4" style={{ color: C.pink }} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl p-6"
          style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
          <p style={{ color: C.heading, fontFamily: SG, fontWeight: 700, fontSize: "1.05rem", marginBottom: "20px" }}>Delivery Progress</p>
          <div className="space-y-5">
            {steps.map((step, i) => {
              const done     = i < currentStep;
              const isActive = i === currentStep;
              return (
                <div key={step} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? "linear-gradient(135deg,#22C55E,#16A34A)" : isActive ? C.gradPrimary : C.section, boxShadow: isActive ? C.shadowBtn : "none" }}>
                      {done ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                        isActive ? <div className="w-3 h-3 rounded-full bg-white animate-pulse" /> :
                          <div className="w-3 h-3 rounded-full" style={{ background: C.border }} />}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 mt-1" style={{ height: "28px", background: done ? "#22C55E50" : C.border }} />
                    )}
                  </div>
                  <div className="pt-1">
                    <p style={{ color: done ? C.success : isActive ? C.heading : C.muted, fontFamily: IN, fontWeight: done || isActive ? 700 : 400 }}>
                      {step}
                    </p>
                    {isActive && <p style={{ color: C.primary, fontSize: "0.72rem", fontFamily: JB, marginTop: "2px" }}>● IN PROGRESS</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Chat Page ────────────────────────────────────────────────────────────────
function ChatPage({ setPage }: { setPage: (p: string) => void }) {
  const C = useC();
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput]       = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "customer", name: "You", text: input, time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-24 lg:pb-10">
      <div className="rounded-2xl overflow-hidden flex flex-col"
        style={{ height: "600px", background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowMd }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: C.border }}>
          <button onClick={() => setPage("orders")}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: C.section }}>
            <ChevronLeft className="w-4 h-4" style={{ color: C.body }} />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: C.gradPrimary, fontFamily: SG, boxShadow: C.shadowBtn }}>RK</div>
          <div className="flex-1">
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>Ramesh Kumar</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>Delivery Partner · Online</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#7C3AED12" }}>
            <Phone className="w-4 h-4" style={{ color: C.primary }} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[75%]">
                <div className="px-4 py-2.5"
                  style={{
                    background: msg.sender === "customer" ? C.gradPrimary : C.section,
                    color: msg.sender === "customer" ? "white" : C.heading,
                    fontFamily: IN, fontSize: "0.875rem", lineHeight: 1.5,
                    borderRadius: msg.sender === "customer" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    border: msg.sender === "driver" ? `1px solid ${C.border}` : "none",
                  }}>
                  {msg.text}
                </div>
                <p style={{ color: C.muted, fontSize: "0.62rem", fontFamily: IN, textAlign: msg.sender === "customer" ? "right" : "left", marginTop: "3px" }}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 py-3 border-t flex-shrink-0" style={{ borderColor: C.border }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 rounded-xl outline-none"
            style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
          <button onClick={send} className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: C.gradPrimary, boxShadow: C.shadowBtn }}>
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ onLogout, darkMode, setDarkMode }: { onLogout: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const C = useC();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // ── Shared sub-page header ──
  const SubHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={() => setActiveSection(null)}
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: C.section, border: `1px solid ${C.border}` }}>
        <ChevronLeft className="w-5 h-5" style={{ color: C.body }} />
      </button>
      <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.3rem" }}>{title}</h2>
    </div>
  );

  // ── 1. Saved Addresses ──
  const SavedAddresses = () => {
    const [addresses, setAddresses] = useState([
      { id: 1, label: "Home",    icon: "home",    address: "123 MG Road, Indiranagar, Bengaluru 560038",         isDefault: true  },
      { id: 2, label: "Work",    icon: "briefcase",address: "45 Koramangala 5th Block, Bengaluru 560095",       isDefault: false },
      { id: 3, label: "Parents", icon: "users",   address: "7 JP Nagar 3rd Phase, Bengaluru 560078",             isDefault: false },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [formLabel, setFormLabel]   = useState("");
    const [formStreet, setFormStreet] = useState("");
    const [formCity, setFormCity]     = useState("");
    const [formPin, setFormPin]       = useState("");
    const [detecting, setDetecting]   = useState(false);

    const detectLocation = () => {
      setDetecting(true);
      setTimeout(() => {
        setFormStreet("Indiranagar");
        setFormCity("Bengaluru");
        setFormPin("560038");
        setDetecting(false);
      }, 1500);
    };

    const addAddress = () => {
      if (!formLabel || !formStreet) return;
      setAddresses((prev) => [...prev, { id: Date.now(), label: formLabel, icon: "home", address: `${formStreet}, ${formCity} ${formPin}`, isDefault: false }]);
      setFormLabel(""); setFormStreet(""); setFormCity(""); setFormPin("");
      setShowForm(false);
    };

    const AddrIcon = ({ type }: { type: string }) => {
      if (type === "briefcase") return <Briefcase className="w-5 h-5" style={{ color: C.primary }} />;
      if (type === "users") return <Users className="w-5 h-5" style={{ color: C.primary }} />;
      return <Home className="w-5 h-5" style={{ color: C.primary }} />;
    };

    return (
      <div>
        <SubHeader title="Saved Addresses" />
        <div className="space-y-3 mb-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="rounded-2xl p-4"
              style={{ background: C.bg, border: `1px solid ${addr.isDefault ? C.primary + "50" : C.border}`, boxShadow: C.shadowSm }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#7C3AED12" }}>
                  <AddrIcon type={addr.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>{addr.label}</p>
                    {addr.isDefault && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: "#7C3AED15", color: C.primary, fontFamily: IN }}>Default</span>
                    )}
                  </div>
                  <p style={{ color: C.body, fontFamily: IN, fontSize: "0.82rem" }}>{addr.address}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!addr.isDefault && (
                    <button onClick={() => setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addr.id })))}
                      className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                      style={{ background: C.section, color: C.body, fontFamily: IN }}>
                      Set Default
                    </button>
                  )}
                  <button onClick={() => setAddresses((prev) => prev.filter((a) => a.id !== addr.id))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#EF444412" }}>
                    <Trash2 className="w-4 h-4" style={{ color: C.danger }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showForm ? (
          <button onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold border-2 border-dashed transition-all"
            style={{ borderColor: C.primary + "50", color: C.primary, fontFamily: IN, background: "#7C3AED06" }}>
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        ) : (
          <div className="rounded-2xl p-5 space-y-4"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>New Address</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>Label</label>
                <input value={formLabel} onChange={(e) => setFormLabel(e.target.value)} placeholder="e.g. Office"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
              </div>
              <div className="col-span-2">
                <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>Street</label>
                <input value={formStreet} onChange={(e) => setFormStreet(e.target.value)} placeholder="Street address"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>City</label>
                <input value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="City"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>Pincode</label>
                <input value={formPin} onChange={(e) => setFormPin(e.target.value)} placeholder="Pincode"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
              </div>
            </div>
            <button onClick={detectLocation} disabled={detecting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm w-full justify-center"
              style={{ background: "#7C3AED12", color: C.primary, fontFamily: IN, border: `1px solid ${C.primary}30` }}>
              {detecting ? (
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation2 className="w-4 h-4" />
              )}
              {detecting ? "Detecting…" : "Detect My Location"}
            </button>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold"
                style={{ background: C.section, color: C.body, fontFamily: IN }}>Cancel</button>
              <button onClick={addAddress}
                className="flex-1 py-2.5 rounded-xl font-bold"
                style={{ background: C.gradPrimary, color: "white", fontFamily: IN, boxShadow: C.shadowBtn }}>Save Address</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── 2. Favourites ──
  const Favourites = () => {
    const initial = [
      { id: 1, name: "Parker Vector Pen",       category: "Stationery",     price: 199, img: "photo-1471107340929-a87cd0f5b5f3", catColor: "#6366F1" },
      { id: 2, name: "Chocolate Truffle Cake",  category: "Bakery",         price: 599, img: "photo-1488477181946-6428a0291777", catColor: C.offer   },
      { id: 3, name: "AC Cleaning 1.5 Ton",     category: "Home Services",  price: 799, img: "photo-1581578731548-c64695cc6952", catColor: C.primary },
      { id: 4, name: "Classmate Notebook A4",   category: "Stationery",     price: 55,  img: "photo-1583485088034-697b5bc54ccd", catColor: "#6366F1" },
      { id: 5, name: "Mango Mousse Cake",       category: "Bakery",         price: 699, img: "photo-1567620905732-2d1ec7ab7445", catColor: C.offer   },
      { id: 6, name: "Bathroom Deep Clean",     category: "Home Services",  price: 899, img: "photo-1581578731548-c64695cc6952", catColor: C.primary },
    ];
    const [items, setItems] = useState(initial);
    const [toast, setToast] = useState("");

    const remove = (id: number, name: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setToast(`Removed "${name}" from favourites`);
      setTimeout(() => setToast(""), 3000);
    };

    return (
      <div>
        <SubHeader title="Favourites" />
        {toast && (
          <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
            style={{ background: "#EF444412", border: "1px solid #EF444430", color: C.danger, fontFamily: IN, fontSize: "0.875rem" }}>
            <X className="w-4 h-4 flex-shrink-0" /> {toast}
          </div>
        )}
        {items.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: C.border }} />
            <p style={{ color: C.heading, fontFamily: SG, fontWeight: 700 }}>No favourites yet</p>
            <p style={{ color: C.muted, fontFamily: IN, fontSize: "0.875rem", marginTop: "6px" }}>Heart items while browsing to save them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl overflow-hidden"
                style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                <div className="relative h-36">
                  <img src={uimg(item.img, 400, 288)} alt={item.name} className="w-full h-full object-cover" />
                  <button onClick={() => remove(item.id, item.name)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.92)" }}>
                    <Heart className="w-4 h-4" style={{ color: C.offer, fill: C.offer }} />
                  </button>
                  <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: item.catColor + "22", color: item.catColor, fontFamily: IN, border: `1px solid ${item.catColor}44` }}>
                    {item.category}
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }}>{item.name}</p>
                    <p style={{ color: C.price, fontFamily: SG, fontWeight: 800, fontSize: "1rem", marginTop: "2px" }}>₹{item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── 3. My Reviews ──
  const MyReviews = () => {
    const initial = [
      { id: 1, provider: "Sparkle Home Services", vertical: "Home Services", stars: 5, text: "AC was spotless after cleaning, very professional team.", date: "Jul 28" },
      { id: 2, provider: "Baker's Delight",        vertical: "Bakery",       stars: 4, text: "Cake was fresh and delicious, delivery was slightly late.",  date: "Jul 25" },
      { id: 3, provider: "SafeShift Movers",       vertical: "Shifting",     stars: 5, text: "Handled all items with care, no damage at all.",             date: "Jul 20" },
    ];
    const [reviews, setReviews] = useState(initial);
    const [editing, setEditing] = useState<number | null>(null);
    const [editText, setEditText] = useState("");

    const startEdit = (id: number, text: string) => { setEditing(id); setEditText(text); };
    const saveEdit  = (id: number) => { setReviews((prev) => prev.map((r) => r.id === id ? { ...r, text: editText } : r)); setEditing(null); };

    const catColors: Record<string, string> = { "Home Services": C.primary, "Bakery": C.offer, "Shifting": C.blue };

    return (
      <div>
        <SubHeader title="My Reviews" />
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl p-5"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>{review.provider}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold mt-1 inline-block"
                    style={{ background: (catColors[review.vertical] ?? C.muted) + "18", color: catColors[review.vertical] ?? C.muted, fontFamily: IN }}>
                    {review.vertical}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>{review.date}</p>
                  <button onClick={() => startEdit(review.id, review.text)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "#F59E0B12" }}>
                    <Edit2 className="w-3.5 h-3.5" style={{ color: C.orange }} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-4 h-4"
                    style={{ color: C.star, fill: s <= review.stars ? C.star : "transparent", strokeWidth: 1.5 }} />
                ))}
              </div>
              {editing === review.id ? (
                <div className="space-y-2">
                  <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3}
                    className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                    style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(null)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold"
                      style={{ background: C.section, color: C.body, fontFamily: IN }}>Cancel</button>
                    <button onClick={() => saveEdit(review.id)}
                      className="flex-1 py-2 rounded-xl text-sm font-bold"
                      style={{ background: C.gradPrimary, color: "white", fontFamily: IN, boxShadow: C.shadowBtn }}>Save</button>
                  </div>
                </div>
              ) : (
                <p style={{ color: C.body, fontFamily: IN, fontSize: "0.875rem", lineHeight: 1.6 }}>{review.text}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── 4. Refer & Earn ──
  const ReferEarn = () => {
    const code = "PRIYA-NES-2026";
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
      navigator.clipboard.writeText(code).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div>
        <SubHeader title="Refer & Earn" />
        {/* Code card */}
        <div className="rounded-2xl p-6 mb-5 relative overflow-hidden"
          style={{ background: C.gradHero }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: `linear-gradient(${C.primary}40 1px,transparent 1px),linear-gradient(90deg,${C.primary}40 1px,transparent 1px)`, backgroundSize: "24px 24px" }} />
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: C.grad }} />
          <div className="relative z-10 text-center">
            <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: IN, fontSize: "0.8rem", marginBottom: "8px" }}>Your Referral Code</p>
            <p style={{ color: "white", fontFamily: JB, fontWeight: 700, fontSize: "1.6rem", letterSpacing: "0.08em" }}>{code}</p>
            <button onClick={copyCode}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold mx-auto"
              style={{ background: copied ? "#22C55E" : "rgba(255,255,255,0.15)", color: "white", fontFamily: IN, border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { v: "3",    l: "Friends Referred", color: C.primary },
            { v: "₹300", l: "Total Earned",     color: C.success },
            { v: "₹100", l: "Pending",          color: C.orange  },
          ].map((s) => (
            <div key={s.l} className="text-center p-4 rounded-2xl"
              style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
              <p style={{ color: s.color, fontFamily: SG, fontWeight: 900, fontSize: "1.3rem" }}>{s.v}</p>
              <p style={{ color: C.muted, fontSize: "0.7rem", fontFamily: IN, marginTop: "2px" }}>{s.l}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
          <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, marginBottom: "16px" }}>How it works</p>
          <div className="space-y-4">
            {[
              { icon: Send,         label: "Share your code", sub: "Send your unique code to friends", color: C.primary },
              { icon: ShoppingCart, label: "Friend orders",   sub: "They place their first order",     color: C.pink    },
              { icon: Gift,         label: "You both get ₹100",sub: "Credited to your wallets",        color: C.success },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: step.color + "15" }}>
                    <Icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                  <div>
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }}>{step.label}</p>
                    <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold"
            style={{ background: "#25D366", color: "white", fontFamily: IN, boxShadow: "0 8px 24px rgba(37,211,102,0.3)" }}>
            <Phone className="w-4 h-4" /> WhatsApp
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold"
            style={{ background: C.section, color: C.body, fontFamily: IN, border: `1px solid ${C.border}` }}>
            <Send className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    );
  };

  // ── 5. Order History ──
  const OrderHistory = () => {
    const [tab, setTab] = useState<"all" | "completed" | "pending">("all");
    const filtered = mockOrders.filter((o) => {
      if (tab === "completed") return o.status === "completed";
      if (tab === "pending")   return ["pending_payment", "confirmed", "picked_up"].includes(o.status);
      return true;
    });

    return (
      <div>
        <SubHeader title="Order History" />
        <div className="flex gap-2 mb-5">
          {(["all", "completed", "pending"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-xl font-semibold text-sm capitalize"
              style={{ background: tab === t ? C.primary : C.section, color: tab === t ? "white" : C.secondary, fontFamily: IN }}>
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filtered.map((order) => {
            const meta = VERTICAL_META[order.vertical];
            return (
              <div key={order.id} className="rounded-2xl p-4"
                style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg }}>
                    <VertIcon meta={meta} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p style={{ color: C.muted, fontSize: "0.68rem", fontFamily: JB }}>{order.id}</p>
                        <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem", marginTop: "2px" }}>{order.items}</p>
                        <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN, marginTop: "2px" }}>{order.provider} · {order.date}</p>
                      </div>
                      <p style={{ color: C.price, fontFamily: SG, fontWeight: 900, fontSize: "1rem", flexShrink: 0 }}>₹{order.total}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusPill status={order.status} />
                      {order.status === "completed" && (
                        <>
                          <span className="text-xs px-2.5 py-1 rounded-xl font-semibold"
                            style={{ background: "#F59E0B12", color: C.orange, fontFamily: IN }}>
                            ★ Write Review
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded-xl font-semibold"
                            style={{ background: "#EF444412", color: C.danger, fontFamily: IN }}>
                            ⚑ Dispute
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── 6. Settings ──
  const SettingsPage = () => {
    const C = useC();
    const [toggles, setToggles] = useState({
      pushNotifications: true,
      emailUpdates: true,
      smsAlerts: false,
      locationAccess: true,
    });
    const [name, setName]   = useState("Priya Sharma");
    const [phone, setPhone] = useState("+91 98765 43210");
    const [email, setEmail] = useState("priya.sharma@nestigo.com");
    const [profileSaved, setProfileSaved] = useState(false);

    const [curPwd, setCurPwd]     = useState("");
    const [newPwd, setNewPwd]     = useState("");
    const [confPwd, setConfPwd]   = useState("");
    const [pwdSaved, setPwdSaved] = useState(false);

    const toggle = (key: keyof typeof toggles) => setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

    const ToggleRow = ({ label, sub, tkey }: { label: string; sub: string; tkey: keyof typeof toggles }) => (
      <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: C.border }}>
        <div>
          <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }}>{label}</p>
          <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>{sub}</p>
        </div>
        <button onClick={() => toggle(tkey)}
          className="flex items-center flex-shrink-0">
          {toggles[tkey]
            ? <ToggleRight className="w-8 h-8" style={{ color: C.primary }} />
            : <ToggleLeft  className="w-8 h-8" style={{ color: C.muted  }} />}
        </button>
      </div>
    );

    return (
      <div>
        <SubHeader title="Settings" />
        <div className="space-y-5">
          {/* Notifications */}
          <div className="rounded-2xl p-5"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, marginBottom: "4px" }}>Notifications</p>
            <ToggleRow label="Push Notifications" sub="Order updates and offers"       tkey="pushNotifications" />
            <ToggleRow label="Email Updates"       sub="Newsletters and promotions"    tkey="emailUpdates"      />
            <ToggleRow label="SMS Alerts"          sub="OTPs and delivery alerts"      tkey="smsAlerts"         />
            <ToggleRow label="Location Access"     sub="For faster delivery estimates" tkey="locationAccess"    />
            <div className="flex items-center justify-between py-3" style={{}}>
              <div>
                <p style={{ color: C.heading, fontFamily: IN, fontWeight: 600, fontSize: "0.875rem" }}>Dark Mode</p>
                <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>Switch to dark theme</p>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className="flex items-center flex-shrink-0">
                {darkMode
                  ? <ToggleRight className="w-8 h-8" style={{ color: C.primary }} />
                  : <ToggleLeft  className="w-8 h-8" style={{ color: C.muted  }} />}
              </button>
            </div>
          </div>

          {/* Edit Profile */}
          <div className="rounded-2xl p-5"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, marginBottom: "14px" }}>Edit Profile</p>
            <div className="space-y-3">
              {[
                { label: "Name",  value: name,  set: setName  },
                { label: "Phone", value: phone, set: setPhone },
                { label: "Email", value: email, set: setEmail },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.set(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
                </div>
              ))}
            </div>
            {profileSaved && (
              <p style={{ color: C.success, fontFamily: IN, fontSize: "0.8rem", marginTop: "8px" }}>Profile saved successfully!</p>
            )}
            <button onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); }}
              className="mt-4 w-full py-3 rounded-xl font-bold"
              style={{ background: C.gradPrimary, color: "white", fontFamily: IN, boxShadow: C.shadowBtn }}>
              Save Changes
            </button>
          </div>

          {/* Change Password */}
          <div className="rounded-2xl p-5"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700, marginBottom: "14px" }}>Change Password</p>
            <div className="space-y-3">
              {[
                { label: "Current Password", value: curPwd, set: setCurPwd  },
                { label: "New Password",      value: newPwd, set: setNewPwd  },
                { label: "Confirm Password",  value: confPwd, set: setConfPwd },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ color: C.body, fontSize: "0.78rem", fontFamily: IN, fontWeight: 600 }}>{f.label}</label>
                  <input type="password" value={f.value} onChange={(e) => f.set(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
                </div>
              ))}
            </div>
            {pwdSaved && (
              <p style={{ color: C.success, fontFamily: IN, fontSize: "0.8rem", marginTop: "8px" }}>Password updated!</p>
            )}
            <button onClick={() => { setPwdSaved(true); setCurPwd(""); setNewPwd(""); setConfPwd(""); setTimeout(() => setPwdSaved(false), 3000); }}
              className="mt-4 w-full py-3 rounded-xl font-bold"
              style={{ background: C.section, color: C.body, fontFamily: IN, border: `1px solid ${C.border}` }}>
              Update Password
            </button>
          </div>

          {/* Danger zone */}
          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold"
            style={{ background: "#EF444412", border: "1px solid #EF444430", color: C.danger, fontFamily: IN }}>
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    );
  };

  // ── Sub-page renderer ──
  if (activeSection) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
        {activeSection === "addresses"     && <SavedAddresses />}
        {activeSection === "favourites"    && <Favourites />}
        {activeSection === "reviews"       && <MyReviews />}
        {activeSection === "refer"         && <ReferEarn />}
        {activeSection === "orderhistory"  && <OrderHistory />}
        {activeSection === "settings"      && <SettingsPage />}
      </div>
    );
  }

  // ── Main profile view ──
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
      <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.4rem", marginBottom: "20px" }}>My Account</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="space-y-4">
          {/* Member card */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: C.gradHero }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `linear-gradient(${C.primary}40 1px,transparent 1px),linear-gradient(90deg,${C.primary}40 1px,transparent 1px)`, backgroundSize: "24px 24px" }} />
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: C.grad }} />
            <div className="relative z-10 flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
                style={{ background: C.gradPrimary, fontFamily: SG, boxShadow: C.shadowBtn }}>PS</div>
              <div>
                <p style={{ fontFamily: JB, fontWeight: 600, fontSize: "0.62rem", letterSpacing: "0.08em", background: C.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  NESTIGO GOLD MEMBER
                </p>
                <h3 style={{ color: "white", fontFamily: SG, fontWeight: 800, fontSize: "1.15rem" }}>Priya Sharma</h3>
                <p style={{ color: "rgba(248,250,252,0.6)", fontFamily: IN, fontSize: "0.75rem" }}>priya.sharma@nestigo.com</p>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-3 gap-3">
              {[{ v: "47", l: "Orders" }, { v: "₹4.8K", l: "Wallet" }, { v: "1,240", l: "Points" }].map((s) => (
                <div key={s.l} className="text-center p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ color: "white", fontFamily: SG, fontWeight: 900, fontSize: "1.1rem" }}>{s.v}</p>
                  <p style={{ color: "rgba(248,250,252,0.55)", fontSize: "0.68rem", fontFamily: IN }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet */}
          <div className="rounded-2xl p-5"
            style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" style={{ color: C.cyan }} />
                <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>Wallet</p>
              </div>
              <p style={{ color: C.price, fontFamily: SG, fontWeight: 900, fontSize: "1.1rem" }}>₹4,835</p>
            </div>
            {walletTxns.slice(0, 3).map((tx, i) => (
              <div key={tx.id} className={`flex items-center gap-3 py-2 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: C.border }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: tx.type === "credit" ? "#22C55E15" : "#EF444415" }}>
                  {tx.type === "credit" ? <Plus className="w-3.5 h-3.5" style={{ color: C.success }} /> : <Minus className="w-3.5 h-3.5" style={{ color: C.danger }} />}
                </div>
                <p style={{ color: C.body, fontFamily: IN, fontSize: "0.78rem", flex: 1 }} className="truncate">{tx.desc}</p>
                <p style={{ color: tx.type === "credit" ? C.success : C.danger, fontFamily: SG, fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>
                  {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: MapPin,   label: "Saved Addresses", sub: "3 locations saved",     color: C.primary, section: "addresses"    },
              { icon: Heart,    label: "Favourites",       sub: "6 saved items",         color: C.offer,   section: "favourites"   },
              { icon: Star,     label: "My Reviews",       sub: "3 reviews written",     color: C.orange,  section: "reviews"      },
              { icon: Gift,     label: "Refer & Earn",     sub: "₹100 per referral",     color: C.success, section: "refer"        },
              { icon: Package,  label: "Order History",    sub: "47 total orders",       color: C.cyan,    section: "orderhistory" },
              { icon: Settings, label: "Settings",         sub: "Preferences & privacy", color: C.muted,   section: "settings"     },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label}
                  onClick={() => setActiveSection(item.section)}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowSm }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}12` }}>
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>{item.label}</p>
                    <p style={{ color: C.muted, fontSize: "0.72rem", fontFamily: IN }}>{item.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: C.muted }} />
                </button>
              );
            })}
          </div>
          <button onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold"
            style={{ background: "#EF444412", border: "1px solid #EF444430", color: C.danger, fontFamily: IN }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Review / Dispute ─────────────────────────────────────────────────────────
function ReviewPage({ setPage }: { setPage: (p: string) => void }) {
  const C = useC();
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: C.gradPrimary, boxShadow: C.shadowBtn }}>
        <ThumbsUp className="w-8 h-8 text-white" />
      </div>
      <h3 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.3rem" }}>Thanks for reviewing!</h3>
      <button onClick={() => setPage("orders")} className="mt-5 px-6 py-3 rounded-2xl font-bold"
        style={{ background: C.gradPrimary, color: "white", fontFamily: SG, boxShadow: C.shadowBtn }}>Back to Orders</button>
    </div>
  );
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="rounded-2xl p-6 space-y-5"
        style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowMd }}>
        <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 700 }}>Rate Your Experience</h2>
        <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: C.border }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: C.gradPrimary, fontFamily: SG, boxShadow: C.shadowBtn }}>S</div>
          <div>
            <p style={{ color: C.heading, fontFamily: IN, fontWeight: 700 }}>Sparkle Home Services</p>
            <p style={{ color: C.muted, fontSize: "0.75rem", fontFamily: IN }}>AC Deep Cleaning · ORD-2026-4850</p>
          </div>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} onClick={() => setRating(s)}>
              <Star className="w-9 h-9 transition-transform hover:scale-110"
                style={{ color: C.star, fill: s <= rating ? C.star : "transparent", strokeWidth: 1.5 }} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience…" rows={3}
          className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
          style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
        <button disabled={rating === 0} onClick={() => setSubmitted(true)}
          className="w-full py-3.5 rounded-2xl font-bold transition-all"
          style={{ background: rating > 0 ? C.gradPrimary : C.section, color: rating > 0 ? "white" : C.muted, fontFamily: SG, boxShadow: rating > 0 ? C.shadowBtn : "none" }}>
          Submit Review
        </button>
      </div>
    </div>
  );
}

function DisputePage({ setPage }: { setPage: (p: string) => void }) {
  const C = useC();
  const [reason, setReason]       = useState("");
  const [notes, setNotes]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return (
    <div className="text-center py-16 px-4">
      <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: C.orange }} />
      <h3 style={{ color: C.heading, fontFamily: SG, fontWeight: 800, fontSize: "1.2rem" }}>Dispute Filed</h3>
      <p style={{ color: C.muted, fontFamily: IN, marginTop: "8px" }}>Our team will review within 24 hours</p>
      <button onClick={() => setPage("orders")} className="mt-5 px-6 py-3 rounded-2xl font-bold"
        style={{ background: C.gradPrimary, color: "white", fontFamily: SG, boxShadow: C.shadowBtn }}>Back to Orders</button>
    </div>
  );
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: C.bg, border: `1px solid ${C.border}`, boxShadow: C.shadowMd }}>
        <h2 style={{ color: C.heading, fontFamily: SG, fontWeight: 700 }}>File a Dispute</h2>
        <select value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl outline-none"
          style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: reason ? C.heading : C.muted, fontFamily: IN, fontSize: "0.875rem" }}>
          <option value="">Select a reason…</option>
          <option>Late delivery</option><option>Damaged items</option>
          <option>Missing items</option><option>Driver conduct</option><option>Wrong items delivered</option>
        </select>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe the issue in detail…" rows={4}
          className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
          style={{ background: C.bgLight, border: `1px solid ${C.border}`, color: C.heading, fontFamily: IN, fontSize: "0.875rem" }} />
        <button disabled={!reason} onClick={() => setSubmitted(true)}
          className="w-full py-3.5 rounded-2xl font-bold transition-all"
          style={{ background: reason ? C.danger : C.section, color: reason ? "white" : C.muted, fontFamily: SG }}>
          Submit Dispute
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function CustomerPortal({ onLogout }: { onLogout: () => void }) {
  const [activePage, setActivePage]         = useState("home");
  const [activeVertical, setActiveVertical] = useState("stationery");
  const [activeOrderId, setActiveOrderId]   = useState(mockOrders[1].id);
  const [cart, setCart]                     = useState<CartItem[]>([]);
  const [searchQ, setSearchQ]               = useState("");
  const [darkMode, setDarkMode]             = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const navigate  = (page: string) => setActivePage(page);
  const portalC = darkMode ? DARK_C : C;

  return (
    <DarkCtx.Provider value={darkMode}>
      <div className={`min-h-screen${darkMode ? " dark" : ""}`} style={{ background: portalC.bgLight }}>
        <TopNav activePage={activePage} setPage={navigate} cartCount={cartCount} searchQ={searchQ} setSearchQ={setSearchQ} />

        <main>
          {activePage === "home"     && <HomePage setPage={navigate} setActiveVertical={(v) => { setActiveVertical(v); navigate("store"); }} />}
          {activePage === "search"   && <SearchPage q={searchQ} setQ={setSearchQ} setPage={navigate} setActiveVertical={setActiveVertical} />}
          {activePage === "store"    && <StorePage vertical={activeVertical} cart={cart} setCart={setCart} setPage={navigate} />}
          {activePage === "cart"     && <CartPage cart={cart} setCart={setCart} setPage={navigate} />}
          {activePage === "checkout" && <CheckoutPage cart={cart} setPage={navigate} setCart={setCart} />}
          {activePage === "orders"   && <OrdersPage setPage={navigate} setActiveOrderId={setActiveOrderId} />}
          {activePage === "tracking" && <TrackingPage orderId={activeOrderId} setPage={navigate} />}
          {activePage === "chat"     && <ChatPage setPage={navigate} />}
          {activePage === "review"   && <ReviewPage setPage={navigate} />}
          {activePage === "dispute"  && <DisputePage setPage={navigate} />}
          {activePage === "profile"  && <ProfilePage onLogout={onLogout} darkMode={darkMode} setDarkMode={setDarkMode} />}
        </main>

        <BottomNav active={activePage} setActive={navigate} cartCount={cartCount} />
      </div>
    </DarkCtx.Provider>
  );
}

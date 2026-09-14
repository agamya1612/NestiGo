import os

base_dir = r"D:\NestiGo\test\services\frontend\src\components\customer"
ui_dir = r"D:\NestiGo\test\services\frontend\src\components\ui"
os.makedirs(base_dir, exist_ok=True)
os.makedirs(ui_dir, exist_ok=True)

files = {
    "TopNav.tsx": """'use client';
import Link from 'next/link';
import { Search, MapPin, ShoppingCart, Bell, User, Package, Zap } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TopNav() {
  const cartCount = useCartStore(state => state.items.reduce((acc, item) => acc + item.quantity, 0));
  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-heading font-extrabold text-lg text-primary">NestiGo</span>
        </Link>
        <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 px-4 py-2 bg-surface-1 border border-border rounded-xl">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." className="border-none shadow-none focus-visible:ring-0 bg-transparent h-auto py-0" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/orders">
            <Button variant="ghost" className="flex items-center gap-1.5"><Package className="w-4 h-4" /> Orders</Button>
          </Link>
          <Link href="/checkout">
            <Button variant={cartCount > 0 ? "default" : "outline"} className="relative flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && <span>{cartCount}</span>}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
""",

    "BottomNav.tsx": """'use client';
import Link from 'next/link';
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export function BottomNav() {
  const cartCount = useCartStore(state => state.items.reduce((acc, item) => acc + item.quantity, 0));
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg flex justify-around p-2">
      <Link href="/" className="flex flex-col items-center p-2"><Home className="w-5 h-5 text-muted-foreground" /><span className="text-xs text-muted-foreground mt-1">Home</span></Link>
      <Link href="/checkout" className="flex flex-col items-center p-2 relative">
        <ShoppingCart className="w-5 h-5 text-muted-foreground" />
        {cartCount > 0 && <span className="absolute top-1 right-1 bg-destructive text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">{cartCount}</span>}
        <span className="text-xs text-muted-foreground mt-1">Cart</span>
      </Link>
      <Link href="/orders" className="flex flex-col items-center p-2"><Package className="w-5 h-5 text-muted-foreground" /><span className="text-xs text-muted-foreground mt-1">Orders</span></Link>
    </div>
  );
}
""",

    "VerticalCard.tsx": """'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Star, Clock } from 'lucide-react';

export function VerticalCard({ vertical }: { vertical: any }) {
  return (
    <Link href={`/catalog/${vertical.id || vertical.label.toLowerCase()}`}>
      <Card className="overflow-hidden transition-all hover:-translate-y-1 cursor-pointer bg-background border-border shadow-sm">
        <div className="h-32 bg-gray-200">
           {/* Placeholder for image */}
           <div className="w-full h-full bg-slate-300 flex items-center justify-center">Image</div>
        </div>
        <div className="p-3">
          <p className="font-bold text-sm">{vertical.label}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {vertical.rating || '4.5'}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {vertical.deliveryTime || '30 mins'}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
""",

    "HeroBanner.tsx": """export function HeroBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-[240px] bg-primary/10 flex flex-col justify-end p-6 mb-8">
       <h3 className="text-primary font-heading font-extrabold text-2xl">Super App</h3>
       <p className="text-muted-foreground">Everything delivered to your doorstep.</p>
    </div>
  );
}
""",

    "CatalogGrid.tsx": """'use client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';

export function CatalogGrid({ items = [] }: { items: any[] }) {
  const { addItem, updateQuantity, items: cartItems } = useCartStore();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(item => {
        const cartItem = cartItems.find(i => i.id === item.id);
        const qty = cartItem ? cartItem.quantity : 0;
        return (
          <Card key={item.id} className="p-3 flex flex-col justify-between">
            <div>
              <p className="font-bold text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.unit}</p>
              <p className="font-bold mt-2">₹{item.price}</p>
            </div>
            <div className="mt-4">
              {qty === 0 ? (
                <Button size="sm" onClick={() => addItem({...item, quantity: 1, rx: item.rx || false, vertical: item.vertical || 'grocery'})} className="w-full">Add</Button>
              ) : (
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, qty - 1)}>-</Button>
                  <span>{qty}</span>
                  <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, qty + 1)}>+</Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
""",

    "FilterSidebar.tsx": """export function FilterSidebar({ vertical }: { vertical: string }) {
  return (
    <div className="w-64 flex-shrink-0 hidden md:block border-r pr-6">
      <h3 className="font-bold mb-4 capitalize">{vertical} Filters</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2"><input type="checkbox" /> In Stock</label>
        <label className="flex items-center gap-2"><input type="checkbox" /> High Rated</label>
      </div>
    </div>
  );
}
""",

    "PrescriptionUpload.tsx": """'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function PrescriptionUpload({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  
  const handleUpload = () => {
    setLoading(true);
    setTimeout(() => {
      onUploadSuccess('https://mock-storage.com/rx.jpg');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-4 border rounded-xl bg-surface-1">
      <h3 className="font-bold mb-2">Prescription Required</h3>
      <p className="text-sm text-muted-foreground mb-4">Upload a valid doctor's prescription for these items.</p>
      <Button onClick={handleUpload} disabled={loading}>{loading ? 'Uploading...' : 'Upload Prescription'}</Button>
    </div>
  );
}
"""
}

for fname, content in files.items():
    with open(os.path.join(base_dir, fname), "w", encoding="utf-8") as f:
        f.write(content)

skeleton_content = """import { cn } from "@/components/ui/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
"""
with open(os.path.join(ui_dir, "skeleton.tsx"), "w", encoding="utf-8") as f:
    f.write(skeleton_content)

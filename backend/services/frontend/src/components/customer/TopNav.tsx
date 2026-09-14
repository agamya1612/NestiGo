'use client';
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

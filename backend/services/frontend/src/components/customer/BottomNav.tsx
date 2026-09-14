'use client';
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

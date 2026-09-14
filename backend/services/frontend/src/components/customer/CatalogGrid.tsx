'use client';
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

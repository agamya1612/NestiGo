import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  rx: boolean; // Requires prescription
  vertical: 'grocery' | 'service' | 'shifting' | 'stationery' | 'bakery';
}

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setCoupon: (code: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getRequiresRx: () => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          return { items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, qty) => set((state) => ({
        items: qty === 0 
          ? state.items.filter((i) => i.id !== id) 
          : state.items.map((i) => i.id === id ? { ...i, quantity: qty } : i)
      })),
      setCoupon: (code) => set({ couponCode: code }),
      clearCart: () => set({ items: [], couponCode: null }),
      getCartTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      getRequiresRx: () => get().items.some(item => item.rx)
    }),
    { name: 'nestigo-cart-storage' }
  )
);

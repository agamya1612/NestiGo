'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PrescriptionUpload } from '@/components/customer/PrescriptionUpload';

export default function CheckoutPage() {
  const { items, getCartTotal, getRequiresRx, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [rxUrl, setRxUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Validate pricing dynamically via pricing-service
      const priceRes = await apiClient.post('/api/pricing/calculate', { items });
      const finalTotal = priceRes.data.final_total;

      // 2. Create Order in order-service
      const orderRes = await apiClient.post('/api/orders', {
        items,
        total: finalTotal,
        prescription_url: rxUrl,
        address: { lat: 12.9716, lng: 77.5946, street: "Indiranagar" } // Replace with actual location store
      });

      // 3. Trigger Payment Gateway (Mocked)
      await apiClient.post('/api/payments/webhook', { order_id: orderRes.data.id, status: 'SUCCESS' });
      
      clearCart();
      router.push(`/orders/${orderRes.data.id}/track`);
    } catch (err) {
      console.error("Checkout Failed", err);
      alert("Checkout Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return <div>Your cart is empty</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-heading font-bold">Checkout</h1>
      
      <div className="bg-surface-1 p-6 rounded-xl border border-border">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-sm mb-2">
            <span>{item.name} (x{item.quantity})</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>₹{getCartTotal()}</span>
        </div>
      </div>

      {getRequiresRx() && (
        <PrescriptionUpload onUploadSuccess={(url) => setRxUrl(url)} />
      )}

      <Button 
        onClick={handleCheckout} 
        disabled={loading || (getRequiresRx() && !rxUrl)}
        className="w-full h-14 text-lg font-bold"
      >
        {loading ? 'Processing...' : `Pay ₹${getCartTotal()}`}
      </Button>
    </div>
  );
}

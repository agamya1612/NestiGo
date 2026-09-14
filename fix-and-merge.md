---
name: fix-and-merge
description: Master operational guide and execution blueprint to fix NestiGo Frontend-Test and merge it seamlessly into the 15-microservice NestiGo backend monorepo. (EXPANDED EXTENDED EDITION)
---

# NestiGo Super-App: Fix & Merge Master Operational Skill
**Version:** 2.0 (Extended Master Blueprint)
**Target:** `D:\NestiGo\test\services\frontend`

This document is the exhaustive, component-by-component, endpoint-by-endpoint master guide for deconstructing the mock Vite SPA in `Frontend-Test` and forging it into a production-grade Next.js 14/15 application embedded within the `test` monorepo.

---

## Phase 1: Pre-Migration & Workspace Initialization

The current `Frontend-Test` is a Figma Make output (`@figma/my-make-file`). We must completely discard the Vite shell and initialize a Next.js App Router workspace inside the backend monorepo.

### 1.1 Directory Scaffold & Cleanup
Run these commands in PowerShell from `D:\NestiGo`:

```powershell
# 1. Create the new frontend service directory in the monorepo
New-Item -ItemType Directory -Path "test\services\frontend"
cd test\services\frontend

# 2. Initialize Next.js (bypass interactive prompts)
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm

# 3. Copy UI primitives & assets from the old mock
Copy-Item -Path "..\..\..\Frontend-Test\src\app\components\ui" -Destination "src\components\ui" -Recurse
Copy-Item -Path "..\..\..\Frontend-Test\src\imports\*" -Destination "public\assets\" -Recurse
```

### 1.2 Master `package.json` Overhaul
The old `package.json` incorrectly placed React in `peerDependencies`. Overwrite `test\services\frontend\package.json` with this production manifest:

```json
{
  "name": "@nestigo/frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 8080",
    "build": "next build",
    "start": "next start -p 8080",
    "lint": "next lint",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "axios": "^1.7.2",
    "@tanstack/react-query": "^5.51.11",
    "zustand": "^4.5.4",
    "socket.io-client": "^4.7.5",
    "@supabase/supabase-js": "^2.44.4",
    "lucide-react": "^0.487.0",
    "framer-motion": "^11.3.19",
    "recharts": "^2.12.7",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "class-variance-authority": "^0.7.0",
    "react-hook-form": "^7.52.1",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/leaflet": "^1.9.12",
    "typescript": "^5.5.3",
    "tailwindcss": "^3.4.6",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19",
    "@playwright/test": "^1.45.2"
  }
}
```

---

## Phase 2: Core Infrastructure & Integration Layer

We must replace the hardcoded mock delays (`setTimeout`) with real integrations to the API Gateway (`Port 3000`).

### 2.1 API Client with Interceptors (`src/lib/api-client.ts`)
This client auto-injects the GoTrue JWT. If a request returns `401 Unauthorized`, it purges the store and redirects.

```typescript
import axios from 'axios';
import { supabase } from './supabase-client';
import { useAuthStore } from '@/store/useAuthStore';

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_GATEWAY,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
    config.headers['x-user-id'] = session.user.id;
    config.headers['x-user-role'] = session.user.user_metadata?.role || 'customer';
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);
```

### 2.2 Global State: Zustand Cart Store (`src/store/useCartStore.ts`)
Replaces the local React state in `CustomerPortal.tsx`. Handles dynamic surge pricing calculation persistence.

```typescript
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
```

### 2.3 Next.js Auth Middleware (`src/middleware.ts`)
Protects all route groups dynamically based on GoTrue JWT metadata.

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Route Guards
  if (!user && (path.startsWith('/admin') || path.startsWith('/provider') || path.startsWith('/driver') || path.startsWith('/orders'))) {
    return NextResponse.redirect(new URL(`/login?returnUrl=${encodeURIComponent(path)}`, request.url));
  }

  // Role Base Access Control (RBAC)
  if (user) {
    const role = user.user_metadata?.role || 'customer';
    if (path.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/unauthorized', request.url));
    if (path.startsWith('/provider') && role !== 'provider') return NextResponse.redirect(new URL('/unauthorized', request.url));
    if (path.startsWith('/driver') && role !== 'driver') return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|public).*)'],
};
```

---

## Phase 3: Real-Time Sockets & Telemetry

NestiGo relies heavily on WebSockets for Saga event propagation (Orders) and Chat.

### 3.1 Order Tracking Socket Hook (`src/hooks/useOrderSocket.ts`)
Connects to `websocket-service` on Port `3005`.

```typescript
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

export function useOrderSocket(orderId: string) {
  const [orderState, setOrderState] = useState<any>(null);
  const [driverGps, setDriverGps] = useState<{lat: number, lng: number} | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!orderId || !token) return;

    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVICE_URL || 'ws://localhost:3005', {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      socket.emit('join_order_room', { orderId });
    });

    socket.on('order_status_changed', (payload) => {
      // Triggered by Kafka 'order.status.updated' event in backend
      setOrderState(payload);
    });

    socket.on('driver_location_update', (payload) => {
      // Triggered by Redis Geo updates
      setDriverGps({ lat: payload.latitude, lng: payload.longitude });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  return { orderState, driverGps };
}
```

### 3.2 Driver GPS Emitter (`src/hooks/useDriverTelemetry.ts`)
Connects to `dispatch-service` on Port `3004` (HTTP POST) or WebSocket.

```typescript
import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

export function useDriverTelemetry(isOnline: boolean, driverId: string) {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!isOnline || !driverId) {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await apiClient.post('/api/dispatch/location', {
            driver_id: driverId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        } catch (error) {
          console.error("Failed to push telemetry", error);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [isOnline, driverId]);
}
```

---

## Phase 4: Component Deconstruction & Page Mapping

The monolithic `CustomerPortal.tsx` (1,219 lines) must be shattered into Server and Client components based on App Router architecture.

### 4.1 Customer Layout (`src/app/(customer)/layout.tsx`)
React Server Component. Houses the `TopNav` (Search, Location) and `BottomNav` (Mobile tabs).

```tsx
import { ReactNode } from 'react';
import { TopNav } from '@/components/customer/TopNav';
import { BottomNav } from '@/components/customer/BottomNav';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body pb-16 lg:pb-0">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
```

### 4.2 Super-App Home Page (`src/app/(customer)/page.tsx`)
React Server Component. Fetches vertical metadata directly from `catalog-service` (`Port 3002`) at request time.

```tsx
import { Suspense } from 'react';
import { apiClient } from '@/lib/api-client';
import { VerticalCard } from '@/components/customer/VerticalCard';
import { HeroBanner } from '@/components/customer/HeroBanner';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchVerticals() {
  // Using direct fetch for RSC caching
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/catalog/verticals`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch verticals');
  return res.json();
}

export default async function HomePage() {
  const verticals = await fetchVerticals();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeroBanner />
      
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {verticals.map((vert: any) => (
            <VerticalCard key={vert.id} vertical={vert} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

### 4.3 Catalog Search Page (`src/app/(customer)/catalog/[vertical]/page.tsx`)
RSC with URL search params for filtering.

```tsx
import { CatalogGrid } from '@/components/customer/CatalogGrid';
import { FilterSidebar } from '@/components/customer/FilterSidebar';

export default async function VerticalCatalogPage({ 
  params, 
  searchParams 
}: { 
  params: { vertical: string },
  searchParams: { q?: string, minPrice?: string, maxPrice?: string }
}) {
  const query = new URLSearchParams(searchParams as any).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/catalog/${params.vertical}?${query}`);
  const items = await res.json();

  return (
    <div className="flex gap-6">
      <FilterSidebar vertical={params.vertical} />
      <div className="flex-1">
        <h1 className="text-2xl font-bold font-heading mb-6 capitalize">{params.vertical} Delivery</h1>
        <CatalogGrid items={items} />
      </div>
    </div>
  );
}
```

### 4.4 Checkout & Pricing API Integration (`src/app/(customer)/checkout/page.tsx`)
Client component orchestrating multiple backend services: `pricing-service` (Port 3006), `order-service` (Port 3001), and Signed Storage URLs.

```tsx
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
```

---

## Phase 5: Provider & Admin Portal Logic

### 5.1 Provider Assignment Radar (`src/app/(provider)/provider/assignments/page.tsx`)
Connects to `dispatch-service` to accept/decline Redis-assigned jobs.

```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export default function ProviderAssignments() {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['provider-assignments'],
    queryFn: async () => {
      const res = await apiClient.get('/api/dispatch/assignments');
      return res.data;
    },
    refetchInterval: 5000 // Poll every 5s for new dispatch offers
  });

  const acceptMutation = useMutation({
    mutationFn: (assignmentId: string) => apiClient.post(`/api/dispatch/assignments/${assignmentId}/accept`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider-assignments'] })
  });

  if (isLoading) return <div>Scanning for jobs...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {assignments?.map((job: any) => (
        <div key={job.id} className="p-4 border border-border rounded-xl bg-card">
          <h3 className="font-bold">{job.type} Delivery</h3>
          <p>Payout: ₹{job.payout}</p>
          <p>Distance: {job.distance}km</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => acceptMutation.mutate(job.id)} className="bg-success">Accept Job</Button>
            <Button variant="outline" className="text-destructive">Decline</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Phase 6: Orchestration, Docker, & Deployment

To merge the frontend into the `test` backend monorepo, we update the Docker cluster.

### 6.1 Unified `docker-compose.yml` (Monorepo Root)

Add the `frontend` service to `D:\NestiGo\test\docker-compose.yml`:

```yaml
version: '3.8'

services:
  # ... existing 15 microservices, kafka, redis, postgres ...

  frontend:
    build:
      context: ./services/frontend
      dockerfile: Dockerfile
    container_name: nestigo-frontend
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_GATEWAY_URL=http://api-gateway:3000
      - NEXT_PUBLIC_WEBSOCKET_SERVICE_URL=ws://websocket-service:3005
      - NEXT_PUBLIC_CHAT_SERVICE_URL=ws://chat-service:3009
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    depends_on:
      - api-gateway
      - websocket-service
      - chat-service
    networks:
      - nestigo-net
    restart: unless-stopped

networks:
  nestigo-net:
    driver: bridge
```

### 6.2 NGINX Reverse Proxy (Optional API Routing)
If avoiding CORS, configure API Gateway behind NGINX.

```nginx
server {
    listen 80;
    server_name nestigo.local;

    location / {
        proxy_pass http://frontend:8080;
    }

    location /api/ {
        proxy_pass http://api-gateway:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io/ {
        proxy_pass http://websocket-service:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
}
```

---

## Phase 7: Comprehensive Testing Suite (Playwright)

To ensure Saga transactions and UI states align, execute end-to-end testing via Playwright inside `services/frontend/tests/e2e/checkout.spec.ts`.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Customer Super-App Flows', () => {
  test('E2E: Add Grocery to Cart, Checkout, and Track Order', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'priya.sharma@nestigo.com');
    await page.fill('input[type="password"]', 'Demo@123');
    await page.click('button[type="submit"]');

    // 2. Add to Cart
    await page.goto('/catalog/grocery');
    await page.click('button:has-text("ADD") >> nth=0');
    
    // 3. Validate Cart Store
    await page.goto('/cart');
    await expect(page.locator('text=Order Summary')).toBeVisible();
    await page.click('button:has-text("Checkout")');

    // 4. Complete Payment (Mocks Payment Webhook via API Gateway)
    await page.click('button:has-text("Pay")');

    // 5. Assert Redirect to Tracking Socket Page
    await expect(page).toHaveURL(/\/orders\/ORD-.*\/track/);
    
    // 6. Assert Socket.IO connection success
    await expect(page.locator('text=Order Confirmed')).toBeVisible();
  });
});
```

---

## Conclusion & Execution Sign-Off

By following this master blueprint, `Frontend-Test` will be fully assimilated into `test` as a robust Next.js 14 App Router service. The UI will decouple from mock state and plug directly into the Saga-driven Kafka microservice backend, utilizing Redis Geospatial tracking and Socket.IO for real-time fidelity.

**Execute `docker compose up --build -d` upon completion.**

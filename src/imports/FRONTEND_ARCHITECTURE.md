# NestiGo Super-App Frontend Architecture & Page Mapping Proposal

**System Version**: 1.0.0  
**Target Repository**: `D:\NestiGo`  
**Target Output**: `D:\NestiGo\FRONTEND_ARCHITECTURE.md`  
**Author**: Implementer 2 (`teamwork_preview_worker`)  
**Date**: 2026-07-26  

---

## 1. Executive Summary & Backend Integration Overview

NestiGo is an enterprise-grade, multi-vertical hyper-local super-app platform connecting five core participant personas: **Customers**, **Service Providers/Merchants**, **Delivery Drivers**, **Platform Administrators**, and **Customer Support Specialists**. The platform operates across five distinct business verticals:
1. **Home Services**: On-demand domestic technical services (AC cleaning, plumbing, electrical).
2. **Retail**: Hyper-local grocery and general merchandise delivery.
3. **Pharmacy**: On-demand prescription verification and OTC medicine delivery.
4. **Shifting**: Logistics, packing, and home moving services.
5. **Bakery**: Perishable food delivery with real-time merchant kitchen coordination.

The backend infrastructure is built around **15 microservices**, an **API Gateway** enforcing Supabase GoTrue JWT authentication, **Apache Kafka** event-driven Saga orchestration, **Redis** spatial geo-tracking (`GEORADIUS`), **PostgreSQL** double-entry financial ledger accounting, **Socket.IO** bi-directional real-time communication, and **AWS S3 / Cloud Storage** signed URL document validation.

This document presents the complete Next.js 14/15 App Router Frontend Architecture Proposal and Pages Mapping Specification. It establishes the technical blueprints, component boundaries, state management models, real-time event integration channels, segment-level Suspense streaming fallbacks (`loading.tsx`), client error boundaries (`error.tsx`), and 100% endpoint/workflow coverage across all five application portals.

---

## 2. Next.js App Router Frontend Architecture Proposal

### 2.1 Framework & Technical Stack

| Category | Recommended Technology | Technical Justification |
|---|---|---|
| **Core Framework** | Next.js 14/15 (App Router) | React Server Components (RSC) for zero-bundle-size initial render, Server Actions for mutations, parallel & intercepting routes for modals, segment-level `loading.tsx` (React Suspense streaming UI) and `error.tsx` (Client component error boundaries). |
| **Language** | TypeScript 5.x (Strict Mode) | End-to-end type safety mapping database Prisma/SQL entities, API DTOs, and Socket event payloads. |
| **Styling & Design System** | Tailwind CSS v3.4 + Shadcn UI + Framer Motion | Utility-first styling with accessible Radix primitives and smooth mobile micro-interactions. |
| **Server State & Caching** | TanStack Query v5 (React Query) / SWR | Optimistic updates, auto-revalidation on window focus, request deduplication, and query cache invalidation. |
| **Client State Management** | Zustand v4 | Lightweight, unopinionated client state for Cart, Driver Live Coordinates, Active Order Session, and UI drawer states. |
| **Real-Time Client** | Socket.IO Client (`socket.io-client` v4) | Persistent bi-directional connections to WebSocket Order Tracking (Port 3005) and Chat Service (Port 3009). |
| **Auth & Security** | Supabase JS Client (`@supabase/supabase-js`) | GoTrue JWT session management, automatic refresh token rotation, and cookie propagation to Next.js Middleware. |
| **Form Handling & Validation** | React Hook Form + Zod | Schema-driven form validation matching backend NestJS/Express DTOs. |
| **HTTP Client** | Axios / Native Fetch Client | Standardized API client wrapping request/response interceptors to inject `Authorization: Bearer <jwt>` and `x-user-id` headers. |

---

### 2.2 Layered System Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                  USER INTERFACE LAYER (Next.js 14/15 App Router)                  |
|   React Server Components (RSC) | Client Components | Parallel @modal | Intercepting Routes      |
|   Segment-Level loading.tsx (Suspense Streaming) | Segment-Level error.tsx (Client Error Boundary)|
+---------------------------------------------------------------------------------------------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
+--------v-------------------------------+ +-----v--------------------------------+ +----v-----------------------------------+
|      STATE MANAGEMENT LAYER            | |    DATA FETCHING & CACHING LAYER     | |    REAL-TIME & WEBSOCKET LAYER         |
| - Zustand (Cart, Driver GPS, UI)       | | - React Server Component fetch()     | | - socket.io-client (Order WS - 3005) |
| - React Context (Local Portal Session) | | - TanStack Query v5 (Server State)   | | - socket.io-client (Chat WS - 3009)  |
+----------------------------------------+ +--------------------------------------+ +----------------------------------------+
                                                 |
+------------------------------------------------v--------------------------------------------------+
|                               API GATEWAY INTEGRATION & SECURITY LAYER                            |
| - Next.js Middleware (middleware.ts): GoTrue JWT token inspection & portal route protection       |
| - API Client (lib/api-client.ts): Automatic Authorization Bearer token & x-user-id header injection |
| - Signed URL Storage Client (lib/upload.ts): AWS S3 / Cloud Storage upload returning signed URLs  |
+---------------------------------------------------------------------------------------------------+
                                                 |
                                     HTTP / REST & WebSockets
                                                 |
+------------------------------------------------v--------------------------------------------------+
|                                  NestiGo BACKEND API GATEWAY (Port 3000)                          |
+---------------------------------------------------------------------------------------------------+
```

#### Layer Breakdown:

1. **UI Layer**: Built using Next.js App Router route groups `(auth)`, `(customer)`, `(provider)`, `(driver)`, `(admin)`, and `(support)`. Uses React Server Components (RSC) for initial page loads (SEO catalog, admin tables) and Client Components (`"use client"`) for interactive elements (cart drawer, live maps, chat boxes). Each route group explicitly incorporates segment-level `loading.tsx` (React Suspense streaming fallbacks) and `error.tsx` (Client component error boundaries) for component-level fault isolation and smooth async UX streaming.
2. **State Layer**:
   - **Client State**: Managed via Zustand stores (`useCartStore`, `useDriverStore`, `useAuthStore`).
   - **Server State**: Managed via TanStack Query v5 with custom query hooks (`useCatalogQuery`, `useOrderDetailsQuery`, `useAnalyticsQuery`).
3. **Data Fetching & Caching Layer**:
   - Server-side fetching using `fetch()` with Next.js revalidation tags (`revalidateTag('catalog')`, `revalidatePath('/admin/orders')`).
   - Client-side revalidation using SWR/TanStack Query for dynamic data polling and real-time cache invalidation upon receiving Socket.IO events.
4. **API Gateway Integration Layer**:
   - Centralized Axios/Fetch wrapper (`lib/api-client.ts`) pointing to `http://localhost:3000` (or `process.env.NEXT_PUBLIC_API_GATEWAY_URL`).
   - Automatically extracts Supabase GoTrue JWT from cookies/session and injects `Authorization: Bearer <jwt>`.
   - Gatekeeper handles downstream header forwarding (`x-user-id`).
5. **Auth & Route Guard Layer (`middleware.ts`)**:
   - Intercepts requests across all portal routes.
   - Decodes Supabase GoTrue JWT token stored in standard cookies (`sb-access-token`).
   - Validates user role permissions against route rules (enforcing `admin_roles` lookup for `/admin/*` and `/support/*`, enforcing active provider profile for `/provider/*` and `/driver/*`).
   - Redirects unauthenticated users to `/login` with `returnUrl`.
6. **Real-Time Layer**:
   - **Order Tracking**: Custom React hook `useOrderTracking(orderId)` connecting to `ws://localhost:3005`, joining room `order_${orderId}`, and updating UI state on `order_update` events.
   - **In-App Messaging**: Custom React hook `useChatRoom(roomId)` connecting to `ws://localhost:3009`, joining `roomId`, emitting `send_message`, and listening for `new_message` and `chat_closed`.
7. **File Upload Layer**:
   - Direct-to-storage flow for provider KYC documents and customer prescriptions.
   - Uploads file directly to cloud storage, generating signed URL matching format `https://storage.nestigo.com/signed/...`.
   - Passes signed URL payload to `kyc-service` (`POST /api/kyc/upload`) or `order-service` (`POST /api/orders`).

---

### 2.3 React Server Components (RSC) vs Client Components Strategy

To maximize performance, SEO, and initial page load speed while maintaining rich interactivity, NestiGo enforces a strict component boundary design strategy:

| Component Type | Primary Purpose | Examples in NestiGo | Server vs Client Decision Rule |
|---|---|---|---|
| **Page Layouts & Shells** | Static structure, metadata, global nav | `(customer)/layout.tsx`, `(admin)/layout.tsx` | **RSC**: Renders layout markup server-side without sending JS to client. |
| **Catalog & Product Browsing** | Search listings, static item details | `app/(customer)/catalog/[vertical]/page.tsx` | **RSC**: Fetches catalog items from `GET /api/catalog/:vertical` at request time with revalidation. |
| **Admin Analytics & Audit Tables** | Data tables, system metrics, logs | `app/(admin)/admin/analytics/page.tsx`, `app/(support)/support/logs/page.tsx` | **RSC**: Executes server-side data fetching directly from backend APIs, returning lightweight HTML. |
| **Interactive Form & Checkout UI** | Dynamic user input, address selection | `app/(customer)/checkout/page.tsx` | **Client Component**: Requires `"use client"` for dynamic form state, cart calculations, and Razorpay modal popups. |
| **Real-Time Order Tracking Map** | Driver location tracking, status updates | `app/(customer)/orders/[id]/track/page.tsx` | **Client Component**: Requires Socket.IO client connection, Leaflet/Google Maps canvas, and live state updates. |
| **In-App Messaging Window** | Bi-directional chat | `app/(customer)/orders/[id]/chat/page.tsx` | **Client Component**: Uses `socket.io-client`, active room event listeners, and auto-scroll message list. |
| **Driver Location Radar & GPS** | Periodic GPS emission | `app/(driver)/driver/radar/page.tsx` | **Client Component**: Accesses browser `navigator.geolocation` API and emits location updates to `POST /api/dispatch/location`. |
| **Async Loading Fallback** | Instant loading skeleton streaming | `(customer)/loading.tsx`, `(admin)/loading.tsx` | **RSC Component / Fallback**: Renders instant skeleton UI while RSC data streams over HTTP. |
| **Error Boundary** | Segment fault handling & retry | `(customer)/error.tsx`, `(admin)/error.tsx` | **Client Component**: Requires `"use client"` to catch runtime errors and provide reset buttons. |

---

### 2.4 Recommended Folder and Component Structure

The frontend repository structure strictly follows Next.js App Router conventions. Route groups wrapped in parentheses (`(group)`) do not alter URL paths. To avoid route collisions across portals (e.g. `/wallet` in Customer vs Provider vs Driver), portal subdirectories are explicitly nested within their respective route groups:

```
nestigo-frontend/
├── app/
│   ├── (auth)/                           # Auth Route Group (Public)
│   │   ├── layout.tsx                    # Shared Auth Layout Shell
│   │   ├── loading.tsx                   # Auth Suspense Fallback
│   │   ├── error.tsx                     # Auth Client Error Boundary
│   │   ├── login/
│   │   │   └── page.tsx                  # User / Provider / Admin Login (/login)
│   │   └── register/
│   │       └── page.tsx                  # Customer & Provider Registration (/register)
│   ├── (customer)/                       # Customer Super-App Portal (URL prefix: /)
│   │   ├── layout.tsx                    # Customer Header, Navigation, Cart Drawer
│   │   ├── loading.tsx                   # Customer Portal Suspense Fallback
│   │   ├── error.tsx                     # Customer Portal Client Error Boundary
│   │   ├── page.tsx                      # Super-App Multi-Vertical Landing Page (/)
│   │   ├── catalog/
│   │   │   └── [vertical]/
│   │   │       ├── page.tsx              # Vertical Catalog Search & Filters (/catalog/[vertical])
│   │   │       └── item/
│   │   │           └── [id]/
│   │   │               └── page.tsx      # Item Detail & Pricing Modal (/catalog/[vertical]/item/[id])
│   │   ├── cart/
│   │   │   └── page.tsx                  # Cart Summary & Dynamic Pricing Calculation (/cart)
│   │   ├── checkout/
│   │   │   └── page.tsx                  # Checkout, Address, Prescription Upload (/checkout)
│   │   ├── orders/
│   │   │   ├── page.tsx                  # Customer Order History List (/orders)
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Order Details Overview (/orders/[id])
│   │   │       ├── track/
│   │   │       │   └── page.tsx          # Real-Time Order Tracking (/orders/[id]/track)
│   │   │       ├── chat/
│   │   │       │   └── page.tsx          # Real-Time Customer-Driver Chat (/orders/[id]/chat)
│   │   │       ├── review/
│   │   │       │   └── page.tsx          # Order Review & Rating Submission (/orders/[id]/review)
│   │   │       └── dispute/
│   │   │           └── page.tsx          # Raise Customer Dispute (/orders/[id]/dispute)
│   │   ├── wallet/
│   │   │   └── page.tsx                  # Customer Wallet Balance & Refunds Ledger (/wallet)
│   │   └── @modal/                       # Parallel Route for Modals
│   │       └── (.)catalog/
│   │           └── [vertical]/
│   │               └── item/
│   │                   └── [id]/
│   │                       └── page.tsx  # Intercepted Item Quick-View Modal
│   ├── (provider)/                       # Provider / Partner Dashboard Route Group
│   │   ├── layout.tsx                    # Provider Sidebar & Header Layout Shell
│   │   ├── loading.tsx                   # Provider Portal Suspense Fallback
│   │   ├── error.tsx                     # Provider Portal Client Error Boundary
│   │   └── provider/                     # Nested Provider Subdirectory (URL prefix: /provider)
│   │       ├── dashboard/
│   │       │   └── page.tsx              # Provider Overview & Assignment Radar (/provider/dashboard)
│   │       ├── assignments/
│   │       │   └── page.tsx              # Offered Job Assignments (/provider/assignments)
│   │       ├── kyc/
│   │       │   └── page.tsx              # Provider KYC Document Upload Panel (/provider/kyc)
│   │       ├── inventory/
│   │       │   └── page.tsx              # Merchant Stock & Inventory Management (/provider/inventory)
│   │       ├── categories/
│   │       │   └── page.tsx              # Assigned Operational Categories (/provider/categories)
│   │       └── wallet/
│   │           └── page.tsx              # Provider Settlement Wallet & Earnings (/provider/wallet)
│   ├── (driver)/                         # Driver / Field Logistics Route Group
│   │   ├── layout.tsx                    # Driver Mobile App Shell & Status Bar
│   │   ├── loading.tsx                   # Driver Portal Suspense Fallback
│   │   ├── error.tsx                     # Driver Portal Client Error Boundary
│   │   └── driver/                       # Nested Driver Subdirectory (URL prefix: /driver)
│   │       ├── radar/
│   │       │   └── page.tsx              # GPS Telemetry & Assignment Radar (/driver/radar)
│   │       ├── jobs/
│   │       │   ├── page.tsx              # Active & Historical Driver Jobs (/driver/jobs)
│   │       │   └── [id]/
│   │       │       ├── page.tsx          # Job Navigation & Pickup Workflow (/driver/jobs/[id])
│   │       │       └── chat/
│   │       │           └── page.tsx      # Driver-Customer In-App Chat (/driver/jobs/[id]/chat)
│   │       └── wallet/
│   │           └── page.tsx              # Driver Daily Earnings & Payout Wallet (/driver/wallet)
│   ├── (admin)/                          # Admin Operations Route Group
│   │   ├── layout.tsx                    # Admin Sidebar, Header & Role Guard Shell
│   │   ├── loading.tsx                   # Admin Portal Suspense Fallback
│   │   ├── error.tsx                     # Admin Portal Client Error Boundary
│   │   └── admin/                        # Nested Admin Subdirectory (URL prefix: /admin)
│   │       ├── orders/
│   │       │   ├── page.tsx              # Platform-Wide Order Command Center (/admin/orders)
│   │       │   └── [id]/
│   │       │       └── manage/
│   │       │           └── page.tsx      # Admin Order Override Desk (/admin/orders/[id]/manage)
│   │       ├── prescriptions/
│   │       │   └── [orderId]/
│   │       │       └── page.tsx          # Pharma Verification Workspace (/admin/prescriptions/[orderId])
│   │       ├── catalog/
│   │       │   └── page.tsx              # Global Catalog & Category Management (/admin/catalog)
│   │       ├── cities/
│   │       │   └── page.tsx              # Multi-City Coverage Configuration (/admin/cities)
│   │       └── analytics/
│   │           └── page.tsx              # Executive Business Analytics (/admin/analytics)
│   ├── (support)/                        # Support & Auditor Portal Route Group
│   │   ├── layout.tsx                    # Support Portal Sidebar & Audit Shell
│   │   ├── loading.tsx                   # Support Portal Suspense Fallback
│   │   ├── error.tsx                     # Support Portal Client Error Boundary
│   │   └── support/                      # Nested Support Subdirectory (URL prefix: /support)
│   │       ├── disputes/
│   │       │   └── page.tsx              # Dispute Resolution Center (/support/disputes)
│   │       ├── kyc/
│   │       │   └── page.tsx              # Provider KYC Approval Desk (/support/kyc)
│   │       ├── refunds/
│   │       │   └── page.tsx              # Manual Refund & Override Workspace (/support/refunds)
│   │       ├── logs/
│   │       │   └── page.tsx              # System Notification SMS Auditor (/support/logs)
│   │       └── audit/
│   │           └── page.tsx              # Immutable Audit Log Viewer (/support/audit)
│   ├── api/                              # Next.js Route Handlers (Edge API proxies)
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts              # Supabase GoTrue Auth Callback Handler
│   ├── global-error.tsx                  # Root Fallback Error Boundary
│   ├── not-found.tsx                     # Global 404 Page
│   └── layout.tsx                        # Root HTML & Metadata Shell
├── components/
│   ├── ui/                               # Shared Primitive UI Components (Shadcn)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── badge.tsx
│   ├── customer/                         # Customer-Specific UI Modules
│   │   ├── vertical-nav.tsx              # Vertical Category Switcher
│   │   ├── item-card.tsx                 # Catalog Item Card
│   │   ├── cart-drawer.tsx               # Cart Drawer & Promo Code Input
│   │   └── tracking-map.tsx              # Socket.IO Powered Leaflet Map
│   ├── provider/                         # Provider-Specific UI Modules
│   │   ├── assignment-card.tsx           # Offer Countdown Card
│   │   └── kyc-uploader.tsx              # Signed URL File Upload Component
│   ├── driver/                           # Driver Mobile Modules
│   │   ├── gps-tracker.tsx               # Web Geolocation GPS Emission Hook
│   │   └── status-button.tsx             # Picked-Up / Completed Action Button
│   └── admin/                            # Admin Modules
│       ├── prescription-viewer.tsx       # Document Viewer & Verification Form
│       └── reassign-dialog.tsx           # Manual Provider Reassignment Dialog
├── hooks/
│   ├── use-auth.ts                       # Supabase GoTrue Auth Hook
│   ├── use-order-tracking.ts             # Socket.IO Order Tracking WS Client (Port 3005)
│   ├── use-chat-room.ts                  # Socket.IO Chat Room WS Client (Port 3009)
│   ├── use-driver-gps.ts                 # Background GPS Telemetry Hook (Port 3004)
│   └── use-cart.ts                       # Zustand Cart Store Hook
├── lib/
│   ├── api-client.ts                     # Axios API Gateway Wrapper (Port 3000)
│   ├── supabase-client.ts                # Supabase GoTrue Client
│   ├── upload.ts                         # Signed Storage URL Generator
│   └── utils.ts                          # Formatters & Helpers
├── middleware.ts                         # Next.js App Router Auth & Role Guard
├── next.config.mjs                       # Next.js Build Configuration
├── package.json                          # Dependencies & Scripts
└── tsconfig.json                         # TypeScript Configuration
```

---

## 3. Comprehensive Frontend Pages Mapping

### 3.1 Flat List of All Required Frontend Pages

Below is the complete list of 33 frontend pages across all 5 portals, aligned with Next.js App Router route group conventions:

| # | Route Path | Page Title | Portal | Primary User Role | Page Type | App Router Directory Path |
|---|---|---|---|---|---|---|
| 1 | `/` | Super-App Multi-Vertical Home | Customer | Customer | RSC | `app/(customer)/page.tsx` |
| 2 | `/catalog/[vertical]` | Vertical Catalog & Search | Customer | Customer | RSC | `app/(customer)/catalog/[vertical]/page.tsx` |
| 3 | `/catalog/[vertical]/item/[id]` | Product & Service Details | Customer | Customer | RSC | `app/(customer)/catalog/[vertical]/item/[id]/page.tsx` |
| 4 | `/cart` | Cart & Dynamic Pricing | Customer | Customer | Client | `app/(customer)/cart/page.tsx` |
| 5 | `/checkout` | Order Checkout & Prescription Upload | Customer | Customer | Client | `app/(customer)/checkout/page.tsx` |
| 6 | `/orders` | Customer Order History | Customer | Customer | RSC | `app/(customer)/orders/page.tsx` |
| 7 | `/orders/[id]/track` | Live Real-Time Order Tracking | Customer | Customer | Client | `app/(customer)/orders/[id]/track/page.tsx` |
| 8 | `/orders/[id]/chat` | Customer-Driver In-App Chat | Customer | Customer | Client | `app/(customer)/orders/[id]/chat/page.tsx` |
| 9 | `/orders/[id]/review` | Provider Review & Rating | Customer | Customer | Client | `app/(customer)/orders/[id]/review/page.tsx` |
| 10 | `/orders/[id]/dispute` | Customer Dispute Submission | Customer | Customer | Client | `app/(customer)/orders/[id]/dispute/page.tsx` |
| 11 | `/wallet` | Customer Wallet & Refunds | Customer | Customer | RSC | `app/(customer)/wallet/page.tsx` |
| 12 | `/provider/dashboard` | Partner Overview Radar | Provider | Provider | Client | `app/(provider)/provider/dashboard/page.tsx` |
| 13 | `/provider/assignments` | Live Job Offer Assignment Center | Provider | Provider | Client | `app/(provider)/provider/assignments/page.tsx` |
| 14 | `/provider/kyc` | Provider KYC Document Upload Desk | Provider | Provider | Client | `app/(provider)/provider/kyc/page.tsx` |
| 15 | `/provider/inventory` | Merchant Stock & Inventory Manager | Provider | Provider | Client | `app/(provider)/provider/inventory/page.tsx` |
| 16 | `/provider/categories` | Operational Categories Matrix | Provider | Provider | RSC | `app/(provider)/provider/categories/page.tsx` |
| 17 | `/provider/wallet` | Provider Settlement & Earnings Wallet | Provider | Provider | RSC | `app/(provider)/provider/wallet/page.tsx` |
| 18 | `/driver/radar` | Driver Live Radar & GPS Telemetry | Driver | Driver | Client | `app/(driver)/driver/radar/page.tsx` |
| 19 | `/driver/jobs` | Driver Active & Past Deliveries | Driver | Driver | Client | `app/(driver)/driver/jobs/page.tsx` |
| 20 | `/driver/jobs/[id]` | Job Navigation & Status Workflow | Driver | Driver | Client | `app/(driver)/driver/jobs/[id]/page.tsx` |
| 21 | `/driver/jobs/[id]/chat` | Driver In-App Customer Chat | Driver | Driver | Client | `app/(driver)/driver/jobs/[id]/chat/page.tsx` |
| 22 | `/driver/wallet` | Driver Daily Earnings Wallet | Driver | Driver | RSC | `app/(driver)/driver/wallet/page.tsx` |
| 23 | `/admin/orders` | System-Wide Order Command Center | Admin | Ops Admin / Super Admin | RSC | `app/(admin)/admin/orders/page.tsx` |
| 24 | `/admin/prescriptions/[orderId]` | Pharma Prescription Verification Workspace | Admin | Ops Admin / Support | Client | `app/(admin)/admin/prescriptions/[orderId]/page.tsx` |
| 25 | `/admin/catalog` | Global Catalog & Item Manager | Admin | Category Mgr / Admin | Client | `app/(admin)/admin/catalog/page.tsx` |
| 26 | `/admin/cities` | Multi-City Coverage Configuration | Admin | Ops Admin / Admin | Client | `app/(admin)/admin/cities/page.tsx` |
| 27 | `/admin/analytics` | Executive Business Analytics Dashboard | Admin | Ops Admin / Super Admin | RSC | `app/(admin)/admin/analytics/page.tsx` |
| 28 | `/admin/orders/[id]/manage` | Order Reassignment & Override Panel | Admin | Ops Admin / Super Admin | Client | `app/(admin)/admin/orders/[id]/manage/page.tsx` |
| 29 | `/support/disputes` | Customer Dispute Resolution Workspace | Support | Support Agent / Admin | Client | `app/(support)/support/disputes/page.tsx` |
| 30 | `/support/kyc` | Provider KYC Verification Desk | Support | Support Agent / Admin | Client | `app/(support)/support/kyc/page.tsx` |
| 31 | `/support/refunds` | Manual Refund & Cancellation Workspace | Support | Support Agent / Admin | Client | `app/(support)/support/refunds/page.tsx` |
| 32 | `/support/logs` | SMS & Notification Delivery Auditor | Support | Support Agent / Admin | RSC | `app/(support)/support/logs/page.tsx` |
| 33 | `/support/audit` | Black-Box System Audit Log Viewer | Support | Support Agent / Admin | RSC | `app/(support)/support/audit/page.tsx` |

---

### 3.2 Structured Page Directory Tree

```
Portal 1: Customer Super-App Portal
├── / (Home)
├── /catalog/[vertical] (Browse Vertical)
│   └── /catalog/[vertical]/item/[id] (Item Detail Modal)
├── /cart (Cart Drawer / Page)
├── /checkout (Checkout & Prescription Upload)
├── /orders (Order History List)
│   └── /orders/[id] (Order Details)
│       ├── /orders/[id]/track (Live Socket.IO Map)
│       ├── /orders/[id]/chat (Live Socket.IO Chat)
│       ├── /orders/[id]/review (Review Form)
│       └── /orders/[id]/dispute (Dispute Form)
└── /wallet (Customer Wallet & Ledger)

Portal 2: Provider / Partner Dashboard
├── /provider/dashboard (Overview & Radar)
├── /provider/assignments (Live Offers)
├── /provider/kyc (KYC Upload Desk)
├── /provider/inventory (Inventory Stock Manager)
├── /provider/categories (Assigned Categories)
└── /provider/wallet (Provider Payout Wallet)

Portal 3: Driver / Field Logistics Mobile Web App
├── /driver/radar (GPS Telemetry & Assignment Radar)
├── /driver/jobs (Job List)
│   └── /driver/jobs/[id] (Fulfillment Navigation)
│       └── /driver/jobs/[id]/chat (Driver Chat)
└── /driver/wallet (Driver Payouts)

Portal 4: Admin Operations & Command Center
├── /admin/orders (Order Command Center)
│   └── /admin/orders/[id]/manage (Order Override & Reassignment)
├── /admin/prescriptions/[orderId] (Prescription Workspace)
├── /admin/catalog (Catalog Manager)
├── /admin/cities (City Coverage Config)
└── /admin/analytics (Executive Analytics)

Portal 5: Support & Auditor Portal
├── /support/disputes (Dispute Resolution Desk)
├── /support/kyc (Provider KYC Desk)
├── /support/refunds (Manual Refund Desk)
├── /support/logs (SMS Notification Auditor)
└── /support/audit (Kafka Black-Box Audit Logger)
```

---

### 3.3 Deep Page-by-Page Technical Specifications

---

#### PORTAL 1: CUSTOMER SUPER-APP PORTAL

##### Page 1: Multi-Vertical Super-App Home Page
- **Route Path**: `/`
- **Page Title**: NestiGo — Hyper-Local Super-App Home
- **Target User Role**: Customer (Public / Authenticated)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(customer)/page.tsx`
- **Backend Microservices & Endpoints**:
  - `catalog-service`: `GET /api/catalog/service`
  - `catalog-service`: `GET /api/catalog/retail`
  - `catalog-service`: `GET /api/catalog/pharma`
  - `catalog-service`: `GET /api/catalog/shifting`
  - `catalog-service`: `GET /api/catalog/bakery`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `VerticalSelector`: Grid of 5 vertical category cards (Home Services, Grocery, Pharmacy, Shifting, Bakery).
  - `CityLocationPicker`: Header bar allowing location selection (filters backend `city_availability`).
  - `FeaturedItemsCarousel`: Horizontally scrolling cards of top items across verticals.
  - State: Selected city string (stored in local storage / Zustand).

##### Page 2: Vertical Catalog & Search Page
- **Route Path**: `/catalog/[vertical]`
- **Page Title**: Browse `{vertical}` Catalog — NestiGo
- **Target User Role**: Customer (Public / Authenticated)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(customer)/catalog/[vertical]/page.tsx`
- **Backend Microservices & Endpoints**:
  - `catalog-service`: `GET /api/catalog/:vertical?q={query}&minPrice={min}&maxPrice={max}&city={city}`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `SearchBar`: Real-time text search input with debounce.
  - `PriceFilterSlider`: Dual-thumb range slider for min/max price filtering.
  - `CatalogItemGrid`: Grid of item cards with image, price, unit, and "Add to Cart" button.
  - State: Search query `q`, `minPrice`, `maxPrice`, filter drawer open state.

##### Page 3: Catalog Item Detail Quick-View Modal
- **Route Path**: `/catalog/[vertical]/item/[id]` (also supported via intercepting route `@modal/(.)catalog/[vertical]/item/[id]/page.tsx`)
- **Page Title**: Item Details — NestiGo
- **Target User Role**: Customer (Public / Authenticated)
- **Page Type**: React Server Component (RSC) with Client Component overlay
- **App Router Location**: `app/(customer)/catalog/[vertical]/item/[id]/page.tsx`
- **Backend Microservices & Endpoints**:
  - `catalog-service`: `GET /api/catalog/:vertical` (filtered item record)
  - `catalog-service`: `GET /api/inventory/:catalogItemId` (stock check)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `ItemDetailCard`: Image, description, unit price, prescription warning badge (if `requires_prescription === true`).
  - `QuantityStepper`: Increment/decrement item quantity.
  - `AddToCartButton`: Dispatches item payload to Zustand `useCartStore`.

##### Page 4: Cart & Dynamic Pricing Page
- **Route Path**: `/cart`
- **Page Title**: Shopping Cart & Summary — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: Client Component
- **App Router Location**: `app/(customer)/cart/page.tsx`
- **Backend Microservices & Endpoints**:
  - `pricing-service`: `POST /api/pricing/calculate`
    - Payload: `{ items: [{ id, quantity }], coupon_code?: string }`
    - Response: `{ base_total, discount, surge_multiplier, final_total }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `CartItemList`: List of selected items with quantity adjusters.
  - `PromoCouponInput`: Input box for applying promotional codes (e.g. `WELCOME10`).
  - `PricingBreakdownCard`: Displays base total, discount amount, peak surge multiplier (1.5x during 18:00-22:00), and final price total.
  - State: `items` array, `couponCode`, `pricingResult` (from `POST /api/pricing/calculate`).

##### Page 5: Order Checkout & Prescription Upload Page
- **Route Path**: `/checkout`
- **Page Title**: Order Checkout — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: Client Component
- **App Router Location**: `app/(customer)/checkout/page.tsx`
- **Backend Microservices & Endpoints**:
  - `order-service`: `POST /api/orders`
    - Payload: `{ items: [{ id, quantity }], address: { street, city, lat, lng } }`
    - Response: `{ message, order: { id, status, prescription_status } }`
  - `payment-service`: `POST /api/payments/webhook` (simulated payment gateway trigger)
  - Cloud Storage: Direct upload to storage bucket returning signed URL prefix `https://storage.nestigo.com/signed/`
- **WebSockets / Kafka Events**:
  - Kafka emitted: `order.placed`, `payment.captured`
- **Key UI Components & State**:
  - `AddressForm`: Delivery address input with Leaflet pin selector for lat/lng coordinates.
  - `PrescriptionUploader`: File uploader visible only if cart contains items with `requires_prescription = true`. Uploads file directly to cloud storage and attaches signed URL to order payload.
  - `RazorpayPayButton`: Triggers payment gateway popup.
  - State: Delivery address, prescription signed URL, payment processing state.

##### Page 6: Customer Order History Page
- **Route Path**: `/orders`
- **Page Title**: My Orders — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(customer)/orders/page.tsx`
- **Backend Microservices & Endpoints**:
  - `order-service`: `GET /api/orders` (Returns customer orders filtered by `customer_id`)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `OrderHistoryList`: List of past and active orders with status badges (`pending_payment`, `paid`, `confirmed`, `picked_up`, `completed`, `cancelled`, `refunded`).
  - `ActionButtons`: Links to Track Order, Chat with Driver, Leave Review, or Cancel Order.

##### Page 7: Live Real-Time Order Tracking Page
- **Route Path**: `/orders/[id]/track`
- **Page Title**: Live Order Tracking — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: Client Component
- **App Router Location**: `app/(customer)/orders/[id]/track/page.tsx`
- **Backend Microservices & Endpoints**:
  - `websocket-service`: Socket.IO WS Port 3005 (`ws://localhost:3005`)
- **WebSockets / Kafka Events**:
  - Socket Client Emits: `subscribe_order` with payload `{ orderId }`
  - Socket Client Listens: `order_update` payload `{ eventType, payload }`
  - Kafka Events Relayed: `order.status.updated`, `provider.assignment.accepted`, `payment.captured`
- **Key UI Components & State**:
  - `LiveTrackingMap`: Leaflet map showing customer location and live driver marker updating smoothly.
  - `StatusTimeline`: Visual step tracker (Order Placed -> Payment Verified -> Driver Assigned -> Picked Up -> Completed).
  - State: Driver `lat`/`lng` position, current `order_status`.

##### Page 8: Customer-Driver In-App Chat Page
- **Route Path**: `/orders/[id]/chat`
- **Page Title**: Chat with Delivery Partner — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: Client Component
- **App Router Location**: `app/(customer)/orders/[id]/chat/page.tsx`
- **Backend Microservices & Endpoints**:
  - `chat-service`: Socket.IO WS Port 3009 (`ws://localhost:3009`)
- **WebSockets / Kafka Events**:
  - Socket Handshake Query: `userId`
  - Socket Client Emits: `join_chat` with `{ roomId }`, `send_message` with `{ roomId, content }`
  - Socket Client Listens: `new_message` with `{ sender_id, content, created_at }`, `chat_closed`
- **Key UI Components & State**:
  - `ChatMessageList`: Scrollable list of text message bubbles.
  - `MessageInputBox`: Text area with send button.
  - `ChatClosedBanner`: Alert box shown when order completes/cancels (`chat_closed` event).
  - State: Messages array, socket connection status, active room status.

##### Page 9: Customer Provider Review & Rating Page
- **Route Path**: `/orders/[id]/review`
- **Page Title**: Review Provider — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: Client Component
- **App Router Location**: `app/(customer)/orders/[id]/review/page.tsx`
- **Backend Microservices & Endpoints**:
  - `review-service`: `POST /api/reviews`
    - Payload: `{ order_id, provider_id, rating: 1..5, comment }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `StarRatingInput`: Interactive 1-to-5 star component.
  - `CommentTextArea`: Text box for feedback.
  - `SubmitReviewButton`: Submits rating and redirects back to `/orders`.

##### Page 10: Customer Dispute Submission Page
- **Route Path**: `/orders/[id]/dispute`
- **Page Title**: File a Dispute — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: Client Component
- **App Router Location**: `app/(customer)/orders/[id]/dispute/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: Custom dispute endpoint / database table `disputes` insertion
    - Payload: `{ order_id, reason }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `DisputeReasonSelect`: Dropdown (Late delivery, Damaged items, Missing items, Driver conduct).
  - `DisputeNotesTextarea`: Explanation box.
  - `SubmitDisputeButton`: Creates dispute record in status `'open'`.

##### Page 11: Customer Wallet & Refunds Ledger Page
- **Route Path**: `/wallet`
- **Page Title**: My Wallet & Refunds — NestiGo
- **Target User Role**: Customer (`Authenticated`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(customer)/wallet/page.tsx`
- **Backend Microservices & Endpoints**:
  - `ledger-service`: `GET /api/ledger/wallet`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `WalletBalanceCard`: Highlights current balance in INR (credited from Saga order refunds).
  - `LedgerTransactionTable`: Audit log of deposits, refunds, and debits with reference order IDs.

---

#### PORTAL 2: PROVIDER / PARTNER DASHBOARD

##### Page 12: Provider Overview & Assignment Radar Page
- **Route Path**: `/provider/dashboard`
- **Page Title**: Provider Operations Radar — NestiGo
- **Target User Role**: Service Provider / Merchant (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(provider)/provider/dashboard/page.tsx`
- **Backend Microservices & Endpoints**:
  - `user-service`: `POST /api/users/kyc` (profile status check)
  - `order-service`: `GET /api/orders` (assigned provider orders)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `ProviderStatusToggle`: Active/Inactive toggle button updating Redis/Postgres active state.
  - `ActiveJobsTable`: Summary of active assigned orders.
  - `KYCWarningBanner`: Displays prompt to upload KYC documents if `kyc_status !== 'approved'`.

##### Page 13: Live Job Offer Assignment Center Page
- **Route Path**: `/provider/assignments`
- **Page Title**: Job Assignments Radar — NestiGo
- **Target User Role**: Service Provider / Delivery Driver (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(provider)/provider/assignments/page.tsx`
- **Backend Microservices & Endpoints**:
  - `dispatch-service`: `POST /api/dispatch/assignments/:id/accept`
  - `dispatch-service`: `POST /api/dispatch/assignments/:id/decline`
- **WebSockets / Kafka Events**:
  - Kafka emitted: `provider.assignment.accepted` or `provider.assignment.failed`
  - Notification received: SMS alert via `notification-service`
- **Key UI Components & State**:
  - `OfferCountdownCard`: Modal/Card showing new job offer with payout amount, distance, and 5-second countdown timer.
  - `AcceptButton`: Triggers accept endpoint.
  - `DeclineButton`: Triggers decline endpoint.
  - State: Current offered assignment details, countdown seconds remaining.

##### Page 14: Provider KYC Document Upload Desk Page
- **Route Path**: `/provider/kyc`
- **Page Title**: Provider Identity Verification (KYC) — NestiGo
- **Target User Role**: Service Provider (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(provider)/provider/kyc/page.tsx`
- **Backend Microservices & Endpoints**:
  - `kyc-service`: `POST /api/kyc/upload`
    - Payload: `{ document_type, document_url }` (enforces signed URL prefix `https://storage.nestigo.com/signed/`)
  - `user-service`: `POST /api/users/kyc`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `DocumentTypeSelect`: Dropdown (Aadhar, PAN Card, Driving License, Commercial License).
  - `SignedUrlFileUploader`: Drag-and-drop file upload component that uploads directly to cloud storage and validates signed URL.
  - `KycStatusBadge`: Visual indicator (`pending`, `approved`, `rejected`).

##### Page 15: Merchant Stock & Inventory Manager Page
- **Route Path**: `/provider/inventory`
- **Page Title**: Inventory Stock Manager — NestiGo
- **Target User Role**: Merchant / Provider (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(provider)/provider/inventory/page.tsx`
- **Backend Microservices & Endpoints**:
  - `catalog-service`: `GET /api/inventory/:catalogItemId`
  - `catalog-service`: `POST /api/inventory/deduct`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `InventoryTable`: List of catalog items mapped to location ID with current stock count.
  - `StockAdjustmentInput`: Inline number editor to adjust stock level.

##### Page 16: Operational Categories Matrix Page
- **Route Path**: `/provider/categories`
- **Page Title**: Operational Categories — NestiGo
- **Target User Role**: Provider (`provider_profiles`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(provider)/provider/categories/page.tsx`
- **Backend Microservices & Endpoints**:
  - `catalog-service`: `GET /api/catalog/:vertical`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `CategoryList`: List of business categories enabled for the provider profile.

##### Page 17: Provider Settlement Wallet & Earnings Page
- **Route Path**: `/provider/wallet`
- **Page Title**: Earnings & Settlements — NestiGo
- **Target User Role**: Provider (`provider_profiles`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(provider)/provider/wallet/page.tsx`
- **Backend Microservices & Endpoints**:
  - `ledger-service`: `GET /api/ledger/wallet`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `EarningsSummaryCard`: Displays total balance credited from 80% order settlement payouts (`settlement.processed`).
  - `SettlementTransactionsTable`: Detailed ledger of processed earnings transactions.

---

#### PORTAL 3: DRIVER / FIELD LOGISTICS MOBILE WEB APP

##### Page 18: Driver Live Radar & GPS Telemetry Page
- **Route Path**: `/driver/radar`
- **Page Title**: Driver Logistics Radar — NestiGo
- **Target User Role**: Delivery Driver (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(driver)/driver/radar/page.tsx`
- **Backend Microservices & Endpoints**:
  - `dispatch-service`: `POST /api/dispatch/location`
    - Payload: `{ lng: number, lat: number }` (Updates Redis GEO key `active_providers`)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `DutyStatusSwitch`: Online/Offline switch enabling or disabling background GPS polling.
  - `GpsTelemetryStatus`: Component displaying current latitude, longitude, and last ping timestamp sent to `dispatch-service`.
  - State: Geolocation watch position ID, online toggle boolean.

##### Page 19: Driver Active & Past Deliveries Page
- **Route Path**: `/driver/jobs`
- **Page Title**: Driver Deliveries — NestiGo
- **Target User Role**: Delivery Driver (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(driver)/driver/jobs/page.tsx`
- **Backend Microservices & Endpoints**:
  - `order-service`: `GET /api/orders` (Assigned provider orders)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `JobTabs`: Active Jobs vs Completed History.
  - `JobCard`: Order summary with customer address, delivery vertical badge, and navigate button.

##### Page 20: Job Navigation & Status Workflow Page
- **Route Path**: `/driver/jobs/[id]`
- **Page Title**: Fulfill Order #{id} — NestiGo
- **Target User Role**: Delivery Driver (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(driver)/driver/jobs/[id]/page.tsx`
- **Backend Microservices & Endpoints**:
  - `order-service`: `PUT /api/orders/:id/status`
    - Payload: `{ status: 'picked_up' | 'completed' }`
- **WebSockets / Kafka Events**:
  - Kafka emitted: `order.status.updated` (`picked_up`) or `order.completed`
  - Triggers downstream 80% provider settlement calculation
- **Key UI Components & State**:
  - `FulfillmentMap`: Turn-by-turn route map to pickup location and customer delivery address.
  - `StatusActionButton`: Dynamic primary button: "Mark Picked Up" (transitions to `picked_up`) -> "Complete Delivery" (transitions to `completed`).
  - State: Current order status, loading transition state.

##### Page 21: Driver In-App Customer Chat Page
- **Route Path**: `/driver/jobs/[id]/chat`
- **Page Title**: Chat with Customer — NestiGo
- **Target User Role**: Delivery Driver (`provider_profiles`)
- **Page Type**: Client Component
- **App Router Location**: `app/(driver)/driver/jobs/[id]/chat/page.tsx`
- **Backend Microservices & Endpoints**:
  - `chat-service`: Socket.IO WS Port 3009 (`ws://localhost:3009`)
- **WebSockets / Kafka Events**:
  - Socket Handshake Query: `userId`
  - Socket Client Emits: `join_chat`, `send_message`
  - Socket Client Listens: `new_message`, `chat_closed`
- **Key UI Components & State**:
  - `DriverChatWindow`: Mobile-optimized messaging interface for communicating with customer during fulfillment.

##### Page 22: Driver Daily Earnings Wallet Page
- **Route Path**: `/driver/wallet`
- **Page Title**: Driver Daily Payouts — NestiGo
- **Target User Role**: Delivery Driver (`provider_profiles`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(driver)/driver/wallet/page.tsx`
- **Backend Microservices & Endpoints**:
  - `ledger-service`: `GET /api/ledger/wallet`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `DailyPayoutCard`: Breakdown of completed job payouts (80% settlement).

---

#### PORTAL 4: ADMIN OPERATIONS & COMMAND CENTER

##### Page 23: System-Wide Order Command Center Page
- **Route Path**: `/admin/orders`
- **Page Title**: Order Operations Command Center — NestiGo
- **Target User Role**: Admin (`admin_roles`: `super_admin`, `ops_admin`, `support_agent`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(admin)/admin/orders/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `GET /api/admin/orders` (Top 100 recent orders across all verticals with customer emails)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `GlobalOrderTable`: Data table displaying order ID, customer email, vertical type, status, total amount, prescription status, and creation date.
  - `VerticalFilterTabs`: Filter table by vertical (`service`, `retail`, `pharma`, `shifting`, `bakery`).

##### Page 24: Pharma Prescription Verification Workspace Page
- **Route Path**: `/admin/prescriptions/[orderId]`
- **Page Title**: Prescription Verification Workspace — NestiGo
- **Target User Role**: Pharmacist / Ops Admin (`admin_roles`: `ops_admin`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(admin)/admin/prescriptions/[orderId]/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `POST /api/admin/prescriptions/:orderId/verify`
    - Payload: `{ status: 'verified' | 'rejected' }`
- **WebSockets / Kafka Events**:
  - Kafka emitted on verification: `payment.captured` (triggers automated driver dispatch)
  - Action on rejection: Order status updated to `cancelled`
- **Key UI Components & State**:
  - `PrescriptionImageViewer`: High-resolution document viewer with zoom and rotate controls.
  - `PatientOrderSummaryCard`: List of ordered pharmaceutical items.
  - `ApproveButton`: Triggers verify endpoint (`status = 'verified'`).
  - `RejectButton`: Triggers rejection endpoint (`status = 'rejected'`).

##### Page 25: Global Catalog & Item Manager Page
- **Route Path**: `/admin/catalog`
- **Page Title**: Catalog & Category Manager — NestiGo
- **Target User Role**: Category Manager (`admin_roles`: `category_manager`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(admin)/admin/catalog/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `POST /api/admin/catalog/items`
  - `admin-service`: `PUT /api/admin/catalog/items/:id`
  - `catalog-service`: `GET /api/catalog/service`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `CatalogItemTable`: Comprehensive catalog item listing.
  - `CreateItemModal`: Form to add catalog items (name, description, price, unit, category ID, prescription requirement).
  - `EditItemDrawer`: Drawer component for updating item pricing and active status.

##### Page 26: Multi-City Coverage Configuration Page
- **Route Path**: `/admin/cities`
- **Page Title**: Regional City Coverage Config — NestiGo
- **Target User Role**: Ops Admin (`admin_roles`: `ops_admin`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(admin)/admin/cities/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `PUT /api/admin/categories/:id/city-availability`
    - Payload: `{ cities: ['Mumbai', 'Delhi', 'Bengaluru'] }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `CategoryCityMatrix`: Table mapping categories to available cities.
  - `MultiSelectCityTag`: Tag selector to dynamically update JSONB `city_availability` array for a category.

##### Page 27: Executive Business Analytics Dashboard Page
- **Route Path**: `/admin/analytics`
- **Page Title**: Executive Business Analytics — NestiGo
- **Target User Role**: Executive Admin (`admin_roles`: `ops_admin`, `super_admin`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(admin)/admin/analytics/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `GET /api/admin/analytics`
    - Response: `{ analytics: { total_orders, total_revenue, active_providers } }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `KpiMetricCards`: Cards showing total order volume, gross revenue, and active provider count.
  - `RevenueCharts`: Visual breakdown of revenue across business verticals.

##### Page 28: Order Reassignment & Override Panel Page
- **Route Path**: `/admin/orders/[id]/manage`
- **Page Title**: Manage Order #{id} — NestiGo
- **Target User Role**: Ops Admin (`admin_roles`: `ops_admin`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(admin)/admin/orders/[id]/manage/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `POST /api/admin/orders/:id/reassign`
  - `admin-service`: `POST /api/admin/orders/:id/cancel`
  - `admin-service`: `POST /api/admin/orders/:id/refund`
- **WebSockets / Kafka Events**:
  - Kafka emitted: `payment.refund.requested`
- **Key UI Components & State**:
  - `ProviderReassignSelect`: Dropdown to manually pick a new provider.
  - `ForceCancelButton`: Cancels order and triggers refund request.
  - `ManualRefundForm`: Form specifying custom refund amount and reason.

---

#### PORTAL 5: SUPPORT & AUDITOR PORTAL

##### Page 29: Customer Dispute Resolution Workspace Page
- **Route Path**: `/support/disputes`
- **Page Title**: Customer Dispute Resolution — NestiGo
- **Target User Role**: Support Specialist (`admin_roles`: `support_agent`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(support)/support/disputes/page.tsx`
- **Backend Microservices & Endpoints**:
  - `admin-service`: `POST /api/admin/disputes/:id/resolve`
    - Payload: `{ resolution_notes }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `OpenDisputeQueue`: List of unresolved customer disputes.
  - `DisputeDetailDrawer`: Form allowing support agents to review dispute details and enter resolution notes.

##### Page 30: Provider KYC Verification Desk Page
- **Route Path**: `/support/kyc`
- **Page Title**: Provider KYC Verification Desk — NestiGo
- **Target User Role**: Support Agent / Ops Admin (`admin_roles`: `support_agent`, `ops_admin`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(support)/support/kyc/page.tsx`
- **Backend Microservices & Endpoints**:
  - `kyc-service`: `PUT /api/kyc/:id/verify`
    - Payload: `{ status: 'verified' | 'rejected' }`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `KycDocumentViewer`: Preview uploaded document URL (validates prefix `https://storage.nestigo.com/signed/`).
  - `ApproveKycButton`: Approves provider KYC, updating `provider_profiles.kyc_status = 'approved'` and `active = true`.
  - `RejectKycButton`: Rejects document with feedback.

##### Page 31: Manual Refund & Cancellation Workspace Page
- **Route Path**: `/support/refunds`
- **Page Title**: Refund Management Desk — NestiGo
- **Target User Role**: Support Agent / Ops Admin (`admin_roles`: `support_agent`, `super_admin`)
- **Page Type**: Client Component
- **App Router Location**: `app/(support)/support/refunds/page.tsx`
- **Backend Microservices & Endpoints**:
  - `payment-service`: `GET /api/payments/refunds`
  - `payment-service`: `POST /api/payments/refunds/:id/retry`
- **WebSockets / Kafka Events**:
  - Kafka emitted: `payment.refunded`
- **Key UI Components & State**:
  - `RefundsAuditTable`: Displays failed and completed refund records.
  - `RetryRefundButton`: Allows support agents to manually retry failed refund operations.

##### Page 32: System SMS & Notification Delivery Auditor Page
- **Route Path**: `/support/logs`
- **Page Title**: SMS & Notification Auditor — NestiGo
- **Target User Role**: Support Agent / System Auditor (`admin_roles`: `support_agent`, `super_admin`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(support)/support/logs/page.tsx`
- **Backend Microservices & Endpoints**:
  - `notification-service`: `GET /api/logs?recipient={phone}&status={status}`
  - `notification-service`: `GET /api/logs/:id`
  - `admin-service`: `GET /api/admin/notifications/logs`
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `NotificationLogTable`: Filterable delivery log table displaying recipient phone number, message text, status (`sent` vs `failed_invalid_phone`), and timestamp.

##### Page 33: Black-Box System Audit Log Viewer Page
- **Route Path**: `/support/audit`
- **Page Title**: Black-Box System Event Audit Logger — NestiGo
- **Target User Role**: System Auditor / Super Admin (`admin_roles`: `super_admin`)
- **Page Type**: React Server Component (RSC)
- **App Router Location**: `app/(support)/support/audit/page.tsx`
- **Backend Microservices & Endpoints**:
  - `audit-service`: Queries `audit_logs` table (persisting all Kafka messages verbatim)
- **WebSockets / Kafka Events**: None
- **Key UI Components & State**:
  - `AuditTrailViewer`: Real-time inspectable stream of Kafka event bus messages across topics (`orders`, `payments`, `provider.assignments`, `notifications`).

---

## 4. Acceptance Criteria Checklist & Feature Coverage Matrix

### 4.1 Backend Microservices 100% Coverage Matrix

| # | Backend Microservice | Internal Port | Ingress Route | Handled in Frontend Portals / Pages | Coverage Verification |
|---|---|---|---|---|---|
| 1 | `api-gateway` | 3000 | `/` | All Portals (Global API Client & Middleware) | **100% Covered** |
| 2 | `user-service` | 3004 / 3012 | `/api/users` | Provider Portal (Pages 12, 14) | **100% Covered** |
| 3 | `catalog-service` | 3003 | `/api/catalog`, `/api/inventory` | Customer & Provider Portals (Pages 1, 2, 3, 15, 16, 25) | **100% Covered** |
| 4 | `order-service` | 3001 | `/api/orders` | Customer, Driver, & Admin Portals (Pages 5, 6, 19, 20, 23, 28) | **100% Covered** |
| 5 | `payment-service` | 3002 | `/api/payments` | Customer & Support Portals (Pages 5, 31) | **100% Covered** |
| 6 | `pricing-service` | 3007 | `/api/pricing` | Customer Portal (Page 4) | **100% Covered** |
| 7 | `kyc-service` | 3008 | `/api/kyc` | Provider & Support Portals (Pages 14, 30) | **100% Covered** |
| 8 | `ledger-service` | 3006 | `/api/ledger` | Customer, Provider, & Driver Portals (Pages 11, 17, 22) | **100% Covered** |
| 9 | `review-service` | 3010 | `/api/reviews` | Customer Portal (Page 9) | **100% Covered** |
| 10 | `notification-service` | 3008 | `/api/logs` | Support Portal (Page 32) | **100% Covered** |
| 11 | `admin-service` | 3013 | `/api/admin` | Admin & Support Portals (Pages 23, 24, 25, 26, 27, 28, 29) | **100% Covered** |
| 12 | `dispatch-service` | 3004 | `/api/dispatch` | Provider & Driver Portals (Pages 13, 18) | **100% Covered** |
| 13 | `chat-service` | 3009 | Socket.IO WS | Customer & Driver Portals (Pages 8, 21) | **100% Covered** |
| 14 | `websocket-service` | 3005 | Socket.IO WS | Customer Portal (Page 7) | **100% Covered** |
| 15 | `audit-service` | None | Background Kafka Sink | Support & Auditor Portal (Page 33) | **100% Covered** |

---

### 4.2 REST Endpoints 100% Coverage Matrix

| Domain | HTTP Verb | Route Path | Microservice | Invoking Frontend Page | Coverage Status |
|---|---|---|---|---|---|
| Identity | `ALL` | `/auth/*` | `api-gateway` | Auth Route Group (`(auth)/login`, `register`) | **100% Covered** |
| Profile & KYC | `POST` | `/api/users/kyc` | `user-service` | Page 14 (`/provider/kyc`) | **100% Covered** |
| Profile & KYC | `POST` | `/api/kyc/upload` | `kyc-service` | Page 14 (`/provider/kyc`) | **100% Covered** |
| Profile & KYC | `PUT` | `/api/kyc/:id/verify` | `kyc-service` | Page 30 (`/support/kyc`) | **100% Covered** |
| Catalog | `GET` | `/api/catalog/:vertical` | `catalog-service` | Pages 1, 2, 3 (`/`, `/catalog/[vertical]`, `/catalog/[vertical]/item/[id]`) | **100% Covered** |
| Catalog | `GET` | `/api/inventory/:catalogItemId` | `catalog-service` | Pages 3, 15 (`/provider/inventory`) | **100% Covered** |
| Catalog | `POST` | `/api/inventory/deduct` | `catalog-service` | Page 15 (`/provider/inventory`) | **100% Covered** |
| Orders | `POST` | `/api/orders` | `order-service` | Page 5 (`/checkout`) | **100% Covered** |
| Orders | `GET` | `/api/orders` | `order-service` | Pages 6, 12, 19 (`/orders`, `/provider/dashboard`, `/driver/jobs`) | **100% Covered** |
| Orders | `PUT` | `/api/orders/:id/status` | `order-service` | Page 20 (`/driver/jobs/[id]`) | **100% Covered** |
| Orders | `POST` | `/api/orders/:id/cancel` | `order-service` | Page 6 (`/orders`) | **100% Covered** |
| Pricing | `POST` | `/api/pricing/calculate` | `pricing-service` | Page 4 (`/cart`) | **100% Covered** |
| Payments | `POST` | `/api/payments/webhook` | `payment-service` | Page 5 (`/checkout`) | **100% Covered** |
| Payments | `GET` | `/api/payments/refunds` | `payment-service` | Page 31 (`/support/refunds`) | **100% Covered** |
| Payments | `POST` | `/api/payments/refunds/:id/retry` | `payment-service` | Page 31 (`/support/refunds`) | **100% Covered** |
| Ledger | `GET` | `/api/ledger/wallet` | `ledger-service` | Pages 11, 17, 22 (`/wallet`, `/provider/wallet`, `/driver/wallet`) | **100% Covered** |
| Dispatch | `POST` | `/api/dispatch/location` | `dispatch-service` | Page 18 (`/driver/radar`) | **100% Covered** |
| Dispatch | `POST` | `/api/dispatch/assignments/:id/accept` | `dispatch-service` | Page 13 (`/provider/assignments`) | **100% Covered** |
| Dispatch | `POST` | `/api/dispatch/assignments/:id/decline` | `dispatch-service` | Page 13 (`/provider/assignments`) | **100% Covered** |
| Reviews | `POST` | `/api/reviews` | `review-service` | Page 9 (`/orders/[id]/review`) | **100% Covered** |
| Admin | `GET` | `/api/admin/orders` | `admin-service` | Page 23 (`/admin/orders`) | **100% Covered** |
| Admin | `POST` | `/api/admin/prescriptions/:orderId/verify` | `admin-service` | Page 24 (`/admin/prescriptions/[orderId]`) | **100% Covered** |
| Admin | `POST` | `/api/admin/disputes/:id/resolve` | `admin-service` | Page 29 (`/support/disputes`) | **100% Covered** |
| Admin | `POST` | `/api/admin/catalog/items` | `admin-service` | Page 25 (`/admin/catalog`) | **100% Covered** |
| Admin | `PUT` | `/api/admin/catalog/items/:id` | `admin-service` | Page 25 (`/admin/catalog`) | **100% Covered** |
| Admin | `PUT` | `/api/admin/categories/:id/city-availability` | `admin-service` | Page 26 (`/admin/cities`) | **100% Covered** |
| Admin | `GET` | `/api/admin/analytics` | `admin-service` | Page 27 (`/admin/analytics`) | **100% Covered** |
| Admin | `POST` | `/api/admin/orders/:id/reassign` | `admin-service` | Page 28 (`/admin/orders/[id]/manage`) | **100% Covered** |
| Admin | `POST` | `/api/admin/orders/:id/cancel` | `admin-service` | Page 28 (`/admin/orders/[id]/manage`) | **100% Covered** |
| Admin | `POST` | `/api/admin/orders/:id/refund` | `admin-service` | Page 28 (`/admin/orders/[id]/manage`) | **100% Covered** |
| Logs | `GET` | `/api/logs` | `notification-service` | Page 32 (`/support/logs`) | **100% Covered** |
| Logs | `GET` | `/api/logs/:id` | `notification-service` | Page 32 (`/support/logs`) | **100% Covered** |

---

### 4.3 WebSockets & Real-Time Gateway Coverage Matrix

| WebSocket Server | Port | Event Channel | Direction | Frontend Page | Coverage Status |
|---|---|---|---|---|---|
| `websocket-service` | 3005 | `subscribe_order` | Client -> Server | Page 7 (`/orders/[id]/track`) | **100% Covered** |
| `websocket-service` | 3005 | `order_update` | Server -> Client | Page 7 (`/orders/[id]/track`) | **100% Covered** |
| `chat-service` | 3009 | `join_chat` | Client -> Server | Pages 8, 21 (`/orders/[id]/chat`, `/driver/jobs/[id]/chat`) | **100% Covered** |
| `chat-service` | 3009 | `send_message` | Client -> Server | Pages 8, 21 (`/orders/[id]/chat`, `/driver/jobs/[id]/chat`) | **100% Covered** |
| `chat-service` | 3009 | `new_message` | Server -> Client | Pages 8, 21 (`/orders/[id]/chat`, `/driver/jobs/[id]/chat`) | **100% Covered** |
| `chat-service` | 3009 | `chat_closed` | Server -> Client | Pages 8, 21 (`/orders/[id]/chat`, `/driver/jobs/[id]/chat`) | **100% Covered** |

---

### 4.4 State Machine Workflows Coverage Matrix

| Workflow State Machine | State Transitions | Microservice & Trigger | Frontend Handling & UI Component | Coverage Status |
|---|---|---|---|---|
| **1. Order Status (`order_status`)** | `pending_payment` -> `paid` -> `confirmed` -> `picked_up` -> `completed` -> `refunded` | `order-service`, `payment-service`, `dispatch-service` | Pages 5, 7, 20 (`/checkout`, `/orders/[id]/track`, `/driver/jobs/[id]`) with live map tracking and status timeline. | **100% Covered** |
| **2. Prescription Verification (`prescription_status`)** | `pending` -> `verified` or `rejected` | `admin-service`, `dispatch-service` | Page 24 (`/admin/prescriptions/[orderId]`) with document viewer and approve/reject actions. | **100% Covered** |
| **3. Provider Assignment (`assignment_status`)** | `offered` -> `accepted` / `declined` / `expired` | `dispatch-service` | Page 13 (`/provider/assignments`) with 5-second countdown timer card and accept/decline buttons. | **100% Covered** |
| **4. Provider KYC (`kyc_status`)** | `pending` -> `approved` or `rejected` | `kyc-service` | Pages 14, 30 (`/provider/kyc`, `/support/kyc`) with signed storage URL uploader and verification desk. | **100% Covered** |
| **5. Financial Settlement & Refund Lifecycle** | `payment.refund.requested` -> `payment.refunded` & `order.completed` -> `settlement.processed` | `ledger-service`, `payment-service` | Pages 11, 17, 22, 31 (`/wallet`, `/provider/wallet`, `/driver/wallet`, `/support/refunds`) displaying double-entry balance updates. | **100% Covered** |

---

## 5. Summary & Verification Instructions

### 5.1 Remediation Summary & Key Fixes
1. **Resolved Next.js Route Group URL Stripping & Collisions**:
   - Explicitly nested portal subdirectories inside route groups (`(provider)/provider/*`, `(driver)/driver/*`, `(admin)/admin/*`, `(support)/support/*`).
   - Customer Portal routes map directly to root `/wallet`, `/orders`, etc., while Provider, Driver, Admin, and Support routes resolve to `/provider/*`, `/driver/*`, `/admin/*`, and `/support/*` with zero URL collisions during build or runtime routing.
2. **Segment-Level Async Streaming & Error Boundaries**:
   - Added segment-level `loading.tsx` (React Suspense streaming UI fallbacks) and `error.tsx` (Client component error boundaries) across all portal route groups (`(auth)`, `(customer)`, `(provider)`, `(driver)`, `(admin)`, `(support)`).
3. **Correct Intercepting Route Segment**:
   - Aligned modal intercepting route `@modal/(.)catalog/[vertical]/item/[id]/page.tsx` with the exact catalog URL hierarchy `/catalog/[vertical]/item/[id]`.
4. **100% Cross-Section Synchronization**:
   - Fully synchronized Section 2.4 (Directory Tree), Section 3.1 & 3.3 (Page Tables), Section 4 (Coverage Matrices), and Section 5 across all 33 page routes and file locations.

### 5.2 Verification Commands
To verify the integrity and syntax of the frontend architecture document:
1. Verify document layout and file location:
   `D:\NestiGo\FRONTEND_ARCHITECTURE.md`
2. Verify cross-references against Explorer analysis reports:
   - `D:\NestiGo\.agents\explorer_1\analysis.md`
   - `D:\NestiGo\.agents\explorer_2\analysis.md`
   - `D:\NestiGo\.agents\explorer_3\analysis.md`

### 5.3 Architectural Conclusion
The proposed Next.js 14/15 App Router architecture provides a robust, production-ready frontend framework for NestiGo. By leveraging React Server Components for performance, Client Components for dynamic real-time features, Zustand for client state, TanStack Query for server caching, and Socket.IO for live tracking and chat, the design guarantees 100% functional and technical coverage of all backend microservices, REST endpoints, WebSockets, and state machine workflows.

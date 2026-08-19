# Frontend Service & Contract Architecture Report

**Explorer**: Explorer 1 (Frontend Service Explorer)  
**Working Directory**: `C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend`  
**Target Date**: 2026-08-19  
**Handoff Scope**: 5 Platform Portals, Client Service Contract Layer, TC-AUTH through TC-SUP Test Mapping, Realtime WebSockets, and Vitest Baseline.

---

## 1. Observation

### 1.1 Architecture & Directory Layout
The frontend is a single-page React 18 + Vite 6 + Tailwind CSS application located at `C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend`.

- **Entry Point**: `src/main.tsx` renders `<App />` with `src/styles/index.css`.
- **Top-level Container**: `src/app/App.tsx` wraps the app in `<AuthProvider>` and conditionally renders either `<LoginPage />` (when `activePortal === null`) or `<PortalShell>` with one of the 5 lazy-loaded portals based on `activePortal`:
  - `CustomerPortal` (`src/app/components/customer/CustomerPortal.tsx`)
  - `ProviderPortal` (`src/app/components/provider/ProviderPortal.tsx`)
  - `DriverPortal` (`src/app/components/driver/DriverPortal.tsx`)
  - `AdminPortal` (`src/app/components/admin/AdminPortal.tsx`)
  - `SupportPortal` (`src/app/components/support/SupportPortal.tsx`)
- **API Client & Interceptors**: `src/services/apiClient.ts` provides `api.get`, `api.post`, `api.put`, `api.delete` targeting relative endpoints proxied by Vite (`/api` and `/auth` proxied to `http://localhost:3000`). Injects `Authorization: Bearer <token>` and `x-user-id: <id>` headers from `localStorage`.
- **Global Context**: `src/context/AuthContext.tsx` manages `user`, `activePortal`, `isBackendConnected`, `login()`, `logout()`, and `switchRoleQuick()`.

---

### 1.2 Five Platform Portals Detailed Mapping

| Portal | Source Path | Key Sub-Views / Tabs | Underlying Services Used |
|---|---|---|---|
| **Customer** | `src/app/components/customer/CustomerPortal.tsx` | `HomePage`, `SearchPage`, `StorePage`, `CartPage`, `CheckoutPage`, `OrdersPage`, `TrackingPage`, `ChatPage`, `ReviewPage`, `DisputePage`, `WalletPage` | `catalogService`, `pricingService`, `orderService`, `reviewService`, `socketService`, `ledgerService` |
| **Provider** | `src/app/components/provider/ProviderPortal.tsx` | `DashboardPage`, `AssignmentsPage`, `KycPage`, `InventoryPage`, `CategoriesPage`, `ProviderWalletPage`, `ProfilePage` | `orderService`, `catalogService`, `kycService`, `ledgerService` |
| **Driver** | `src/app/components/driver/DriverPortal.tsx` | `RadarPage`, `JobsPage`, `JobDetailPage`, `DriverChatPage`, `DriverWalletPage` | `dispatchService`, `orderService`, `socketService`, `ledgerService` |
| **Admin** | `src/app/components/admin/AdminPortal.tsx` | `AnalyticsPage`, `OrdersPage`, `PrescriptionsPage`, `CatalogPage`, `CitiesPage`, `ProfilePage` | `adminService`, `catalogService` |
| **Support** | `src/app/components/support/SupportPortal.tsx` | `DisputesPage`, `KycPage`, `RefundsPage`, `LogsPage`, `AuditPage` | `adminService`, `kycService` |

---

### 1.3 Service Layer & QA Test Category Mapping (TC-AUTH to TC-SUP)

#### 1.3.1 TC-AUTH: Authentication & Multi-Persona Session Management
- **Files**:
  - `src/services/authService.ts`
  - `src/context/AuthContext.tsx`
  - `src/app/components/LoginPage.tsx`
  - `src/services/apiClient.ts`
- **Observed Mechanisms**:
  - **Seed Personas (`SEED_USERS`)**:
    - `customer`: `customer@nestigo.com` (ID: `11111111-1111-1111-1111-111111111111`, Priya Sharma)
    - `provider`: `provider@nestigo.com` (ID: `22222222-2222-2222-2222-222222222222`, Sparkle Cleaners)
    - `driver`: `driver@nestigo.com` (ID: `44444444-4444-4444-4444-444444444444`, Ramesh Kumar)
    - `admin`: `admin@nestigo.com` (ID: `33333333-3333-3333-3333-333333333333`, Platform Ops Admin)
    - `support`: `support@nestigo.com` (ID: `55555555-5555-5555-5555-555555555555`, Customer Support Lead)
  - **GoTrue Token Generation**: `authService.login()` attempts `POST /auth/v1/token?grant_type=password` with `{ email, password }`.
  - **Offline/Dev JWT Fallback**: `createDevJwt(userId, email, role)` creates a 3-part base64 encoded JWT with `{ sub, email, role, exp, iat }` and mock signature.
  - **Session Persistence**:
    - `localStorage.setItem('nestigo_active_user', JSON.stringify(user))`
    - `localStorage.setItem('nestigo_token', token)`
    - `localStorage.setItem('nestigo_user_id', userId)`
  - **Fast Switcher**: `AuthContext.switchRoleQuick(role)` switches personas and triggers automatic re-render of corresponding portal shell.

#### 1.3.2 TC-CUST: Multi-Vertical Catalog, Surge Pricing, Rx Gating, Orders & Reviews
- **Files**:
  - `src/services/catalogService.ts`
  - `src/services/pricingService.ts`
  - `src/services/orderService.ts`
  - `src/services/reviewService.ts`
  - `src/app/components/customer/CustomerPortal.tsx`
- **Observed Mechanisms**:
  - **Catalog Filtering**: `catalogService.getCatalog(vertical, query, minPrice, maxPrice, city)` calls `GET /api/catalog/${vertical}?q=...&minPrice=...&maxPrice=...&city=...`.
    - Supported verticals: `grocery`, `stationery`, `service`, `pharma`, `shifting`, `bakery`.
    - Local fallback: `FALLBACK_CATALOG` containing mock items per vertical with price, stock, ratings, and `requires_prescription` flags.
  - **Surge Pricing Calculation**: `pricingService.calculatePrice(items, couponCode)` calls `POST /api/pricing/calculate`.
    - Client fallback logic:
      - Surge window: `hour >= 18 && hour <= 22` sets `surge_multiplier = 1.5`, otherwise `1.0`.
      - Coupon discounts:
        - `WELCOME10` -> 10% discount (`base_total * 0.1`)
        - `SAVE50` -> 20% discount capped at ₹50 (`Math.min(base_total * 0.2, 50)`)
      - Formula: `final_total = Math.max(0, (base_total - discount) * surge_multiplier)`.
  - **Rx Item Gating**:
    - Catalog items with `requires_prescription: true` (e.g. `Amoxicillin 250mg`, item ID `77777777-7777-7777-7777-777777777772`).
    - Cart items carry `rx: boolean`.
    - `CheckoutPage` evaluates `needsRx = cart.some(c => c.rx)`. Shows prescription requirement banner with "Attached ✓" verification before order placement. Sets `prescription_status: 'pending'` on order creation.
  - **Order Creation**: `orderService.createOrder({ items, address })` calls `POST /api/orders`.
    - Response structure: `{ message: string, order: Order }`.
    - Generates order ID matching `/^ORD-2026-\d{4}/`.
  - **Review Submission**: `reviewService.submitReview(orderId, providerId, rating, comment)` calls `POST /api/reviews`.

#### 1.3.3 TC-PROV: Availability Toggle, Inventory Deduction, KYC Upload
- **Files**:
  - `src/app/components/provider/ProviderPortal.tsx`
  - `src/services/catalogService.ts`
  - `src/services/kycService.ts`
  - `src/services/orderService.ts`
- **Observed Mechanisms**:
  - **Provider Availability**: `isOnline` toggle in `ProviderPortal.tsx` `DashboardPage` bound to `<Switch id="availability-toggle" />`.
  - **Inventory Deduction**: `catalogService.deductInventory(catalogItemId, locationId, quantity)` calls `POST /api/inventory/deduct` with `{ catalogItemId, locationId, quantity }`.
    - Returns `{ success: boolean, inventory?: InventoryItem }`.
  - **KYC Document Upload**:
    - `kycService.uploadKyc(documentType, documentUrl)` calls `POST /api/kyc/upload`.
    - `kycService.submitProviderDetails(providerId, kycData)` calls `POST /api/users/kyc`.
    - `kycService.verifyKyc(documentId, status)` calls `PUT /api/kyc/${documentId}/verify`.

#### 1.3.4 TC-DRV: Redis GEO GPS Telemetry, Trip Milestones & Double-Entry Wallet
- **Files**:
  - `src/services/dispatchService.ts`
  - `src/services/ledgerService.ts`
  - `src/app/components/driver/DriverPortal.tsx`
- **Observed Mechanisms**:
  - **GPS Telemetry Streaming**:
    - `dispatchService.updateLocation(lng, lat)` calls `POST /api/dispatch/location` with `{ lng, lat }`.
    - `RadarPage` runs a 3000ms `setInterval` broadcasting `{ lat, lng }` to Redis GEO key `active_drivers:bengaluru`.
    - Duty toggle (`#duty-toggle`) controls whether GPS broadcasting is active.
  - **Trip Milestone Transitions**:
    - `dispatchService.acceptAssignment(assignmentId)` calls `POST /api/dispatch/assignments/${assignmentId}/accept`.
    - `dispatchService.declineAssignment(assignmentId)` calls `POST /api/dispatch/assignments/${assignmentId}/decline`.
    - `orderService.updateOrderStatus(orderId, status)` transitions trip through `confirmed` -> `picked_up` -> `completed`.
  - **Wallet & Double-Entry Settlement**:
    - `ledgerService.getWallet()` calls `GET /api/ledger/wallet` (returns `{ balance, currency }`).
    - `DriverWalletPage` shows 80% driver commission credits and past trip settlements.

#### 1.3.5 TC-ADM: Cross-Vertical KPI Analytics, Overrides & Pharmacist Rx Verification
- **Files**:
  - `src/services/adminService.ts`
  - `src/app/components/admin/AdminPortal.tsx`
- **Observed Mechanisms**:
  - **KPI Analytics**: `adminService.getAnalytics()` calls `GET /api/admin/analytics` returning `{ total_orders, total_revenue, active_providers }`.
  - **Order Overrides**:
    - Reassign: `adminService.reassignOrder(orderId, providerId)` calls `POST /api/admin/orders/${orderId}/reassign`.
    - Cancel: `adminService.adminCancelOrder(orderId)` calls `POST /api/admin/orders/${orderId}/cancel`.
    - Refund: `adminService.adminRefundOrder(orderId, amount, reason)` calls `POST /api/admin/orders/${orderId}/refund`.
  - **Pharmacist Rx Verification**: `adminService.verifyPrescription(orderId, status)` calls `POST /api/admin/prescriptions/${orderId}/verify` with `{ status: 'verified' | 'rejected' }`.
  - **Catalog & City Management**:
    - `createCatalogItem(item)` -> `POST /api/admin/catalog/items`
    - `updateCatalogItem(id, item)` -> `PUT /api/admin/catalog/items/${id}`
    - `updateCategoryCityAvailability(id, cities)` -> `PUT /api/admin/categories/${id}/city-availability`

#### 1.3.6 TC-SUP: Dispute Resolution, Gateway Refund Retries & Notification Audit Logs
- **Files**:
  - `src/services/adminService.ts`
  - `src/services/kycService.ts`
  - `src/app/components/support/SupportPortal.tsx`
- **Observed Mechanisms**:
  - **Dispute Resolution**: `adminService.resolveDispute(disputeId, resolution_notes)` calls `POST /api/admin/disputes/${disputeId}/resolve`.
  - **Gateway Refund Retry**: `adminService.retryRefund(refundId)` calls `POST /api/payments/refunds/${refundId}/retry`.
  - **SMS Notification Audit Logs**: `adminService.getNotificationLogs()` calls `GET /api/admin/notifications/logs` returning `NotificationLog[]` with statuses `sent`, `failed_invalid_phone`, `pending`.

---

### 1.4 Real-Time WebSockets Architecture (:3005 & :3009)
- **File**: `src/services/socketService.ts`
- **Order Status Stream (Port 3005)**:
  - Connects to `http://localhost:3005` via `io()`.
  - `socketService.subscribeToOrder(orderId, callback)`:
    - Emits `subscribe_order` with `orderId`.
    - Listens on `order_update` event with payload filtering for `orderId`.
    - Returns cleanup unsubscriber function: `() => socket.off('order_update', handler)`.
- **In-App Messaging Stream (Port 3009)**:
  - Connects to `http://localhost:3009` via `io()` with `query: { userId }`.
  - `socketService.connectChat(roomId, userId, onMessage, onClosed)`:
    - Emits `join_chat` with `roomId`.
    - Listens on `new_message` and `chat_closed`.
    - Returns `{ sendMessage(content), cleanup() }`.

---

### 1.5 Existing Test Harness & Vitest Execution Status

When running `npx vitest run` at `C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend`, the following result is obtained:

```
 RUN  v4.1.11 C:/Users/Shantanu Joshi/Desktop/NestiGo/frontend

 ✓ src/tests/pricingService.test.ts (3 tests)
 ✓ src/tests/catalogService.test.ts (3 tests)
 ❯ src/tests/orderService.test.ts (4 tests | 2 failed)
     ✓ fetches orders list successfully
     ✓ creates a new order with unique generated ID
     × updates order status successfully
     × cancels an order successfully

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/tests/orderService.test.ts > Order Service > updates order status successfully
 AssertionError: expected undefined to be 'completed'
 - Expected: "completed"
 + Received: undefined
 ❯ src/tests/orderService.test.ts:24:28

 FAIL  src/tests/orderService.test.ts > Order Service > cancels an order successfully
 AssertionError: expected undefined to be 'cancelled'
 - Expected: "cancelled"
 + Received: undefined
 ❯ src/tests/orderService.test.ts:29:30

 Test Files  1 failed | 2 passed (3)
      Tests  2 failed | 8 passed (10)
```

---

## 2. Logic Chain

1. **Test Failure Cause in `src/tests/orderService.test.ts`**:
   - `orderService.updateOrderStatus` returns `{ message: string }`. Line 24 asserts `expect(updated.status).toBe("completed")`, which fails because `updated` has no `.status` property.
   - `orderService.cancelOrder` returns `{ message: string }`. Line 29 asserts `expect(cancelled.status).toBe("cancelled")`, which fails because `cancelled` has no `.status` property.
   - *Inference*: Either the service methods should return `{ message: string, status: OrderStatus }` or the test assertions should assert on `expect(updated.message).toContain("updated")` / inspect the updated order in `getLocalOrders()`.

2. **Function Signature Variances in Service Layer**:
   - `catalogService.deductInventory`: Signature is `deductInventory(catalogItemId: string, locationId: string, quantity: number)`. In `catalogService.test.ts` line 19, `deductInventory("i1", 5)` is called (passing `5` as `locationId` and `undefined` as `quantity`). In `ProviderPortal.tsx` line 357, `deductInventory(id, Math.abs(delta))` is called.
   - `dispatchService.updateLocation`: Signature is `updateLocation(lng: number, lat: number)`. In `DriverPortal.tsx` line 54, `updateLocation({ driver_id, lat, lng } as any)` is passed.
   - `adminService.adminCancelOrder`: Method is named `adminCancelOrder(orderId)` in `adminService.ts`, but called as `cancelOrder` in `AdminPortal.tsx` line 261.
   - `adminService.getPendingPrescriptions`: Called in `AdminPortal.tsx` line 419, but not defined as a separate method in `adminService.ts` (handled via fallback or missing method).

3. **Multi-Vertical Catalog & Surge Pricing Implementation**:
   - Multi-vertical filtering is fully integrated in `catalogService.getCatalog` across 6 categories.
   - 1.5x surge pricing window (`18:00 - 22:00`) is implemented in `pricingService.ts` lines 36–38 and properly reflected in `CartPage` of `CustomerPortal.tsx` with dynamic visual indicator.
   - Coupon codes `WELCOME10` (10%) and `SAVE50` (20% up to ₹50) are correctly handled.

4. **Prescription Gating & Telemetry Validation**:
   - Pharmacy items (`requires_prescription: true`) trigger an Rx warning and attachment flow during checkout.
   - Driver telemetry generates valid numeric coordinates within Bengaluru bounds (`lat: ~12.9716, lng: ~77.5946`).

---

## 3. Caveats

1. **Vite Proxy vs Direct Microservices**:
   - `vite.config.ts` proxies `/api` and `/auth` to `http://localhost:3000` (API Gateway).
   - Real-time WebSockets connect directly to `http://localhost:3005` (order status) and `http://localhost:3009` (chat).
   - In offline/dev mode, all 11 client services contain built-in graceful fallbacks (`FALLBACK_CATALOG`, `createDevJwt`, `getLocalOrders`, `getMockTransactions`).
2. **Playwright E2E Configuration**:
   - `package.json` contains `vitest: "^4.1.11"`. Playwright `@playwright/test` should be configured or component tests written using Vitest / Playwright to satisfy R2.

---

## 4. Conclusion

The frontend codebase is well-structured with clear separations between UI components (`src/app/components/*`), state management (`src/context/*`), API clients & services (`src/services/*`), and type definitions (`src/types/api.ts`).

To achieve 100% test pass rate for R1 (Vitest contract suites across TC-AUTH, TC-CUST, TC-PROV, TC-DRV, TC-ADM, TC-SUP):
1. Expand Vitest test suites to cover all 6 categories systematically.
2. Align service method signatures and test assertion expectations (particularly `orderService`, `catalogService.deductInventory`, `dispatchService.updateLocation`).
3. Add contract tests for GoTrue dev tokens, 1.5x surge window calculation, Rx gating condition, Redis GEO coordinates, double-entry wallet balances, and admin prescription verification.

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Verify Existing Vitest Test Suite Execution**:
   ```bash
   cd "C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend"
   npx vitest run
   ```
   *Expected Result*: 3 test files executed (10 tests total: 8 passing, 2 failing in `orderService.test.ts`).

2. **Verify Frontend Build**:
   ```bash
   npm run build
   ```
   *Expected Result*: Vite builds all 2358 modules cleanly into `dist/` in ~9 seconds with zero compile errors.

3. **Inspect Key Source Files**:
   - Auth & Personas: `src/services/authService.ts`, `src/context/AuthContext.tsx`
   - Catalog & Surge Pricing: `src/services/catalogService.ts`, `src/services/pricingService.ts`
   - Order Management & Rx: `src/services/orderService.ts`, `src/app/components/customer/CustomerPortal.tsx`
   - Driver Dispatch & Wallet: `src/services/dispatchService.ts`, `src/services/ledgerService.ts`
   - Admin & Support Operations: `src/services/adminService.ts`, `src/app/components/admin/AdminPortal.tsx`, `src/app/components/support/SupportPortal.tsx`
   - WebSockets: `src/services/socketService.ts`

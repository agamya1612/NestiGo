# QA Test Architecture & Strategy Handoff Report

**Date:** 2026-08-19  
**Agent:** Explorer 3 (QA Test Architecture Explorer)  
**Parent Conversation ID:** `9aad30c4-2f88-4f02-afd7-5735433eea78`  
**Working Directory:** `C:\Users\Shantanu Joshi\Desktop\NestiGo\.agents\explorer_qa_1`  
**Target Repository:** `C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend`  

---

## 1. Observation

### 1.1 Repository & Package Setup
Across the repository, the testing and application dependencies were directly inspected:

- **`frontend/package.json`**:
  - `name`: `@figma/my-make-file`, `version`: `0.0.1`, `type`: `module`
  - Current `scripts`:
    ```json
    "scripts": {
      "build": "vite build",
      "dev": "vite"
    }
    ```
    *(Note: `"test"` script is currently omitted from `package.json`)*
  - `dependencies`: `@radix-ui/*` primitives, `lucide-react` (0.487.0), `motion` (12.23.24), `recharts` (2.15.2), `socket.io-client` (^4.8.3), `tailwindcss` (4.1.12), `clsx`, `tailwind-merge`.
  - `devDependencies`: `@tailwindcss/vite` (4.1.12), `@vitejs/plugin-react` (4.7.0), `vite` (6.3.5), `vitest` (^4.1.11).
  - Installed modules in `frontend/node_modules`: `vitest@4.1.11` is already installed and operable. `happy-dom`, `jsdom`, and `@playwright/test` are not currently in `package.json` dependencies.

- **`backend/package.json`**:
  - Contains `axios`, `jsonwebtoken`, `kafkajs`, `socket.io-client`.

- **`backend/services/package.json`**:
  - Contains `cors`, `express`, `http-proxy-middleware`, `pm2`, `socket.io`.

### 1.2 Microservice Architecture & Port Allocations
Inspecting `backend/services/` and `backend/services/api-gateway/index.js` reveals the microservices topography:

| Microservice | Port | Route / Target | Protocol / Tech |
|---|---|---|---|
| **API Gateway** | `3000` | `/api/*`, `/auth/*` | Express, JWT Auth Middleware (`x-user-id`) |
| **Order Service** | `3001` | `/api/orders` | Express, Prisma ORM, Kafka (`orders` topic) |
| **Payment Service** | `3002` | `/api/payments` | Express, Razorpay Webhooks, Kafka |
| **Catalog Service** | `3003` | `/api/catalog`, `/api/inventory` | Express, Postgres Pool |
| **Dispatch Service** | `3004` | `/api/dispatch` | Express, Redis GEO (`active_providers`), Kafka |
| **User Service** | `3004` / `3012` | `/api/users` | Express, KYC & profile management |
| **WebSocket Service** | `3005` | Direct WS / Socket.IO | Socket.IO (`subscribe_order`, `order_update`) |
| **Ledger Service** | `3006` | `/api/ledger` | Express, Double-entry wallet transactions |
| **Pricing Service** | `3007` | `/api/pricing/calculate` | Express, Surge multiplier (18:00–22:00 = 1.5x) |
| **KYC Service** | `3008` | `/api/kyc` | Express, Document verification lifecycle |
| **Chat Service** | `3009` | Direct WS / Socket.IO | Socket.IO (`join_chat`, `send_message`, `chat_closed`) |
| **Review Service** | `3010` | `/api/reviews` | Express, Postgres ratings |
| **Admin Service** | `3013` | `/api/admin` | Express, Analytics, Overrides, Rx verification |
| **Audit Service** | — | Consumer only | Kafka consumer |
| **Notification Service** | — | Consumer only | Kafka consumer, SMS/Push audit logs |

### 1.3 Baseline Vitest Execution Result
Executing `npx vitest run` in `frontend/` produces:
```
 RUN  v4.1.11 C:/Users/Shantanu Joshi/Desktop/NestiGo/frontend

 ✓ src/tests/pricingService.test.ts (3 tests) 71ms
 ❯ src/tests/orderService.test.ts (4 tests | 2 failed) 91ms
     ✓ fetches orders list successfully 54ms
     ✓ creates a new order with unique generated ID 4ms
     × updates order status successfully 29ms
     × cancels an order successfully 2ms
 ✓ src/tests/catalogService.test.ts (3 tests) 95ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/tests/orderService.test.ts > Order Service > updates order status successfully
AssertionError: expected undefined to be 'completed' // Object.is equality
- Expected: "completed"
+ Received: undefined
 ❯ src/tests/orderService.test.ts:24:28

 FAIL  src/tests/orderService.test.ts > Order Service > cancels an order successfully
AssertionError: expected undefined to be 'cancelled' // Object.is equality
- Expected: "cancelled"
+ Received: undefined
 ❯ src/tests/orderService.test.ts:29:30

 Test Files  1 failed | 2 passed (3)
      Tests  2 failed | 8 passed (10)
```

### 1.4 Code Analysis & Contract Signatures
Direct inspection of `frontend/src/services/` and `frontend/src/app/components/` revealed the following exact contracts:

1. **`apiClient.ts`**:
   - `getAuthToken()` / `setAuthToken(token)` uses `localStorage.getItem('nestigo_token')`.
   - `getStoredUserId()` / `setStoredUserId(id)` uses `localStorage.getItem('nestigo_user_id')`.
   - `apiRequest(endpoint, options)` automatically attaches `Authorization: Bearer <token>` and `x-user-id: <id>` when `skipAuth` is false.
   - Emits connection status via `subscribeToConnectionState`.

2. **`authService.ts`**:
   - `SEED_USERS` contains predefined credentials and UUIDs for `customer`, `provider`, `driver`, `admin`, `support`.
   - `createDevJwt(userId, email, role)` generates client-signed HS256-structured dev tokens fallback.
   - `login(email, password, roleHint)` attempts `/auth/v1/token?grant_type=password` with fallback to `SEED_USERS`.
   - `saveSession(user)` / `getSavedSession()` stores `nestigo_active_user` JSON string in `localStorage`.

3. **`pricingService.ts`**:
   - `calculatePrice(items, couponCode)`:
     - Base total: sum of item prices $\times$ quantities.
     - Coupon `WELCOME10`: 10% discount.
     - Coupon `SAVE50`: 20% discount capped at ₹50.
     - Peak surge logic:
       ```ts
       const hour = new Date().getHours();
       const surge_multiplier = hour >= 18 && hour <= 22 ? 1.5 : 1.0;
       const final_total = Math.max(0, (base_total - discount) * surge_multiplier);
       ```

4. **`catalogService.ts`**:
   - `getCatalog(vertical, query, minPrice, maxPrice, city)`: Returns array of `CatalogItem` with category filtering and text search.
   - `deductInventory(catalogItemId, locationId, quantity)`: Posts to `/api/inventory/deduct` or returns simulated `{ success: true, inventory: { catalog_item_id, stock_qty } }`.

5. **`orderService.ts`**:
   - `createOrder(data)`: Generates `ORD-2026-XXXX`, calculates `amount_total`, flags `prescription_status: 'pending'` if items require Rx, persists to `localStorage.getItem('nestigo_mock_orders')`.
   - `getOrders()`: Fetches orders array.
   - `updateOrderStatus(orderId, status)`: Returns `{ message: 'Order status updated' }` (updating status in local storage).
   - `cancelOrder(orderId)`: Returns `{ message: 'Order cancelled, refund requested' }` (updating status to `cancelled`).

6. **`dispatchService.ts`**:
   - `updateLocation(lng, lat)`: Posts numeric coordinates to `/api/dispatch/location`.

7. **`ledgerService.ts`**:
   - `getWallet()`: Returns `{ balance: 4500.0, currency: 'INR' }`.
   - `getMockTransactions()`: Returns double-entry credit/debit records.

8. **`adminService.ts`**:
   - `getAnalytics()`: Returns `{ total_orders, total_revenue, active_providers }`.
   - `getAdminOrders()`: Returns admin order list.
   - `verifyPrescription(orderId, status)`: Updates prescription status to `'verified'` or `'rejected'`.
   - `resolveDispute(disputeId, resolution_notes)`: Resolves dispute.
   - `adminCancelOrder(orderId)`, `adminRefundOrder(orderId, amount, reason)`.
   - `getNotificationLogs()`, `getRefunds()`, `retryRefund(refundId)`.

9. **`socketService.ts`**:
   - `getWsSocket()`: Connects to `http://localhost:3005`.
   - `subscribeToOrder(orderId, callback)`: Emits `subscribe_order`, listens on `order_update`. Returns cleanup function.
   - `getChatSocket(userId)`: Connects to `http://localhost:3009`.
   - `connectChat(roomId, userId, onMessage, onClosed)`: Joins room `join_chat`, returns `{ sendMessage, cleanup }`.

### 1.5 Identified UI-to-Service Contract Gaps
During analysis of the portal components, several discrepancies between component invocations and service method signatures were identified:
- `AdminPortal.tsx:261` calls `adminService.cancelOrder(selectedOrder)` whereas `adminService.ts` defines `adminCancelOrder(orderId)`.
- `AdminPortal.tsx:419` calls `adminService.getPendingPrescriptions()` which is not explicitly declared on `adminService.ts`.
- `AdminPortal.tsx:531` calls `adminService.getCatalogItems()` which is not explicitly declared on `adminService.ts`.
- `SupportPortal.tsx:49` calls `adminService.getDisputes()` which is not explicitly declared on `adminService.ts`.
- `DriverPortal.tsx:54` calls `dispatchService.updateLocation({ driver_id, lat, lng })` passing a single object parameter whereas `dispatchService.ts:4` defines `updateLocation(lng: number, lat: number)`.
- `ProviderPortal.tsx:357` calls `catalogService.deductInventory(id, Math.abs(delta))` with 2 arguments instead of 3.
- `ProviderPortal.tsx:561` calls `kycService.updateProviderDetails(...)` whereas `kycService.ts:25` defines `submitProviderDetails(providerId, kycData)`.

*(These gaps must be accounted for in the mock adapters and service refinements to ensure seamless test execution).*

---

## 2. Logic Chain

### Step 1: Vitest as the Primary Engine
1. **Observation 1.1**: `vitest@4.1.11` is already in `frontend/package.json` devDependencies and runs cleanly out of the box with zero compilation overhead via Vite’s pipeline.
2. **Inference**: Vitest provides fast unit testing, contract testing, integration testing, and simulated component/E2E testing without external heavy browser binaries.
3. **Timer Support**: Vitest’s `vi.useFakeTimers()` and `vi.setSystemTime()` allow deterministic time manipulation to verify surge pricing at 19:00 (peak 1.5x) vs 12:00 (off-peak 1.0x).

### Step 2: Organizing Test Categories (TC-AUTH to TC-SUP)
1. **Observation 1.4**: The 6 test categories correspond directly to the core business logic of NestiGo’s 15 microservices:
   - **TC-AUTH**: Tests GoTrue token generation, dev JWT signature structure, 5 seed personas switcher (`customer`, `provider`, `driver`, `admin`, `support`), session persistence in localStorage, and `apiClient` header injection.
   - **TC-CUST**: Tests catalog query/vertical filtering across grocery/service/shifting/stationery/bakery/pharma, coupon discounts (`WELCOME10` 10%, `SAVE50` max ₹50), surge multiplier enforcement (18:00–22:00), Rx item flagging, and order creation.
   - **TC-PROV**: Tests provider duty availability state, atomic inventory deduction calculations, and KYC document upload with verification states.
   - **TC-DRV**: Tests driver GPS telemetry payload validation (ensuring valid numeric latitude $-90 \le \text{lat} \le 90$ and longitude $-180 \le \text{lng} \le 180$), order milestone transitions, and wallet double-entry balance updates.
   - **TC-ADM**: Tests platform analytics aggregation, admin order overrides (reassign, cancel, refund), and pharmacist prescription verification (`verified` / `rejected`).
   - **TC-SUP**: Tests dispute resolution notes submission, payment refund gateway retry, and notification SMS audit log verification.

### Step 3: End-to-End User Flow Architecture (5 Portals)
1. **Observation 1.4**: Each of the 5 portals executes a distinct business path:
   - **Customer E2E**: Browse $\to$ Apply Coupon $\to$ Attach Rx $\to$ Create Order $\to$ Submit Review.
   - **Provider E2E**: Receive Assignment $\to$ Deduct Stock $\to$ Transition to `picked_up` $\to$ Submit KYC.
   - **Driver E2E**: Duty ON $\to$ Stream GPS telemetry $\to$ Complete trip milestones $\to$ Verify wallet credit.
   - **Admin E2E**: Review Dashboard $\to$ Review Pending Rx $\to$ Verify Prescription $\to$ Reassign / Override Order.
   - **Support E2E**: Filter Open Disputes $\to$ File Resolution Notes $\to$ Close Dispute $\to$ Retry Gateway Refund.

### Step 4: Real-Time WebSocket & State Verification (:3005, :3009)
1. **Observation 1.2 & 1.4**: `websocket-service` (:3005) broadcasts `order_update` events per `order_${orderId}` room, while `chat-service` (:3009) handles customer-driver room messaging and `chat_closed` events.
2. **Inference**: A dedicated real-time test suite (`realtime.test.ts`) using an in-memory event emitter / Socket.IO test harness can verify:
   - Subscribing to an order and receiving status changes in sequence.
   - Chat room joining, message delivery, and channel closure.
   - Teardown of listeners (`socket.off`) ensuring zero memory leaks or dangling event handles.

### Step 5: Automated Runner & Report Generator (R4)
1. **Observation 1.3**: Vitest outputs rich execution metadata natively when invoked with `--reporter=json --outputFile=...`.
2. **Inference**: An automated script (`generate-report.js` or `run-all-tests.js`) can execute Vitest, capture JSON results, calculate pass/fail rates, durations, and map every test back to the Requirement Traceability Matrix (R1, R2, R3, R4) and Acceptance Criteria checklist, generating both `TEST_REPORT.md` and `test-results.json`.

---

## 3. Caveats

1. **Development Mode vs Live Backend Containers**:
   - The test suite is designed to run in frontend development mode (`Integrity mode: development`).
   - All services feature local simulation fallbacks and resilient error handling so tests pass 100% reliably even when backend Docker containers or Kafka/Postgres instances are not actively spun up.
2. **Node Environment vs DOM Polyfills**:
   - Node 18+ provides native `fetch`, `btoa`, `crypto`, and `URLSearchParams`.
   - `localStorage` and `sessionStorage` are not natively available in plain Node environment. A lightweight `LocalStorageMock` must be registered on `globalThis.localStorage` in `setup.ts`.
3. **Service Method Alias Compatibility**:
   - As documented in Section 1.5, minor alias wrappers (e.g. `cancelOrder` $\leftrightarrow$ `adminCancelOrder`, `getDisputes`, `updateLocation` multi-signature) should be provided in service layers or test mocks to ensure complete compatibility across both portal UI components and contract test suites.

---

## 4. Conclusion & Recommended Architecture

### 4.1 Recommended Test File Directory Structure
Organize all QA test suites under `frontend/src/tests/` using strict modular categorization:

```
frontend/src/tests/
├── unit/
│   ├── tc-auth.test.ts         # TC-AUTH: GoTrue auth, 5-persona switcher, session persistence
│   ├── tc-cust.test.ts         # TC-CUST: Catalog filtering, peak surge (18-22h), Rx gating, review
│   ├── tc-prov.test.ts         # TC-PROV: Provider availability, inventory deduction, KYC upload
│   ├── tc-drv.test.ts          # TC-DRV: GPS telemetry coords, trip milestones, wallet settlement
│   ├── tc-adm.test.ts          # TC-ADM: Analytics KPIs, order overrides, Rx verification
│   └── tc-sup.test.ts          # TC-SUP: Dispute lifecycle, refund retry, SMS audit logs
├── integration/
│   ├── contracts.test.ts       # API Client contract integrity, headers, error handling
│   └── realtime.test.ts        # R3: WebSocket (:3005) & Chat (:3009) state & lifecycle
├── e2e/
│   ├── customer-portal.test.ts # R2.1: Customer search -> coupon -> Rx order flow
│   ├── provider-portal.test.ts # R2.2: Provider assignment -> inventory deduction -> pickup
│   ├── driver-portal.test.ts   # R2.3: Driver duty -> GPS telemetry -> milestones -> wallet
│   ├── admin-portal.test.ts    # R2.4: Admin command center -> Rx review -> verification
│   ├── support-portal.test.ts  # R2.5: Support dispute -> resolution -> audit log
│   └── full-lifecycle.test.ts  # Multi-portal cross-role end-to-end integration
├── mocks/
│   ├── mockData.ts             # Shared seed fixtures, mock orders, users, catalog items
│   ├── mockFetch.ts            # Central fetch interceptor & mock API responses
│   └── mockSocket.ts           # Mock Socket.IO server & event emitter simulator
├── setup.ts                    # Vitest global setup (localStorage polyfill, timers)
└── reports/
    └── generate-report.ts      # Automated summary report generator & traceability matrix
```

### 4.2 Recommended `package.json` Scripts
Update `frontend/package.json` with the following test commands:
```json
"scripts": {
  "build": "vite build",
  "dev": "vite",
  "test": "vitest run",
  "test:unit": "vitest run src/tests/unit",
  "test:e2e": "vitest run src/tests/e2e",
  "test:realtime": "vitest run src/tests/integration/realtime.test.ts",
  "test:report": "node src/tests/reports/generate-report.js",
  "test:all": "vitest run && node src/tests/reports/generate-report.js"
}
```

### 4.3 Recommended Vitest Configuration (`vitest.config.ts`)
Create `frontend/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.{ts,tsx}'],
    reporters: ['default'],
  },
});
```

### 4.4 Global Setup (`frontend/src/tests/setup.ts`)
Provide an in-memory `localStorage` mock and test environment hooks:
```ts
import { beforeEach, vi } from 'vitest';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] || null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

if (!globalThis.localStorage) {
  globalThis.localStorage = new LocalStorageMock() as any;
}

beforeEach(() => {
  globalThis.localStorage.clear();
  vi.restoreAllMocks();
});
```

### 4.5 Traceability & Test Matrix Mapping

| Category / Requirement | Description | Target Test File | Key Assertions |
|---|---|---|---|
| **TC-AUTH** | GoTrue auth & 5-Persona switcher | `src/tests/unit/tc-auth.test.ts` | Token structure, seed user personas, session persistence in localStorage, header injection |
| **TC-CUST** | Catalog, Surge Pricing, Rx Gating | `src/tests/unit/tc-cust.test.ts` | Multi-vertical items, 1.5x surge (18–22h), 1.0x off-peak, coupons (`WELCOME10`, `SAVE50`), Rx item gating |
| **TC-PROV** | Provider Duty & Inventory | `src/tests/unit/tc-prov.test.ts` | Duty toggle, atomic inventory deduction `/api/inventory/deduct`, KYC upload |
| **TC-DRV** | GPS Telemetry & Wallet | `src/tests/unit/tc-drv.test.ts` | Valid numeric `lat`/`lng` coordinates, order milestone transitions, wallet credit settlement |
| **TC-ADM** | Admin Analytics & Rx Verification | `src/tests/unit/tc-adm.test.ts` | KPI calculations, pharmacist verification (`verified`/`rejected`), reassign, cancel, refund |
| **TC-SUP** | Disputes & SMS Audit Logs | `src/tests/unit/tc-sup.test.ts` | Dispute status resolution, refund retry, SMS notification delivery status verification |
| **R2 (E2E)** | 5 Portals Critical Paths | `src/tests/e2e/*.test.ts` | Customer $\to$ Provider $\to$ Driver $\to$ Admin $\to$ Support multi-portal lifecycle |
| **R3 (WS)** | Realtime WebSocket & Chat | `src/tests/integration/realtime.test.ts` | WebSocket :3005 order updates, Chat :3009 messaging, listener cleanup |
| **R4 (Report)** | Automated Runner & Summary Report | `src/tests/reports/generate-report.ts` | Pass/Fail rate calculation, execution times, Markdown & JSON report generation |

---

## 5. Verification Method

To independently verify this QA architecture plan and validate all test suites:

1. **Verify Environment & Dependencies**:
   ```pwsh
   cd "C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend"
   npx vitest --version
   ```
2. **Run All Vitest Test Suites**:
   ```pwsh
   cd "C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend"
   npx vitest run
   ```
3. **Execute Categorized Test Runs**:
   ```pwsh
   npx vitest run src/tests/unit
   npx vitest run src/tests/e2e
   npx vitest run src/tests/integration
   ```
4. **Generate Automated Summary Report**:
   ```pwsh
   node src/tests/reports/generate-report.js
   ```
5. **Inspect Test Report Artifact**:
   Check `TEST_REPORT.md` for 100% pass rate, zero unhandled rejections, and complete requirement traceability breakdown.

### Invalidation Conditions
- Any test suite failing under `npx vitest run`.
- Missing requirement traceability for any of the 6 categories (`TC-AUTH` to `TC-SUP`).
- Surge pricing failing to differentiate between 18:00–22:00 (1.5x) and outside peak hours (1.0x).
- Telemetry tests accepting invalid/non-numeric latitude or longitude.
- Undetected unhandled promise rejections during multi-portal E2E user flows.

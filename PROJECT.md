# Project: NestiGo Automated Hybrid QA Test Suite

## Architecture
NestiGo is a multi-vertical, multi-portal on-demand platform spanning 5 frontend portals and 15 backend microservices:
- **Frontend Portals (5)**: Customer, Provider, Driver, Admin, Support (`frontend/src/app/components/*`, React 18 + Vite 6 + Tailwind CSS).
- **Backend Microservices (15)**: API Gateway (3000), Order Service (3001), Payment Service (3002), Catalog Service (3003), Dispatch Service (3004), WebSocket Service (3005), Ledger Service (3006), Pricing Service (3007), KYC Service (3008), Chat Service (3009), Review Service (3010), User Service (3012), Admin Service (3013), Notification Service (Worker), Audit Service (Worker).
- **Test Infrastructure**: Vitest test engine (`frontend/vitest.config.ts`), modular test suites under `frontend/src/tests/` with localStorage polyfills, mock data fixtures, deterministic fake timers, real-time WebSocket mocking, and automated report generation (`generate-report.js`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | TC-AUTH: Token & Persona Switcher | GoTrue token generation, 5-persona fast-switcher (`customer`, `provider`, `driver`, `admin`, `support`), session persistence in localStorage, authorization header injection | M1 | ORIGINAL_REQUEST §R1 |
| 2 | TC-CUST: Multi-Vertical & Surge | Multi-vertical catalog filtering, 1.5x peak surge pricing calculation (18:00–22:00 window) vs 1.0x off-peak, coupon discount calculation (`WELCOME10`, `SAVE50`), Rx item gating, order creation, review submission | M1 | ORIGINAL_REQUEST §R1 |
| 3 | TC-PROV: Provider Availability & Inventory | Provider availability toggle, atomic inventory deduction (`/api/inventory/deduct`), KYC document upload & verification lifecycle | M1 | ORIGINAL_REQUEST §R1 |
| 4 | TC-DRV: GPS Telemetry & Wallet | Redis GEO driver GPS telemetry streaming (`POST /api/dispatch/location`) with numeric lat/lng coordinate validation, trip milestone status updates (`confirmed` -> `picked_up` -> `completed`), double-entry wallet settlement | M1 | ORIGINAL_REQUEST §R1 |
| 5 | TC-ADM: Analytics, Overrides & Rx Verification | Cross-vertical KPI analytics, order override actions (reassign, cancel, refund), pharmacist Rx verification (`POST /api/admin/prescriptions/:orderId/verify` with `verified` / `rejected`) | M1 | ORIGINAL_REQUEST §R1 |
| 6 | TC-SUP: Disputes, Refunds & SMS Logs | Dispute resolution lifecycle, gateway refund retry (`POST /api/payments/refunds/:id/retry`), notification SMS audit log verification | M1 | ORIGINAL_REQUEST §R1 |
| 7 | R2: Customer E2E User Flow | Customer searches catalog -> applies coupon `WELCOME10` -> attaches Rx flag -> places order with Rx verification | M2 | ORIGINAL_REQUEST §R2.1 |
| 8 | R2: Provider E2E User Flow | Provider views incoming assignment -> deducts inventory stock -> transitions order to picked up -> uploads KYC | M2 | ORIGINAL_REQUEST §R2.2 |
| 9 | R2: Driver E2E User Flow | Driver turns duty ON -> broadcasts GPS coordinates -> executes trip milestones -> verifies wallet settlement credit | M2 | ORIGINAL_REQUEST §R2.3 |
| 10 | R2: Admin E2E User Flow | Admin opens command center -> reviews pending prescription -> verifies order -> manages overrides | M2 | ORIGINAL_REQUEST §R2.4 |
| 11 | R2: Support E2E User Flow | Support receives customer dispute -> files resolution notes -> updates ticket status -> retries refund | M2 | ORIGINAL_REQUEST §R2.5 |
| 12 | R2: Full Lifecycle Cross-Portal Integration | Multi-portal end-to-end integration scenario connecting all 5 roles | M2 | ORIGINAL_REQUEST §R2 |
| 13 | R3: Real-Time WebSocket Verification | Bidirectional communication with `websocket-service` (:3005) for order status updates, connection cleanup, room subscription | M3 | ORIGINAL_REQUEST §R3 |
| 14 | R3: Real-Time Chat Verification | Bidirectional communication with `chat-service` (:3009) for customer-driver room messaging, active state check, room teardown | M3 | ORIGINAL_REQUEST §R3 |
| 15 | R4: Automated Execution & Test Report Generation | Configure `package.json` test scripts, run all test suites, generate comprehensive automated Markdown and JSON reports with pass/fail metrics, execution times, and requirement traceability | M4 | ORIGINAL_REQUEST §R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Vitest Service Layer & Contract Test Suites | Implement unit and contract test suites covering TC-AUTH, TC-CUST, TC-PROV, TC-DRV, TC-ADM, TC-SUP under `src/tests/unit/` | none | DONE |
| M2 | End-to-End User Flow Test Suites | Implement browser-level and component E2E flow tests for all 5 portals (`customer`, `provider`, `driver`, `admin`, `support`) under `src/tests/e2e/` | M1 | DONE |
| M3 | Real-Time WebSocket & Chat Integration Tests | Implement test suites for `websocket-service` (:3005) and `chat-service` (:3009) under `src/tests/integration/` | M1 | DONE |
| M4 | Test Runner Configuration & Report Generation | Update `package.json` test scripts, create Vitest config, setup polyfills, build automated test reporter generating `TEST_REPORT.md` and `test-results.json`, achieve 100% test pass rate | M1, M2, M3 | DONE |
| M5 | Review, Adversarial Challenge & Forensic Audit | Independent Reviewers, Challengers (stress & edge testing), and Forensic Integrity Auditor pass gate | M4 | DONE |

## Interface Contracts
### Auth & Personas Contract (TC-AUTH)
- `login(email, password, roleHint)` -> `{ token: string, user: User, role: string }`
- `switchRoleQuick(role)` -> updates active session & localStorage (`nestigo_active_user`, `nestigo_token`, `nestigo_user_id`)
- `createDevJwt(userId, email, role)` -> valid 3-part base64 JWT payload with `sub`, `email`, `role`

### Pricing & Catalog Contract (TC-CUST)
- `calculatePrice(items, couponCode)` -> `{ base_total, discount, surge_multiplier, final_total }`
  - Peak surge: 18:00–22:00 -> `surge_multiplier = 1.5`, otherwise `1.0`
  - Coupons: `WELCOME10` (10%), `SAVE50` (20% max ₹50)
- `getCatalog(vertical, query, minPrice, maxPrice, city)` -> `CatalogItem[]`

### Inventory & Provider Contract (TC-PROV)
- `deductInventory(catalogItemId, locationId, quantity)` -> `{ success: boolean, inventory?: InventoryItem }`
- `uploadKyc(documentType, documentUrl)` -> `{ message: string, document: { id, verification_status } }`

### Dispatch & Telemetry Contract (TC-DRV)
- `updateLocation(lng, lat)` -> `POST /api/dispatch/location` with numeric coordinates (`-180 <= lng <= 180`, `-90 <= lat <= 90`)
- `updateOrderStatus(orderId, status)` -> transitions order through `confirmed` -> `picked_up` -> `completed`
- `getWallet()` -> `{ balance: number, currency: string }`

### Admin & Pharmacy Contract (TC-ADM)
- `verifyPrescription(orderId, status)` -> `{ success: boolean, order: { id, prescription_status: 'verified' | 'rejected' } }`
- `getAnalytics()` -> `{ total_orders: number, total_revenue: number, active_providers: number }`

### Support & Dispute Contract (TC-SUP)
- `resolveDispute(disputeId, resolution_notes)` -> updates dispute status to `'resolved'`
- `retryRefund(refundId)` -> `{ message: string, refund: { id, status: 'completed' } }`
- `getNotificationLogs()` -> `NotificationLog[]`

### Real-Time WebSocket Contract (R3)
- Port 3005: `subscribe_order(orderId)` -> receives `order_update` events
- Port 3009: `join_chat(roomId)` -> sends `send_message` -> receives `new_message`, `chat_closed`

## Code Layout
```
frontend/
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── src/
    ├── app/
    │   ├── App.tsx
    │   └── components/
    │       ├── LoginPage.tsx
    │       ├── PortalShell.tsx
    │       ├── customer/CustomerPortal.tsx
    │       ├── provider/ProviderPortal.tsx
    │       ├── driver/DriverPortal.tsx
    │       ├── admin/AdminPortal.tsx
    │       └── support/SupportPortal.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── services/
    │   ├── apiClient.ts
    │   ├── authService.ts
    │   ├── catalogService.ts
    │   ├── pricingService.ts
    │   ├── orderService.ts
    │   ├── dispatchService.ts
    │   ├── kycService.ts
    │   ├── ledgerService.ts
    │   ├── adminService.ts
    │   ├── reviewService.ts
    │   └── socketService.ts
    └── tests/
        ├── setup.ts
        ├── mocks/
        │   ├── mockData.ts
        │   ├── mockFetch.ts
        │   └── mockSocket.ts
        ├── unit/
        │   ├── tc-auth.test.ts
        │   ├── tc-cust.test.ts
        │   ├── tc-prov.test.ts
        │   ├── tc-drv.test.ts
        │   ├── tc-adm.test.ts
        │   ├── tc-sup.test.ts
        │   ├── contracts.test.ts
        │   └── adversarial-stress.test.ts
        ├── integration/
        │   └── realtime.test.ts
        ├── e2e/
        │   ├── customer-portal.test.ts
        │   ├── provider-portal.test.ts
        │   ├── driver-portal.test.ts
        │   ├── admin-portal.test.ts
        │   ├── support-portal.test.ts
        │   └── full-lifecycle.test.ts
        ├── adversarial-challenger2.test.ts
        └── reports/
            ├── generate-report.js
            ├── TEST_REPORT.md
            └── test-results.json
```

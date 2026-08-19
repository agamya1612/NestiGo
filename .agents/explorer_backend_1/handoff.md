# Backend Microservices & API Contracts Exploration Report

## 1. Observation

### 1.1 Complete Inventory of the 15 Microservices & Shared Infrastructure
From inspecting `C:\Users\Shantanu Joshi\Desktop\NestiGo\backend\docker-compose.prod.yml`, `backend/services/`, and `backend/init-db.sql`:

| Service | Port | Entrypoint File | Primary Dependencies / Storage | Endpoints & Topics |
|---|---|---|---|---|
| **1. API Gateway** | `3000` | `backend/services/api-gateway/index.js` | Express, `http-proxy-middleware`, `jsonwebtoken` | Reverse proxy for all microservices, JWT auth validation via `GOTRUE_JWT_SECRET` |
| **2. Order Service** | `3001` | `backend/services/order-service/index.js` | Express, Prisma ORM, Kafka (`orders`, `provider.assignments`, `payments`) | `POST /api/orders`, `GET /api/orders`, `PUT /api/orders/:id/status`, `POST /api/orders/:id/cancel` |
| **3. Payment Service** | `3002` | `backend/services/payment-service/index.js` | Express, Postgres `pg`, Kafka (`payments`, `orders`) | `POST /api/payments/webhook`, `GET /api/payments/refunds`, `POST /api/payments/refunds/:id/retry` |
| **4. Catalog & Inventory Service** | `3003` | `backend/services/catalog-service/index.js` | Express, Postgres `pg` | `GET /api/catalog/:vertical`, `GET /api/inventory/:catalogItemId`, `POST /api/inventory/deduct` |
| **5. Dispatch & Telemetry Service** | `3004` | `backend/services/dispatch-service/index.js` | Express, Postgres `pg`, Redis (`ioredis`), Kafka (`payments`, `provider.assignments`) | `POST /api/dispatch/location` (Redis GEO), Kafka consumer for `payment.captured` |
| **6. WebSocket Service** | `3005` | `backend/services/websocket-service/index.js` | Express, Socket.IO (`http.Server`), Kafka (`orders`, `provider.assignments`, `payments`) | Socket.IO on `:3005`, event `subscribe_order`, emits `order_update` |
| **7. Ledger Service** | `3006` | `backend/services/ledger-service/index.js` | Express, Postgres `pg`, Kafka (`orders`, `payments`) | `GET /api/ledger/wallet`, Kafka consumer for `payment.refunded`, `settlement.processed` |
| **8. Pricing Service** | `3007` | `backend/services/pricing-service/index.js` | Express, Postgres `pg` (`promotions`, `catalog_items`) | `POST /api/pricing/calculate` (Surge & Coupon calculation) |
| **9. KYC Service** | `3008` | `backend/services/kyc-service/index.js` | Express, Postgres `pg` (`provider_kyc`, `provider_profiles`) | `POST /api/kyc/upload`, `PUT /api/kyc/:id/verify` |
| **10. Chat Service** | `3009` | `backend/services/chat-service/index.js` | Express, Socket.IO, Postgres `pg` (`chat_rooms`, `messages`), Kafka | Socket.IO on `:3009`, events `join_chat`, `send_message`, Kafka room lifecycle |
| **11. Review Service** | `3010` | `backend/services/review-service/index.js` | Express, Postgres `pg` (`reviews`, `provider_profiles`) | `POST /api/reviews` (1-5 star ratings + provider rating avg recalculation) |
| **12. User Service** | `3012` | `backend/services/user-service/index.js` | Express, Postgres `pg` (`provider_profiles`) | `POST /api/users/kyc` (Legacy/alternate KYC submission) |
| **13. Admin Service** | `3013` | `backend/services/admin-service/index.js` | Express, Postgres `pg` (`admin_roles`, `orders`, `disputes`) | `GET /api/admin/orders`, `POST /api/admin/prescriptions/:orderId/verify`, `POST /api/admin/disputes/:id/resolve` |
| **14. Notification Service** | Worker | `backend/services/notification-service/index.js` | Kafka (`provider.assignments`), Twilio mock | Kafka consumer for `provider.assignment.offered` -> SMS delivery |
| **15. Audit Service** | Worker | `backend/services/audit-service/index.js` | Kafka (`orders`, `payments`, `provider.assignments`, `notifications`), Postgres `pg` (`audit_logs`) | Black Box Recorder writing all domain events to `audit_logs` |

**Shared Infrastructure (`backend/services/shared/`)**:
- `db.js`: PostgreSQL connection pool with connection pooling (`max: 50`), error listeners, and graceful shutdown handlers.
- `redis.js`: `ioredis` client on port `6380` (or `REDIS_URL`).
- `kafka.js`: KafkaJS producer and consumer factory with 3-attempt exponential retry, dead letter queue (`dlq` topic) fallback for parse/processing failures.

---

### 1.2 Direct Code Observations by QA Category

#### Category 1: TC-AUTH (Auth, GoTrue, User Roles & Personas)
- **API Gateway JWT Verification** (`backend/services/api-gateway/index.js`, lines 16-35):
  ```javascript
  const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long');
      req.user = { id: decoded.sub };
      req.headers['x-user-id'] = decoded.sub;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
  ```
- **GoTrue Proxy Route** (`backend/services/api-gateway/index.js`, lines 72-113):
  Routes starting with `/auth` stream to `GOTRUE_URL` (default `http://gotrue:9999`).
- **Seed Personas & Fast-Switcher Credentials** (`frontend/src/services/authService.ts`, lines 4-35 & `backend/init-db.sql`):
  1. Customer: ID `11111111-1111-1111-1111-111111111111`, Email `customer@nestigo.com`, Name `Priya Sharma`, Role `customer`
  2. Provider: ID `22222222-2222-2222-2222-222222222222`, Email `provider@nestigo.com`, Name `Sparkle Cleaners`, Role `provider` (Profile ID `44444444-4444-4444-4444-444444444444`)
  3. Driver: ID `44444444-4444-4444-4444-444444444444`, Email `driver@nestigo.com`, Name `Ramesh Kumar`, Role `driver`
  4. Admin: ID `33333333-3333-3333-3333-333333333333`, Email `admin@nestigo.com`, Name `Platform Ops Admin`, Role `admin` (`ops_admin` in `admin_roles`)
  5. Support: ID `55555555-5555-5555-5555-555555555555`, Email `support@nestigo.com`, Name `Customer Support Lead`, Role `support` (`support_agent` in `admin_roles`)

#### Category 2: TC-CUST (Catalog Filtering, 1.5x Peak Surge Calculation, Rx Gating, Order Placement)
- **Multi-vertical Catalog Endpoint** (`backend/services/catalog-service/index.js`, lines 7-20):
  `GET /api/catalog/:vertical` queries `catalog_items ci JOIN categories c ON ci.category_id = c.id WHERE c.vertical_type = $1 AND ci.active = true`.
- **Surge Pricing & Coupon Rules** (`backend/services/pricing-service/index.js`, lines 7-58):
  - Request: `POST /api/pricing/calculate` with `{ items: [{ id, quantity }], coupon_code?: string }`.
  - Base price verified from `catalog_items` DB table.
  - Coupon logic: `SELECT discount_percentage, max_discount_amount FROM promotions WHERE code = $1 AND active = true`. `calculated_discount = (base_total * discount_percentage) / 100`, capped at `max_discount_amount`.
  - Surge multiplier rule:
    ```javascript
    const hour = new Date().getHours();
    const surge_multiplier = (hour >= 18 && hour <= 22) ? 1.5 : 1.0;
    const final_total = (base_total - discount) * surge_multiplier;
    ```
    Peak hours: **18:00 to 22:00 (1.5x multiplier)**; Off-peak: **1.0x multiplier**.
  - Response: `{ base_total, discount, surge_multiplier, final_total }`.
- **Prescription Gating & Order Creation** (`backend/services/order-service/index.js`, lines 9-78):
  - Iterates over items and queries `catalog_items.requires_prescription`.
  - If any item has `requires_prescription === true` (e.g. `77777777-7777-7777-7777-777777777772` Amoxicillin), sets `prescription_status = 'pending'`, otherwise `'n_a'` (`n/a`).
  - Sets initial `status = 'pending_payment'`.
  - Emits Kafka event `orders: order.placed`.

#### Category 3: TC-PROV (Provider Availability, Atomic Inventory Deduction, KYC Upload)
- **Atomic Inventory Deduction Endpoint** (`backend/services/catalog-service/index.js`, lines 35-52):
  - `POST /api/inventory/deduct`
  - Body: `{ catalogItemId, locationId, quantity }`
  - Atomic query:
    ```sql
    UPDATE inventory 
    SET stock_qty = stock_qty - $1, updated_at = now()
    WHERE catalog_item_id = $2 AND location_id = $3 AND stock_qty >= $1
    RETURNING *
    ```
  - Success returns `200 { success: true, inventory: {...} }`.
  - If `stock_qty < quantity` or row missing, returns `400 { error: 'Insufficient stock or item not found' }`.
- **KYC Document Upload** (`backend/services/kyc-service/index.js`, lines 8-39):
  - `POST /api/kyc/upload`
  - Header: `x-user-id`
  - Body: `{ document_type, document_url }`
  - Inserts into `provider_kyc`, sets `provider_profiles.kyc_status = 'pending'`, returns `201 { message: 'KYC Document uploaded', document: { id, verification_status } }`.

#### Category 4: TC-DRV (Redis GEO Driver GPS Telemetry, Trip Milestones, Double-Entry Wallet Settlement)
- **Redis GEO Telemetry Streaming** (`backend/services/dispatch-service/index.js`, lines 9-24):
  - `POST /api/dispatch/location`
  - Body: `{ lng: number, lat: number }` (must be valid numeric floats/doubles)
  - Headers: `x-user-id`
  - Command: `redis.geoadd('active_providers', lng, lat, provider_id)`
  - Returns `200 { message: 'Location updated' }`.
- **Dispatch Match Algorithm** (`backend/services/dispatch-service/index.js`, lines 52-96):
  - On `payment.captured`, runs: `redis.georadius('active_providers', address.lng, address.lat, 10, 'km', 'ASC')`.
  - If provider located, inserts `provider_assignments` with `status = 'offered'`, emits `provider.assignments: provider.assignment.offered`.
  - If no provider found within radius, emits `provider.assignments: provider.assignment.failed` with `reason: 'no_providers_available'`, triggering the Saga Rollback in `order-service` and `payment-service`.
- **Trip Milestones & Status Progression**:
  - `PUT /api/orders/:id/status` -> transitions `confirmed` -> `picked_up` -> `completed`.
- **Double-Entry Wallet Settlement** (`backend/services/payment-service/index.js`, lines 87-106 & `backend/services/ledger-service/index.js`, lines 46-57):
  - When `order.completed` fires:
    - `payment-service` calculates 80% provider cut (`amount_total * 0.80`), inserts into `settlements` with `status = 'processed'`, publishes `payments: settlement.processed`.
    - `ledger-service` executes atomic SQL transaction:
      `UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE user_id = (SELECT user_id FROM provider_profiles WHERE id = $2) RETURNING id;`
      `INSERT INTO ledger_transactions (wallet_id, amount, reference_type, reference_id) VALUES ($1, $2, 'settlement', $3);`

#### Category 5: TC-ADM (Cross-Vertical Analytics, Pharmacist Rx Verification, Dispute Resolution)
- **Pharmacist Prescription Verification** (`backend/services/admin-service/index.js`, lines 50-80):
  - `POST /api/admin/prescriptions/:orderId/verify`
  - Headers: `x-user-id` (validated against `admin_roles`)
  - Body: `{ status: 'verified' | 'rejected' }`
  - Query:
    ```sql
    UPDATE orders 
    SET prescription_status = $1, updated_at = now() 
    WHERE id = $2 AND prescription_status = 'pending'
    RETURNING id, prescription_status
    ```
  - If `status === 'rejected'`, updates `orders SET status = 'cancelled' WHERE id = $1`.
  - Returns `200 { success: true, order: { id, prescription_status } }`.
- **Dispute Resolution** (`backend/services/admin-service/index.js`, lines 83-104):
  - `POST /api/admin/disputes/:id/resolve` with `{ resolution_notes }`.
  - Sets `disputes.status = 'resolved'`, `resolution_notes = $1`.

#### Category 6: TC-SUP (Support Portal, Gateway Refund Retry, SMS Notification Audit Logs)
- **Gateway Refund Retry Endpoint** (`backend/services/payment-service/index.js`, lines 36-50):
  - `POST /api/payments/refunds/:id/retry`
  - Validates `refunds WHERE id = $1 AND status = 'failed'`.
  - Updates `refunds SET status = 'completed' WHERE id = $1`, publishes `payments: payment.refunded`.
  - `ledger-service` consumes `payment.refunded`, credits customer wallet (`wallets.balance += amount`) and logs `ledger_transactions` with `reference_type = 'refund'`.
- **SMS Notifications & Audit Trail**:
  - `notification-service`: Consumes `provider.assignment.offered`, invokes mock Twilio SMS.
  - `audit-service`: Black Box Recorder subscribing to topics `['orders', 'payments', 'provider.assignments', 'notifications']`, inserts records into `audit_logs (topic, event_type, payload)`.

---

### 1.3 Real-Time WebSocket Services (:3005 & :3009)

1. **`websocket-service` (Port 3005)**:
   - Server: Socket.IO on port 3005 (`C:\Users\Shantanu Joshi\Desktop\NestiGo\backend\services\websocket-service\index.js`)
   - Client Action: `socket.emit('subscribe_order', orderId)` -> joins room `order_${orderId}`.
   - Kafka Bridge: Listens to topics `['orders', 'provider.assignments', 'payments']`. If `payload.order_id` is present, executes `io.to('order_' + payload.order_id).emit('order_update', { eventType, payload })`.
   - Cleanup: Disconnect event removes socket from room.

2. **`chat-service` (Port 3009)**:
   - Server: Socket.IO on port 3009 (`C:\Users\Shantanu Joshi\Desktop\NestiGo\backend\services\chat-service\index.js`)
   - Client Connection: `socket.handshake.query.userId` -> joins personal room `userId`.
   - Room Join: `socket.emit('join_chat', roomId)`.
   - Message Send: `socket.emit('send_message', { room_id, sender_id, content })`.
   - Verification: Checks `chat_rooms.active == true`. If inactive, emits `'error'`, `'Chat room is inactive or does not exist'`. If active, inserts into `messages` and broadcasts `io.to(room_id).emit('new_message', data)`.
   - Kafka Lifecycle: On `provider.assignment.accepted`, creates room in `chat_rooms`. On `order.completed` or `order.cancelled`, sets `chat_rooms.active = false` and emits `chat_closed` to the room.

---

### 1.4 Frontend Test Suite Status & Discrepancies Observed

Running `npx vitest run` in `frontend/` showed:
- 10 tests across 3 suites executed.
- `src/tests/pricingService.test.ts`: 3/3 passed.
- `src/tests/catalogService.test.ts`: 3/3 passed.
- `src/tests/orderService.test.ts`: 2 failed due to contract assertion mismatches:
  - Line 24: `expect(updated.status).toBe("completed")` failed because `updateOrderStatus` returns `{ message: "Order status updated" }` (not `{ status: "completed" }`).
  - Line 29: `expect(cancelled.status).toBe("cancelled")` failed because `cancelOrder` returns `{ message: "Order cancelled, refund requested" }`.

---

## 2. Logic Chain

1. **Service Boundary & Gateway Routing**:
   - The API Gateway acts as the single public entrypoint on port 3000.
   - It intercepts JWT Bearer tokens, decodes `sub` as the verified user ID, and injects `x-user-id` into downstream HTTP headers.
   - All microservice endpoints expect `x-user-id` either directly or via gateway propagation.

2. **Saga Distributed Transaction & Rollback Mechanics**:
   - Flow: `Order Created` -> `Payment Captured` -> `Dispatch GeoRadius Search`.
   - Success Path: Provider found -> `provider.assignment.offered` -> Provider accepts -> Driver milestones -> `order.completed` -> 80% settlement credited to driver wallet.
   - Failure / Rollback Path: No providers available within 10km radius (`lng=0, lat=0` or empty Redis Geo set) -> `provider.assignment.failed` -> `order-service` consumes event and marks order `cancelled` -> publishes `payment.refund.requested` -> `payment-service` executes refund -> publishes `payment.refunded` -> `ledger-service` credits customer wallet -> `order-service` updates order status to `refunded`.

3. **Surge Pricing & Rx Gating Math**:
   - Surge pricing logic is strictly time-based: 18:00 <= hour <= 22:00 -> 1.5x surge multiplier; otherwise 1.0x.
   - Rx prescription workflow requires server verification before fulfillment. Without Rx verification (`prescription_status = 'pending'`), the order cannot be fulfilled. If rejected by pharmacist (`POST /api/admin/prescriptions/:orderId/verify` with status `rejected`), the order is automatically cancelled.

4. **Testing & Mocking Blueprint for Vitest & Playwright**:
   - For Vitest contract test suites, mock API responses must precisely reflect the backend Express handlers:
     - Auth: GoTrue token payload with `access_token` and `user.id`.
     - Catalog / Inventory: `/api/inventory/deduct` returning `{ success: true, inventory: {...} }` or 400 `{ error: "Insufficient stock or item not found" }`.
     - Dispatch: `/api/dispatch/location` validating numeric coordinates and returning `{ message: "Location updated" }`.
     - Pricing: `/api/pricing/calculate` outputting `{ base_total, discount, surge_multiplier, final_total }`.
     - Admin / Pharmacy: `/api/admin/prescriptions/:orderId/verify` returning `{ success: true, order: { id, prescription_status } }`.
     - Support / Refunds: `/api/payments/refunds/:id/retry` returning `{ message: "Refund retried successfully" }`.
     - WebSockets: Socket.IO mock emitting `order_update` on room `order_${orderId}` and `new_message` / `chat_closed` on room `roomId`.

---

## 3. Caveats

1. **Local Standalone vs. Docker Microservices**:
   - When running microservices locally outside Docker, services connect to Postgres on `localhost:5433`, Redis on `localhost:6380`, and Kafka on `localhost:9092`.
   - In offline / isolated frontend test mode, the frontend services (`frontend/src/services/`) contain resilient client-side fallbacks (e.g. `FALLBACK_CATALOG`, local mock orders, mock dev JWT token generator) ensuring that unit and contract tests run reliably in CI/CD without hard external service dependencies.
2. **User Service vs. KYC Service Port Overlap**:
   - In `docker-compose.prod.yml`, `kyc-service` is the active service on port 3008 for KYC upload and admin verification (`/api/kyc/*`). `user-service` on port 3012 provides `/api/users/kyc`. Both handle provider KYC transitions to `pending`.
3. **Database Types Mapping**:
   - In Prisma schema, Postgres enum `n/a` is mapped to `@map("n/a")` in Prisma as `n_a`. The API payload returns `'pending'` or `'n/a'`.

---

## 4. Conclusion

- All 15 microservices and shared libraries have been analyzed, mapped, and verified against the requirements.
- The 6 test suite categories (TC-AUTH, TC-CUST, TC-PROV, TC-DRV, TC-ADM, TC-SUP) have explicit API contracts, route structures, and payload specifications ready for Vitest test implementation.
- All real-time WebSocket contracts (`websocket-service` on :3005 and `chat-service` on :3009) have their event emitters, room handlers, and teardown lifecycle completely identified.

---

## 5. Verification Method

To independently verify all findings and test suite execution:
1. **Frontend Vitest Service Contract Execution**:
   ```bash
   cd "C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend"
   npx vitest run
   ```
2. **Backend Robustness & Security Verification Suite**:
   ```bash
   cd "C:\Users\Shantanu Joshi\Desktop\NestiGo\backend\tests"
   node test-robustness.js
   node test-red-team.js
   ```
3. **Inspect Service Definitions and Endpoints**:
   - API Gateway proxy table: `backend/services/api-gateway/index.js:56-70`
   - Order service status transitions: `backend/services/order-service/index.js:113-145`
   - Pricing surge calculation: `backend/services/pricing-service/index.js:39-50`
   - Dispatch Redis GEO streaming: `backend/services/dispatch-service/index.js:9-24`
   - Admin Rx verification: `backend/services/admin-service/index.js:50-80`
   - Inventory atomic deduction: `backend/services/catalog-service/index.js:35-52`

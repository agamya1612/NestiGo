# NestiGo Microservice Architecture & Environment Analysis

## 1. Microservice Analysis & Request Routing

### API Gateway (Port 3000)
- **Role**: Entry point for all incoming API traffic. Performs JWT verification using `GOTRUE_JWT_SECRET` (defaults to `'super-secret-jwt-token-with-at-least-32-characters-long'`).
- **Authentication**: Validates Supabase auth JWTs. Extracts user ID from the `sub` claim and injects it into downstream request headers as `x-user-id`.
- **Routing Rules**:
  - **Protected Routes** (requires valid Bearer token):
    - `POST/GET/PUT /api/orders/*` -> proxied to `ORDER_SERVICE_URL` (default: `http://localhost:3001`)
    - `POST /api/users/*` -> proxied to `USER_SERVICE_URL` (default: `http://localhost:3012`)
    - `GET /api/ledger/*` -> proxied to `LEDGER_SERVICE_URL` (default: `http://localhost:3006`)
    - `POST /api/pricing/*` -> proxied to `PRICING_SERVICE_URL` (default: `http://localhost:3007`)
    - `POST/PUT /api/kyc/*` -> proxied to `KYC_SERVICE_URL` (default: `http://localhost:3008`)
    - `POST /api/reviews/*` -> proxied to `REVIEW_SERVICE_URL` (default: `http://localhost:3010`)
    - `POST /api/dispatch/*` -> proxied to `DISPATCH_SERVICE_URL` (default: `http://localhost:3004`)
  - **Public Routes**:
    - `GET /api/catalog/*` -> proxied to `CATALOG_SERVICE_URL` (default: `http://localhost:3003`)
    - `POST/GET /api/payments/*` -> proxied to `PAYMENT_SERVICE_URL` (default: `http://localhost:3002`)
    - `/auth/*` -> manual proxying (streaming request/response bodies) to GoTrue at `GOTRUE_URL` (default: `http://gotrue:9999`)

### Order Service (Port 3001)
- **Endpoints**:
  - `POST /api/orders`: Creates order in `pending_payment` status. Publishes `order.placed` event to Kafka topic `orders`.
  - `GET /api/orders`: Returns customer's orders or provider's assigned orders.
  - `PUT /api/orders/:id/status`: Updates order status. Publishes `order.completed` event to topic `orders` if status is completed.
  - `POST /api/orders/:id/cancel`: Cancels order. Publishes `payment.refund.requested` to topic `payments`.
- **Kafka Consumers**:
  - Subscribes to `provider.assignments` and `payments` topics (group `order-service-saga-group`).
  - Event `provider.assignment.failed` -> Updates order status to `cancelled`, publishes `payment.refund.requested`.
  - Event `payment.refunded` -> Updates order status to `refunded`.

### Payment Service (Port 3002)
- **Endpoints**:
  - `POST /api/payments/webhook`: Handles Razorpay payment captures. Updates order status to `paid` if it is `pending_payment`. Publishes `payment.captured` event to topic `payments`.
  - `GET /api/payments/refunds`: Fetches list of refunds.
  - `POST /api/payments/refunds/:id/retry`: Retries failed refund by setting status to `completed` and publishing `payment.refunded` event.
- **Kafka Consumers**:
  - Subscribes to `payments` and `orders` topics (group `payment-service-saga-group`).
  - Event `payment.refund.requested` -> Inserts refund record. Gateway success simulated with `Math.random() > 0.2` (20% failure). If success, publishes `payment.refunded`.
  - Event `order.completed` -> Calculates settlement (80% provider cut) and publishes `settlement.processed`.

### Catalog Service (Port 3003)
- **Endpoints**:
  - `GET /api/catalog/:vertical`: Returns active items for a given vertical.

### User Service (Port 3004)
- **Endpoints**:
  - `POST /api/users/kyc`: Submits KYC status for providers. Updates `provider_profiles.kyc_status` to `'pending'`.
- **Note**: Conflict identified below under Port configurations.

### Dispatch Service (Port 3004)
- **Endpoints**:
  - `POST /api/dispatch/location`: Updates provider coordinates using Redis GEOADD.
- **Kafka Consumers**:
  - Subscribes to `payments` topic (group `dispatch-group-2`).
  - Event `payment.captured` -> Finds nearby providers in Redis using GEORADIUS. Inserts provider assignment offer and publishes `provider.assignment.offered`. Falls back to SQL if Redis georadius returns nothing (unless coordinates are 0, 0 forcing failure). If no provider is available, publishes `provider.assignment.failed`.

### WebSocket Service (Port 3005)
- **WebSocket Protocol**: Client connects and subscribes to room `order_${orderId}`.
- **Kafka Consumers**:
  - Subscribes to `orders`, `provider.assignments`, `payments` (group `websocket-group`).
  - Broadcasts all events to room `order_${payload.order_id}` with message `'order_update'`.

### Ledger Service (Port 3006)
- **Endpoints**:
  - `GET /api/ledger/wallet`: Returns wallet balance.
- **Kafka Consumers**:
  - Subscribes to `orders` and `payments` topics (group `ledger-service-group`).
  - Event `payment.refunded` -> Credits customer wallet, records transaction.
  - Event `settlement.processed` -> Credits provider wallet, records transaction.

### Pricing Service (Port 3007)
- **Endpoints**:
  - `POST /api/pricing/calculate`: Computes price total, applies promotion code, and applies surge pricing (1.5x multiplier) between 18:00 and 22:00.

### KYC Service (Port 3008)
- **Endpoints**:
  - `POST /api/kyc/upload`: Uploads provider document, updates profile status to `pending`.
  - `PUT /api/kyc/:id/verify`: Admin verifies or rejects KYC doc. If verified, updates provider active status to `true` and kyc status to `approved`.

### Chat Service (Port 3009)
- **Endpoints & Sockets**: Sockets for message sending/receiving; joins room `roomId`.
- **Kafka Consumers**:
  - Subscribes to `provider.assignments` and `orders` topics (group `chat-service-group`).
  - Event `provider.assignment.accepted` -> Creates chat room.
  - Event `order.completed` / `order.cancelled` -> Disables chat room.

### Review Service (Port 3010)
- **Endpoints**:
  - `POST /api/reviews`: Submits provider rating and comment, updates `provider_profiles.rating` average.

### Audit Service (No Port)
- **Kafka Consumers**:
  - Subscribes to `orders`, `payments`, `provider.assignments`, `notifications` topics (group `audit-service-group`).
  - Inserts black box records into `audit_logs` table.

---

## 2. Test Scripts Execution Details

### 2.1 E2E Test (`test-e2e.js`)
1. **Authentication Token Retrieval**:
   - Calls `POST /auth/signup` via Gateway.
   - Body: `{ email: "testuser_<timestamp>@nestigo.com", password: "password123" }`.
   - Saves token from `signupRes.data.access_token`.
2. **Catalog Item Fetch**:
   - Calls `GET /api/catalog/service` to get active services. Takes the first item.
3. **Order Creation**:
   - Calls `POST /api/orders` with headers `Authorization: Bearer <AUTH_TOKEN>`.
   - Body: `{ customer_id: '11111111-1111-1111-1111-111111111111', address: { line1: '123 Main St', lat, lng }, items: [{ id: item.id, quantity: 1 }] }`.
4. **Razorpay Webhook Simulation**:
   - Calls `POST /api/payments/webhook` with `x-razorpay-signature: mock_signature`.
   - Body contains:
     ```json
     {
       "event": "payment.captured",
       "payload": {
         "payment": {
           "entity": {
             "id": "pay_<timestamp>",
             "amount": 50000,
             "status": "captured",
             "notes": { "order_id": orderId }
           }
         }
       }
     }
     ```
   - Connects to `Socket.io` on Port 3005 and waits for event (`provider.assignment.offered` for Happy Path, `payment.refunded` for Saga Rollback).

### 2.2 Hardcore E2E Test (`test-e2e-hardcore.js`)
1. **Authentication Token Retrieval**:
   - Programmatically generates JWT tokens using the local `jsonwebtoken` library and the signature secret `GOTRUE_JWT_SECRET` (defaults to `'super-secret-jwt-token-with-at-least-32-characters-long'`).
   - Subject claims: `sub: '11111111-1111-1111-1111-111111111111'` (customer) and `sub: '22222222-2222-2222-2222-222222222222'` (provider).
2. **Operations tested**:
   - Rejection of missing/invalid tokens.
   - Pricing Calculation endpoint.
   - KYC Upload endpoint.
   - Provider location ping (`POST /api/dispatch/location`).
   - Order creation and cancellation.
   - Review constraints (verifies out-of-bounds ratings are rejected).

### 2.3 Robustness Test (`test-robustness.js`)
1. **Token Retrieval & Setup**:
   - Signs up a new attacker user: `attacker_<timestamp>@nestigo.com`.
   - Retrieves catalog items to find a valid item.
2. **Operations tested**:
   - Security: Rejection of requests with missing/fake tokens.
   - Validation: Reject empty order items, non-existent catalog items, negative quantity.
   - Idempotency: Duplicate payment webhooks for the same order.
   - Concurrency: Firing 20 concurrent order placements to test load/stress.

### 2.4 Red Team Test (`test-red-team.js`)
1. **Token Setup**:
   - Uses static `mock-token`. Note: Unless JWT validation is bypassed on the gateway, requests using this will fail with 401.
2. **Attacks simulated**:
   - Attack 1: API Gateway auth bypass check.
   - Attack 2: SQL Injection in `customer_id` field.
   - Attack 3: Geospatial Poisoning (injecting coordinate values of `999, 999`).
   - Attack 4: Idempotency Breaking (duplicate webhooks for the same order).
   - Attack 5: Kafka Poison Pill (directly publishing malformed JSON to Kafka topic `payments`).

---

## 3. Microservice Ports & Environment Configurations

### Ports Mapping
- **Local Host Running Mode** (port conflicts exist here):
  - `api-gateway`: 3000
  - `order-service`: 3001
  - `payment-service`: 3002
  - `catalog-service`: 3003
  - `dispatch-service`: 3004
  - `user-service`: 3004 (Conflicts with Dispatch Service when run locally on host!)
  - `websocket-service`: 3005
  - `ledger-service`: 3006
  - `pricing-service`: 3007
  - `kyc-service`: 3008
  - `chat-service`: 3009
  - `review-service`: 3010
  - `gotrue`: 9999
  - `postgres`: 5433 (maps internally to 5432)
  - `redis`: 6380 (maps internally to 6379)
  - `zookeeper`: 2181
  - `kafka`: 9092
  - `kafka-ui`: 8080

- **Docker Compose Bridge Mode**:
  - Only `api-gateway` (3000), `websocket-service` (3005), `kafka` (9092), and infrastructure services map host ports. All other microservices bind internally to the `nestigo_net` bridge network on their default ports.

### Config Variables (from `.env`):
- `DATABASE_URL=postgresql://supabase_admin:nestigo_password@postgres:5432/postgres` (production/docker-compose) or falls back locally to `postgresql://nestigo_user:nestigo_password@localhost:5433/nestigo_db`.
- `REDIS_URL=redis://redis:6379` (production/docker-compose) or falls back locally to `redis://localhost:6380`.
- `KAFKA_BROKER=kafka:29092` (production/docker-compose) or falls back locally to `localhost:9092`.
- `GOTRUE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long`

---

## 4. System Environment Check

- **`k6` Installation Status**: **NOT installed** (Command `k6 version` returns `CommandNotFoundException` on PowerShell).

---

## 5. Architectural Anomalies and Concerns

1. **Port Collision (3004)**: Both `user-service` and `dispatch-service` are hardcoded to listen on port 3004 (`app.listen(3004)`). If run locally using `start-all.ps1`, whichever starts second will crash/fail to bind. Additionally, `api-gateway/index.js` defines `USER_SERVICE_URL` default fallback as `http://localhost:3012`, which does not match `user-service`'s hardcoded port 3004.
2. **`test-robustness.js` Idempotency Assertion**: In `testIdempotency()`, the script asserts:
   ```javascript
   logTest('Webhook Second Try (Idempotency)', res2.data.status, 'ignored_or_already_paid');
   ```
   However, `payment-service`'s webhook endpoint returns:
   ```javascript
   if (result.rowCount === 0) return res.status(200).json({ status: 'ignored' });
   ```
   This returns `status: 'ignored'`, causing the assertion to fail (`'ignored' !== 'ignored_or_already_paid'`) and the script to abort.
3. **`test-red-team.js` Authentication Bypass**: The red team script uses `MOCK_TOKEN = 'mock-token'` for order creation. The API Gateway will reject this token with a 401 Unauthorized error since it is not a valid signed JWT, preventing downstream attacks (Attacks 3 & 4) from being initialized successfully unless token validation is disabled.

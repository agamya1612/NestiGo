# Handoff Report — explorer_m1 Analysis

## 1. Observation

### 1.1 Microservice Entry Points and Routing
- **File**: `d:\NestiGo\services\api-gateway\index.js`
  - Port: `3000` (Line 109: `app.listen(3000, ...)`)
  - Route configurations:
    - Protected: `/api/orders` (Line 53), `/api/users` (Line 54), `/api/ledger` (Line 55), `/api/pricing` (Line 56), `/api/kyc` (Line 57), `/api/reviews` (Line 58), `/api/dispatch` (Line 59).
    - Public: `/api/catalog` (Line 62), `/api/payments` (Line 63).
    - GoTrue proxy: `/auth` (Line 66).
  - JWT verification secret: `GOTRUE_JWT_SECRET` (Line 21: `process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long'`).

### 1.2 Microservice Ports and Configurations
- **File**: `d:\NestiGo\.env`
  - Database: `DATABASE_URL=postgresql://supabase_admin:nestigo_password@postgres:5432/postgres` (Line 4)
  - Redis: `REDIS_URL=redis://redis:6379` (Line 5)
  - Kafka: `KAFKA_BROKER=kafka:29092` (Line 6)
  - Gateway routing URLs:
    - `ORDER_SERVICE_URL=http://order-service:3001` (Line 7)
    - `PAYMENT_SERVICE_URL=http://payment-service:3002` (Line 8)
    - `CATALOG_SERVICE_URL=http://catalog-service:3003` (Line 9)
    - `USER_SERVICE_URL=http://user-service:3004` (Line 10)
    - `WEBSOCKET_SERVICE_URL=http://websocket-service:3005` (Line 11)
    - `LEDGER_SERVICE_URL=http://ledger-service:3006` (Line 12)
    - `PRICING_SERVICE_URL=http://pricing-service:3007` (Line 13)
    - `KYC_SERVICE_URL=http://kyc-service:3008` (Line 14)
    - `CHAT_SERVICE_URL=http://chat-service:3009` (Line 15)
    - `REVIEW_SERVICE_URL=http://review-service:3010` (Line 16)
    - `DISPATCH_SERVICE_URL=http://dispatch-service:3004` (Line 17)

- **File**: `d:\NestiGo\services\user-service\index.js`
  - Port configuration (Line 28: `app.listen(3004, ...)`)
- **File**: `d:\NestiGo\services\dispatch-service\index.js`
  - Port configuration (Line 116: `app.listen(3004, ...)`)

### 1.3 Test Script Authentication and Webhook Simulator Details
- **File**: `d:\NestiGo\test-e2e.js`
  - Signup endpoint: `POST ${API_GATEWAY}/auth/signup` (Line 13)
  - Order creation: `POST ${API_GATEWAY}/api/orders` (Line 31) with authorization header `Bearer ${AUTH_TOKEN}` (Line 36).
  - Razorpay Webhook Simulation: `POST ${API_GATEWAY}/api/payments/webhook` (Line 52) with event: `payment.captured` and payload: `{ payment: { entity: { notes: { order_id: orderId } } } }` (Lines 53-63).
- **File**: `d:\NestiGo\test-e2e-hardcore.js`
  - Token generation: Programmatic generation of JWT tokens using `jsonwebtoken` library and local signature key (`process.env.GOTRUE_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long'`) (Lines 52-53).
- **File**: `d:\NestiGo\test-robustness.js`
  - Idempotency expectation: `logTest('Webhook Second Try (Idempotency)', res2.data.status, 'ignored_or_already_paid')` (Line 113)
- **File**: `d:\NestiGo\services\payment-service\index.js`
  - Webhook response on duplicate: `if (result.rowCount === 0) return res.status(200).json({ status: 'ignored' })` (Line 20)
- **File**: `d:\NestiGo\test-red-team.js`
  - Mock token variable: `const MOCK_TOKEN = 'mock-token'` (Line 5)
  - Token use: `headers: { Authorization: `Bearer ${MOCK_TOKEN}` }` (Line 32, Line 47)

### 1.4 System Environment Checks
- **Command execution**: `k6 version` (PowerShell)
- **Result**:
  ```
  k6 : The term 'k6' is not recognized as the name of a cmdlet, function, script file, or operable program. Check the 
  spelling of the name, or if a path was included, verify that the path is correct and try again.
  At line:1 char:1
  + k6 version
  + ~~
      + CategoryInfo          : ObjectNotFound: (k6:String) [], CommandNotFoundException
      + FullyQualifiedErrorId : CommandNotFoundException
  ```

---

## 2. Logic Chain

1. **Port Conflicts**:
   - `user-service/index.js` listens on port `3004`.
   - `dispatch-service/index.js` listens on port `3004`.
   - Since both services try to bind to `3004` locally on the same host interface, running them via `start-all.ps1` will lead to a port conflict crash for the second service that attempts to bind.
   - Downstream, `api-gateway/index.js` has a fallback definition `process.env.USER_SERVICE_URL || 'http://localhost:3012'`, which doesn't match the hardcoded port `3004` of `user-service`.

2. **Idempotency Assertions**:
   - `test-robustness.js` asserts that the duplicate webhook response status is `'ignored_or_already_paid'`.
   - `payment-service`'s webhook handler returns `{ status: 'ignored' }`.
   - Therefore, running `test-robustness.js` will cause an assertion failure due to this string mismatch (`'ignored' !== 'ignored_or_already_paid'`).

3. **Red Team Token Verification**:
   - `test-red-team.js` uses `'mock-token'` as the Bearer token when creating a test order.
   - The `api-gateway` performs strict JWT verification using `jwt.verify` and throws a 401 error if the token is not a valid JWT.
   - Consequently, running `test-red-team.js` will fail at the order creation step (step 2) with a 401 Unauthorized error, preventing downstream attacks from running.

4. **Environment status**:
   - Run of `k6 version` shows command not found, which logically implies `k6` is not installed on the system path.

---

## 3. Caveats
- Investigated only the files and logs present in the codebase.
- Did not verify if Docker containers can run concurrently (due to read-only constraints).
- Assumed standard JWT verification is active on the Gateway for all test scripts.

---

## 4. Conclusion
The environment and codebase are cataloged. There is a port collision on port `3004` between `user-service` and `dispatch-service` when run locally, a mismatch in `test-robustness.js` duplicate webhook status assertions, and a token validation block in `test-red-team.js` due to the use of a simple string as a mock token instead of a signed JWT. `k6` is not installed on the system.

---

## 5. Verification Method
1. **Ports**: Check `user-service/index.js` line 28 and `dispatch-service/index.js` line 116.
2. **Robustness test assertion**: Check `test-robustness.js` line 113 and `services/payment-service/index.js` line 20.
3. **Red Team token**: Check `test-red-team.js` line 5 and line 32.
4. **k6**: Run `k6 version` in PowerShell to verify its command status.

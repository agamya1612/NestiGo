# Microservices Comprehensive Test Report 🚀

## Executive Summary
The decoupled event-driven architecture is a resounding success! The broken local Supabase stack has been fully replaced with native Docker containers, the schema has been initialized, mock data has been seeded, and the 6 independent microservices were run concurrently. 

I successfully simulated a customer flow from viewing the catalog to paying for an order, and observed the Kafka events successfully cascade through the system without any direct HTTP coupling between the core services.

## Test Execution Details

### 1. Database & Infrastructure
- **Postgres (PostGIS enabled)**: Started via Docker, schema applied successfully.
- **Mock Auth**: Replaced Supabase's `auth` schema with a mocked `auth.users` table so the foreign keys function locally.
- **Kafka & Redis**: Boots instantly via Compose and is reachable by all services.
- **Seeding**: Populated `catalog_items`, `categories`, `provider_profiles`, and `auth.users`.

### 2. Catalog Service (HTTP GET)
- **Action**: Ran `curl http://localhost:3003/api/catalog/service`
- **Result**: Successfully queried Postgres and returned the mock items (Chocolate Cake and Black Forest Cake) with prices.

### 3. Order Service (HTTP POST)
- **Action**: Posted a new order payload to `http://localhost:3001/api/orders`.
- **Result**:
  1. Service calculated the `amount_total` (500.00 INR) securely by checking the database.
  2. Order was saved to the `orders` table with status `pending_payment`.
  3. Service published the `order.placed` event to Kafka.

### 4. Event Cascade: Payment -> Dispatch -> Notification
- **Action**: Sent a mock Razorpay `payment.captured` webhook to the `payment-service`.
- **Result**:
  1. **Payment Service**: Updated Postgres order status to `paid` and published `payment.captured` to Kafka.
  2. **Dispatch Service (Kafka Consumer)**: Immediately woke up, consumed `payment.captured`, queried Postgres for an active provider, inserted a record into `provider_assignments`, and published `provider.assignment.offered` to Kafka.
  3. **Notification Service (Kafka Consumer)**: Immediately woke up, consumed `provider.assignment.offered`, and logged `[Twilio Mock] SMS to +919999999999: NestiGo: New order <uuid> available! Open the app to accept.`

## Edge Case Resiliency Testing
After the initial sunny-day test, we ran a gauntlet of edge cases to test system fault-tolerance and domain validation:

### 1. Invalid Order Creation
- **Test**: Attempted to create an order with a non-existent item UUID.
- **Fix**: Added data validation to `order-service` to explicitly verify item existence via `SELECT price FROM catalog_items`. If an item is missing, it now returns a HTTP 400 Bad Request instead of creating a $0.00 order.

### 2. Phantom Payment Webhooks (Poison Pills)
- **Test**: Sent a `payment.captured` webhook for an order ID that didn't exist in the database.
- **Fix**: Added validation to `payment-service` to ensure `UPDATE orders SET status = 'paid'` affected at least 1 row (`result.rowCount`). If 0, it aborts and returns HTTP 404, preventing invalid events from being broadcasted to Kafka and crashing downstream consumers like `dispatch-service`.

### 3. Dispatch Fulfillment Drought
- **Test**: Set all providers to `active = false` and simulated a valid payment capture.
- **Fix**: Upgraded the Kafka consumer loop in `dispatch-service` with a `try/catch` block. It now gracefully handles empty provider queries and logs them, bypassing fatal crashes and preventing Kafka partitions from being locked by unacknowledged offsets.

## Conclusion
The backend is completely operational and hardened against common edge cases. Services are isolated, fault-tolerant, and reactive. We are fully ready to begin hooking up the Admin Dashboard and Customer Frontend to these APIs!

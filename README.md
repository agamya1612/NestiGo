# NestiGo 🚀

NestiGo is an enterprise-grade, highly scalable, and event-driven microservices architecture built for a multi-vertical super-app (home services, 10-minute grocery, city delivery, bakery, pharma, and home shifting). 

The system leverages the **Saga Pattern** for distributed transactions, ensuring strict data consistency and fault tolerance. For example, if a provider is unavailable or a payment fails, the system automatically triggers asynchronous rollback events across all relevant microservices (e.g., refunding the wallet, cancelling the order, rolling back inventory).

## 🏗️ Architecture Highlights

- **Microservices**: Node.js & Express (15 independent services)
- **Event-Driven Broker**: Apache Kafka & Zookeeper (Choreography-based Sagas)
- **Database**: PostgreSQL with connection pooling, Row Level Security, and strict schema validation
- **Authentication**: Supabase GoTrue (JWT validation & role-based access)
- **Geo-Spatial Tracking**: Redis (GEOADD, GEORADIUS for dispatch and tracking)
- **Real-time Comms**: WebSockets (Socket.io for live updates and chat)
- **Containerization**: Docker & Docker Compose (Production-ready scaling)
- **Performance**: Capable of handling massive concurrent surges with 0.00% 5xx error rate under load.

## 🧩 The 15 Microservices

### 🌐 Edge & Comms
1. **`api-gateway`**: Routes incoming traffic, validates JWTs dynamically via Supabase headers, and utilizes a global Keep-Alive agent to prevent socket exhaustion.
2. **`websocket-service`**: Broadcasts live Kafka events (order updates, tracking, payments) to connected clients.
3. **`chat-service`**: Real-time websocket chat rooms for customer-to-provider communication.
4. **`notification-service`**: Listens to the Kafka event bus and dispatches system-wide alerts.

### ⚙️ Core Business Logic
5. **`order-service`**: Manages the order lifecycle, state machine, cart validation, and initiates the Saga workflows.
6. **`dispatch-service`**: Uses Redis Geo-queries to locate and assign the nearest active providers.
7. **`catalog-service`**: Manages the inventory, categories, and items available for purchase (including Pharma/Bakery tracking).
8. **`user-service`**: Manages customer profiles, roles, and preferences.

### 💰 Finance & Pricing
9. **`pricing-service`**: Dynamic pricing engine that calculates base rates, surge multipliers, and coupon code discounts.
10. **`payment-service`**: Processes webhook events with strict idempotency and manages automated commission settlements.
11. **`ledger-service`**: Digital wallet system for managing customer and provider NestiGo Cash (credits and debits).

### 🛡️ Compliance, Safety & Admin
12. **`kyc-service`**: Handles provider onboarding, document upload, and strict background verification statuses.
13. **`review-service`**: Rating engine to persist and calculate average 1-5 star provider reviews.
14. **`audit-service`**: An immutable "black-box" Kafka sink that records every single event across the cluster for strict compliance.
15. **`admin-service`**: Core dashboard API for ops to manage orders, disputes, pharma prescription verification, and category rollouts.

## 🚀 Quick Start

1. Create a `.env` file based on your environment needs (you can leave out defaults if running locally in docker).
2. Boot the entire cluster:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
3. Allow up to 30-40 seconds for Kafka to negotiate partitions and for all 15 Node applications to connect and sync their Consumer Groups.

## 🧪 Comprehensive Testing Suite

NestiGo includes a rigorous suite of automated integration, stress, and security tests located in the `tests/` and `stress-tests/` directories.

To run the functional evaluation suites:
1. Ensure the cluster is fully running and healthy.
2. Run the tests using Node:

```bash
# 1. Hardcore Edge-Case Integration Test
# Evaluates full Saga rollbacks, KYC flows, Pharma approvals, and dynamic pricing.
node tests/test-e2e-hardcore.js

# 2. Flash-Sale Robustness & Concurrency Test
# Blasts the system with simultaneous orders and inventory deductions to ensure atomic consistency.
node tests/test-robustness.js

# 3. Red Team Security Attacks
# Attempts SQL injections, API Gateway Bypasses, Geospatial Poisoning, and Kafka Poison Pills.
node tests/test-red-team.js
```

### 🌪️ Chaos Engineering & Load Testing
NestiGo has been formally stress-tested up to **5,000 Concurrent Virtual Users** while simultaneously enduring random container outages to test resilience.

To reproduce the Chaos run:
```bash
cd stress-tests
npm install
# Run Chaos and K6 concurrently:
npm run test:all
```
You can view the full test reports inside `docs/reports/`.

## 📜 Documentation
For a deeper dive into the exact functional requirements, database schema design, Kafka topic topology, and real-time workflows, refer to the [nestigo-requirements-architecture.md](./nestigo-requirements-architecture.md).

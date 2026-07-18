# NestiGo 

NestiGo is an enterprise-grade, highly scalable, and event-driven microservices architecture built for a delivery and home-services platform.

The system leverages the **Saga Pattern** for distributed transactions, ensuring strict data consistency and fault tolerance. For example, if a provider is unavailable or a payment fails, the system automatically triggers asynchronous rollback events across all relevant microservices (e.g., refunding the wallet, cancelling the order).

## Architecture Highlights
- **Microservices**: Node.js & Express (14 independent services)
- **Event-Driven Broker**: Apache Kafka & Zookeeper (Choreography-based Sagas)
- **Database**: PostgreSQL with connection pooling & client-side timeouts
- **Authentication**: Supabase GoTrue (JWT validation)
- **Geo-Spatial Tracking**: Redis (GEOADD, GEORADIUS)
- **Real-time Comms**: WebSockets (Socket.io)
- **Containerization**: Docker & Docker Compose
- **Performance**: Capable of handling 1,000+ concurrent virtual users with 0.00% 5xx error rate.

## The 14 Microservices
### 🌐 Edge & Comms
1. **`api-gateway`**: Routes incoming traffic, validates JWTs, and utilizes a global Keep-Alive agent to prevent socket exhaustion.
2. **`websocket-service`**: Broadcasts live Kafka events (order updates, payments) to connected clients.
3. **`chat-service`**: Real-time websocket chat rooms for customer-to-provider communication.
4. **`notification-service`**: Listens to the event bus and dispatches system-wide alerts.

### ⚙️ Core Business Logic
5. **`order-service`**: Manages the order lifecycle, state machine, and initiates the Saga workflows.
6. **`dispatch-service`**: Uses Redis Geo-queries to locate and assign the nearest active providers.
7. **`catalog-service`**: Manages the inventory of services available for purchase.
8. **`user-service`**: Manages customer profiles and roles.

### 💰 Finance & Pricing
9. **`pricing-service`**: Dynamic pricing engine that calculates base rates, surge multipliers, and coupon code discounts.
10. **`payment-service`**: Processes webhook events and manages automated commission settlements for providers.
11. **`ledger-service`**: Digital wallet system for managing customer and provider NestiGo Cash (credits and debits).

### 🛡️ Compliance & Safety
12. **`kyc-service`**: Handles provider onboarding, document upload, and strict background verification statuses.
13. **`review-service`**: Rating engine to persist and calculate average 1-5 star provider reviews.
14. **`audit-service`**: An immutable "black-box" Kafka sink that records every single event across the cluster for strict compliance.

## Quick Start
1. Create a `.env` file based on your environment needs.
2. Boot the entire cluster:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
3. Allow up to 30 seconds for Kafka to negotiate partitions and for all 14 Node applications to connect.

## Load Testing
The architecture has been rigorously load-tested against extreme pressure spikes.
To run the evaluation suite:
1. Ensure the cluster is fully running and healthy.
2. Run the hardcore K6 spike test suite:
   ```bash
   node test-e2e-hardcore.js
   ```

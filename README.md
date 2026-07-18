# NestiGo 

NestiGo is an enterprise-grade, highly scalable, and event-driven microservices architecture built for a delivery and ordering platform. 

The system leverages the **Saga Pattern** for distributed transactions, ensuring 100% data consistency even when downstream services fail (e.g., automatically refunding payments if no delivery drivers are available).

## Architecture Highlights
- **Microservices**: Node.js & Express
- **Event-Driven Broker**: Apache Kafka
- **Database**: PostgreSQL (via Supabase local)
- **Geo-Spatial Querying**: Redis
- **Real-time Updates**: WebSockets (Socket.io)
- **Containerization**: Docker & Docker Compose

## Services
1. `api-gateway`: Routes incoming traffic and handles JWT validation.
2. `order-service`: Manages order lifecycles and Saga rollbacks.
3. `payment-service`: Simulates Razorpay webhooks and processes refunds.
4. `dispatch-service`: Uses Redis Geo-queries to find nearby providers and assigns them.
5. `catalog-service`: Manages the items available for purchase.
6. `websocket-service`: Broadcasts live Kafka events to the frontend.
7. `notification-service`: Sends system alerts.
8. `user-service`: User profile management.

## Setup
1. Run `docker-compose -f docker-compose.prod.yml up -d` to spin up Kafka, Redis, Postgres, and the microservices.
2. Run `node test-robustness.js` to execute the edge cases and stress tests.

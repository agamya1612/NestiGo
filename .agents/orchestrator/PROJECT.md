# Project: NestiGo Load-Testing Suite

## Architecture
NestiGo consists of 14 microservices. The critical flow under test is the **Order -> Pricing -> Dispatch Saga** path:
1. Client sends POST to `api-gateway` (`http://localhost:3000/api/orders`) with bearer token.
2. `api-gateway` forwards request to `order-service`.
3. `order-service` calls `pricing-service` to compute pricing.
4. `order-service` saves order and emits an event to Kafka.
5. `payment-service` listens to Kafka, client triggers mock Razorpay webhook at `api-gateway` (`/api/payments/webhook`).
6. Webhook triggers payment capture and updates order state.
7. `dispatch-service` matches order to provider and creates assignments.
8. Live updates are pushed via `websocket-service` (`http://localhost:3005`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Exploration & Setup | Analyze services, endpoints, and verify environment tools (K6). | None | DONE |
| 2 | M2: K6 Script Development | Develop a rigorous K6 spike-testing script targeting Order Saga with 1,000+ VUs. | M1 | DONE |
| 3 | M3: Execution & Tuning | Execute the load test, monitor bottlenecks, tune microservices if needed. | M2 | DONE |
| 4 | M4: Validation & Report | Audit verification and generate final markdown report. | M3 | DONE |

## Code Layout
- Work Directory: `d:\NestiGo\load-tests\`
- K6 Script: `d:\NestiGo\load-tests\spike-test.js`
- Test Summary Report: `d:\NestiGo\load-tests\load-test-summary.md`

## Interface Contracts
- API Gateway: `http://localhost:3000`
- Websocket Service: `http://localhost:3005`
- Database: Postgres on `localhost:5433`
- Redis: `localhost:6380`
- Kafka: `localhost:9092`

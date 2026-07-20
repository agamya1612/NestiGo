## Current Status
Last visited: 2026-07-17T12:58:00Z

## Iteration Status
Current iteration: 1 / 32

## Progress
- [x] Investigate microservices structure and API endpoints
- [x] Plan and decompose project milestones into tracks
- [x] Create E2E load-testing track and test scripts
- [x] Run load-tests and check performance of saga paths
- [x] Finalize test report and document findings

## Retrospective Notes
### What Worked
- **Decoupled E2E Testing**: Running the K6 load test inside the Docker network (`nestigo_nestigo_net`) allowed it to easily resolve container names and bypass the host network layer, matching real production-like network layout.
- **Dynamic JWT Bypass/Auth Flow**: The combination of dynamic signups and local JWT fallback signing using the shared secret (`GOTRUE_JWT_SECRET`) allowed load tests to scale smoothly without overloading the GoTrue authentication server.
- **Connection Keep-Alive Agent**: Adding connection reuse at the API Gateway using the standard Node.js `http.Agent` successfully prevented socket exhaustion and drastically reduced gateway errors.
- **Database Connection Capping**: Increasing Postgres `max_connections` to 1000 and matching it with service pool caps (`max: 35`) avoided connection starvation while staying well within database limits.

### Lessons Learned
- **Connection Pooling Defaults**: Express microservices default to a tiny database pool limit of 10 connections. This becomes a severe bottleneck under load, causing client timeouts. Setting an appropriate dynamic pool limit is crucial.
- **Saga Propagation Pacing**: Distributed Saga flows (such as order pricing and dispatch queues) depend on multiple asynchronous microservices communicating via Kafka. When conducting load verification, dynamic pacing and validation intervals must account for processing latency under stress.
- **Port Collisions locally**: When testing microservices locally on host, make sure all service ports are mapped uniquely to avoid conflicts. Running in Docker containers isolates the network namespaces and simplifies local testing.

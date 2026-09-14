# Plan — NestiGo Load-Testing and Stress-Testing Evaluation Suite

## Objective
Build a rigorous load-testing and stress-testing evaluation suite for the NestiGo 14-microservice backend architecture using Grafana K6, targeting the Order -> Pricing -> Dispatch Saga flow with 1,000+ VUs, and asserting <1% 5xx failure rate.

## Topology & Orchestration Pattern
- **Pattern**: Project Orchestrator pattern.
- **Tracks**:
  - E2E Testing Track (developing and packaging K6 scripts and configurations).
  - Implementation & Tuning Track (executing load-tests, assessing gateway and microservice resilience, and optimizing setup).

## Milestones
1. **M1: Exploration & Discovery (Explorer)**:
   - Identify active endpoints for signup, catalog fetching, order creation, and payment simulation.
   - Investigate existing microservices, ports, database configurations, and Kafka messaging.
   - Verify K6 installation and performance constraints in the current environment.
2. **M2: Test Case Design & Script Implementation (Worker + Reviewer)**:
   - Write a K6 load testing script in `load-tests/` directory.
   - Support JWT authentication retrieval (signup/login) and user load simulation of 1,000+ VUs.
   - Target the Saga flow: order placement -> pricing -> dispatch webhook.
   - Define custom thresholds for performance gating (5xx HTTP error rate < 1%).
3. **M3: Load Test Execution & Tuning (Worker + Reviewer)**:
   - Ensure the microservice stack is running properly.
   - Run the K6 test scenario against the target gateway.
   - Optimize database, gateway, or microservice configs if bottlenecks are identified.
   - Collect and parse test metrics.
4. **M4: Validation & Hardening (Challenger + Reviewer + Auditor)**:
   - Challenge the load-testing suite against stress limits.
   - Run the Forensic Auditor to verify benchmark integrity and check for any hardcoding.
   - Generate the final markdown report containing load-testing outcomes.

## Verification Gate Criteria
- 100% E2E tests pass.
- K6 script executes with 1,000+ concurrent VUs.
- HTTP 5xx error rate < 1% at peak load.
- No integrity violations reported by Forensic Auditor.

# Original User Request

## Initial Request — 2026-07-17T18:03:18+05:30

# Teamwork Project Prompt — Draft

Build a rigorous load-testing and stress-testing evaluation suite for the NestiGo 14-microservice backend architecture to ensure it can handle high pressure.

Working directory: D:\NestiGo\load-tests
Integrity mode: benchmark

## Requirements

### R1. Implement Spike Testing with Grafana K6
The test suite must use Grafana K6 to hit the API Gateway with 1,000+ sudden concurrent connections to test surge limits and Kafka queues.

### R2. Target Critical Saga Paths
The load test should target the complex Order -> Pricing -> Dispatch Saga flows by simulating a flood of incoming customer orders.

## Acceptance Criteria

### Execution & Metrics
- [ ] A fully functional `k6` script is written that simulates at least 1,000 Virtual Users (VUs).
- [ ] The script asserts that the HTTP failure rate (status 5xx) is less than 1% under peak load.
- [ ] The team executes the K6 script against `http://localhost:3000` and saves the summary output to a markdown report.

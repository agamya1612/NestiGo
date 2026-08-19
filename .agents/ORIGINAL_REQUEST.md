# Original User Request

## 2026-08-19T15:16:03Z

Build and execute an automated hybrid QA test suite for NestiGo across all 5 platform portals (Customer, Provider, Driver, Admin, Support) and 15 microservices, implementing Vitest service contract tests and Playwright end-to-end critical path user flows.

Working directory: C:\Users\Shantanu Joshi\Desktop\NestiGo\frontend
Integrity mode: development

## Requirements

### R1. Service Layer & Contract Test Suites (Vitest)
Implement comprehensive unit and integration test suites in Vitest covering all core client services and business logic across the 6 QA categories:
- TC-AUTH: GoTrue token generation, 5-persona fast-switcher state, session persistence.
- TC-CUST: Multi-vertical catalog filtering, 1.5x peak surge pricing calculation (18:00–22:00 window), Rx item gating, order creation, review submission.
- TC-PROV: Provider availability toggle, atomic inventory deduction (/api/inventory/deduct), KYC document upload.
- TC-DRV: Redis GEO driver GPS telemetry streaming (POST /api/dispatch/location), trip milestone updates, double-entry wallet settlement.
- TC-ADM: Cross-vertical KPI analytics, order override actions (reassign, cancel, refund), pharmacist Rx verification (/api/admin/prescriptions/:orderId/verify).
- TC-SUP: Dispute resolution lifecycle, gateway refund retry, notification SMS audit logs.

### R2. End-to-End User Flow Tests (Playwright / Component Testing)
Implement automated browser-level end-to-end test scenarios verifying the full multi-portal lifecycle:
1. Customer searches catalog -> applies coupon WELCOME10 -> places order with Rx flag.
2. Provider views incoming assignment -> deducts inventory stock -> transitions order to picked up.
3. Driver turns duty ON -> broadcasts GPS coordinates -> executes trip milestones -> verifies wallet credit.
4. Admin opens command center -> reviews pending prescription -> verifies order.
5. Support receives customer dispute -> files resolution notes -> updates ticket status in Postgres.

### R3. Real-Time WebSocket & State Verification
Verify bidirectional communication with websocket-service (:3005) for order status updates and chat-service (:3009) for customer-driver room messaging, ensuring proper connection cleanup and message ordering.

### R4. Automated Execution & Test Report Generation
Configure the test scripts in package.json and execute all test suites, generating an automated summary report documenting pass/fail rates, execution times, and requirement traceability.

## Acceptance Criteria

### Test Execution & Pass Rate
- [ ] All Vitest service test suites pass with 100% success rate (npx vitest run).
- [ ] End-to-end user flow tests pass across all 5 portals with zero unhandled promise rejections.
- [ ] Surge pricing tests verify 1.5x multiplier during 18:00–22:00 and 1.0x outside peak hours.
- [ ] Rx prescription validation blocks checkout without Rx attachment.
- [ ] Redis GEO dispatch telemetry payload contains valid numeric latitude and longitude coordinates.
- [ ] Test execution report is generated with complete coverage breakdown for TC-AUTH, TC-CUST, TC-PROV, TC-DRV, TC-ADM, and TC-SUP.

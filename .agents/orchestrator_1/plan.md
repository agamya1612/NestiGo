# NestiGo QA Test Suite Implementation Plan

## Objective
Build and execute an automated hybrid QA test suite for NestiGo across all 5 platform portals (Customer, Provider, Driver, Admin, Support) and 15 microservices, implementing Vitest service contract tests and Playwright E2E tests, verifying WebSockets, generating comprehensive test reports, and ensuring 100% test pass rates per the acceptance criteria.

## Phase 0: Survey & Discovery (Parallel Explorers)
- Explorer 1 (Frontend & Service Layer): Explore frontend directory, services, state management, Vitest setup, portal routing, mocks, existing test setup.
- Explorer 2 (Backend & Microservices & APIs): Explore backend microservices (15 services), API endpoints, contracts, GoTrue auth, Redis GEO, Postgres schema, WebSocket gateways (:3005, :3009).
- Explorer 3 (QA & Testing Architecture): Explore existing Playwright/Vitest configs, test runners, coverage reporters, dependencies, script entries in package.json.

## Phase 1: Architecture & PROJECT.md Formulation
- Synthesize findings into `PROJECT.md` at root.
- Define feature inventory (TC-AUTH, TC-CUST, TC-PROV, TC-DRV, TC-ADM, TC-SUP, E2E flows, WebSockets, reporting).
- Establish milestone breakdown and interface contracts.

## Phase 2: Implementation & Execution
- Milestone 1: Vitest Service Contract Test Suites (TC-AUTH, TC-CUST, TC-PROV, TC-DRV, TC-ADM, TC-SUP).
- Milestone 2: E2E User Flow Tests (5 Portals critical paths).
- Milestone 3: Real-Time WebSocket & State Verification (:3005 order updates, :3009 chat).
- Milestone 4: Test Runner Config, Execution & Automated Report Generation.

## Phase 3: Verification & Auditing
- Reviewers verify coverage, assertions, and test quality.
- Challengers empirically verify test execution, edge cases, surge pricing (1.5x peak 18-22 vs 1.0x off-peak), Rx attachment gating, Redis GEO coordinates.
- Forensic Auditor confirms zero integrity violations.
- Validate 100% test pass rates.

## Phase 4: Final Reporting & Handoff
- Generate final summary and send completion message to Sentinel.

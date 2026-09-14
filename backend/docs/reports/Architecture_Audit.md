# NestiGo Architecture Audit Report

This report provides a gap analysis of the 15 microservices against the 31 functional requirements outlined in `nestigo-requirements-architecture.md`.

## 1. admin-service
- [ ] FR18: View, search, and filter all orders across verticals - **Partially Implemented** (`services/admin-service/index.js`) - GET `/api/admin/orders` exists but missing search/filter.
- [ ] FR19: Manually reassign, cancel, or refund an order - **Missing**
- [x] FR21: Approve pharma orders requiring prescription verification - **Fully Implemented** (`services/admin-service/index.js`)
- [ ] FR22: Manage catalog items and pricing per category - **Missing**
- [ ] FR23: View and resolve disputes - **Partially Implemented** (`services/admin-service/index.js`) - Resolve exists, view missing.
- [ ] FR24: View notification delivery logs - **Missing**
- [ ] FR25: View business analytics - **Missing**
- [ ] FR26: Manage which categories/verticals are active per city - **Missing**

## 2. api-gateway
- Acts as a proxy and handles authentication (`services/api-gateway/index.js`). Supports overall system routing.

## 3. audit-service
- Subscribes to events for auditing purposes (`services/audit-service/index.js`).

## 4. catalog-service
- [x] FR1: Browse catalog by category - **Fully Implemented** (`services/catalog-service/index.js`)
- [ ] FR2: Search and filter items/services - **Missing**

## 5. chat-service
- Supports out-of-band communication (`services/chat-service/index.js`).

## 6. dispatch-service
- [ ] FR12: Set availability, service categories, and city/zone of operation - **Partially Implemented** (`services/dispatch-service/index.js`) - Location update exists, but not full availability settings.
- [x] FR27: On order payment confirmation → notify all eligible providers - **Fully Implemented** (`services/dispatch-service/index.js`) - Dispatches `provider.assignment.offered`.

## 7. kyc-service
- [x] FR11: Register and submit KYC documents - **Fully Implemented** (`services/kyc-service/index.js`)
- [x] FR20: Approve or reject provider KYC submissions - **Fully Implemented** (`services/kyc-service/index.js`)

## 8. ledger-service
- [ ] FR17: View earnings and payout history - **Partially Implemented** (`services/ledger-service/index.js`) - Wallet balance view exists, history missing.

## 9. notification-service
- [ ] FR10: Receive notifications (SMS/email/push) - **Partially Implemented** (`services/notification-service/index.js`) - Mock SMS only.
- [x] FR13: Receive notification when a new order matching their category/zone is placed - **Fully Implemented** (`services/notification-service/index.js`)

## 10. order-service
- [ ] FR3: Add items/services to cart, schedule a time slot - **Partially Implemented** (`services/order-service/index.js`) - Order creation exists, cart/scheduling missing.
- [ ] FR5: View real-time order status - **Partially Implemented** (`services/order-service/index.js`)
- [ ] FR6: View order history and re-order - **Partially Implemented** (`services/order-service/index.js`) - History exists, re-order missing.
- [x] FR7: Cancel an order before provider pickup/start - **Fully Implemented** (`services/order-service/index.js`)
- [ ] FR9: Upload prescription at checkout for pharma orders - **Partially Implemented** (`services/order-service/index.js`) - Status set to pending, but no upload logic.
- [x] FR15: Mark order as "picked up" / "in progress" - **Fully Implemented** (`services/order-service/index.js`)
- [ ] FR16: Mark order as "completed", optionally attaching completion proof photos - **Partially Implemented** (`services/order-service/index.js`) - Status update exists, photo logic missing.

## 11. payment-service
- [ ] FR4: Checkout and pay via Razorpay - **Partially Implemented** (`services/payment-service/index.js`) - Webhook exists, checkout init missing.
- [ ] FR30: On provider marking completed → notify admin for payout - **Partially Implemented** (`services/payment-service/index.js`) - Settlement processed, notification missing.

## 12. pricing-service
- Calculates order totals, surge pricing, and discounts (`services/pricing-service/index.js`).

## 13. review-service
- [x] FR8: Rate and review provider after completion - **Fully Implemented** (`services/review-service/index.js`)

## 14. user-service
- Handles user profiles and delegates KYC submissions (`services/user-service/index.js`).

## 15. websocket-service
- [ ] FR5: View real-time order status - **Partially Implemented** (`services/websocket-service/index.js`)

## Missing Features (No explicit logic mapped in any service)
- [ ] FR14: Accept or decline an offered order within a response window
- [ ] FR28: On provider accepting → notify customer, withdraw offer
- [ ] FR29: On provider marking picked up/in progress → notify customer
- [ ] FR31: If no provider accepts within a configurable timeout → escalate

# NestiGo — Requirements & Architecture

A super-app for home services, 10-minute grocery, city delivery, and home shifting — architected so bakery, pharma, or any future vertical can be added as configuration, not new code.

---

## 1. Functional Requirements

### 1.1 Customer
- FR1: Browse catalog by category (electrician, plumbing, cleaning, salon, home chef, grocery, bakery*, pharma*, shifting)
- FR2: Search and filter items/services by city, price, availability, rating
- FR3: Add items/services to cart, schedule a time slot where applicable (services, bakery pre-orders)
- FR4: Checkout and pay via Razorpay
- FR5: View real-time order status (placed → confirmed → picked up/in progress → completed)
- FR6: View order history and re-order
- FR7: Cancel an order before provider pickup/start, and receive a refund where applicable
- FR8: Rate and review provider after completion
- FR9: Upload prescription at checkout for pharma orders (pending pharmacist verification before fulfillment)
- FR10: Receive notifications (SMS/email/push) for order confirmation, provider assignment, status changes, OTP

### 1.2 Provider
- FR11: Register and submit KYC documents; see approval status
- FR12: Set availability, service categories, and city/zone of operation
- FR13: Receive notification when a new order matching their category/zone is placed
- FR14: Accept or decline an offered order within a response window
- FR15: Mark order as "picked up" / "in progress"
- FR16: Mark order as "completed", optionally attaching completion proof photos
- FR17: View earnings and payout history

### 1.3 Admin / Ops
- FR18: View, search, and filter all orders across verticals
- FR19: Manually reassign, cancel, or refund an order
- FR20: Approve or reject provider KYC submissions
- FR21: Approve pharma orders requiring prescription verification
- FR22: Manage catalog items and pricing per category (add/edit/deactivate) without a deploy
- FR23: View and resolve disputes
- FR24: View notification delivery logs (sent/failed) per order
- FR25: View business analytics (orders by vertical, city, revenue, provider performance)
- FR26: Manage which categories/verticals are active per city (staged rollout of bakery/pharma)

### 1.4 Notification service (explicit workflow)
- FR27: On order payment confirmation → notify all eligible providers in category+zone that a new order is available
- FR28: On provider accepting → notify customer "provider assigned," and withdraw the offer from other providers
- FR29: On provider marking picked up/in progress → notify customer
- FR30: On provider marking completed → notify **both** customer (rating prompt) and **admin** (for payout/quality tracking)
- FR31: If no provider accepts within a configurable timeout → escalate: notify next tier of providers, then notify admin for manual assignment

*bakery/pharma ship as new categories on the existing schema, described in section 4.

---

## 2. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Catalog browse < 300ms p95 (via indexed Postgres queries + React Query cache); checkout-to-payment-init < 2s |
| **Scalability** | Support new verticals via configuration, not schema changes; DB and edge functions must handle city-by-city rollout without redesign |
| **Availability** | Payment and order-status paths target 99.9% uptime; webhook processing must be idempotent and retry-safe |
| **Security** | RLS enforced on every table; no client-trusted amounts; KYC/prescription docs in private storage buckets with signed URLs only |
| **Compliance** | Pharma: prescription-required flag enforced server-side, pharmacist verification step mandatory before fulfillment (India's drug sale regulations require licensed dispensing — do not treat this as optional even at MVP) |
| **Data integrity** | Order amount is always server-computed; payment confirmation always reconciled against a stored order, never trusted from client |
| **Observability** | Every payment and notification event logged with outcome (sent/failed, matched/mismatched) for audit |
| **Maintainability** | Catalog and pricing changes must be possible by non-engineers via the admin panel |
| **Localization** | INR currency, Indian phone number formats for SMS/OTP, city-based service availability |
| **Cost efficiency** | Avoid always-on infra for low-frequency tasks (use edge functions, not dedicated servers, until volume demands otherwise) |

---

## 3. Database Architecture (extensible by design)

The core idea: **one polymorphic catalog and order model**, differentiated by `category`, not by separate tables per vertical.

```
categories
  id, name, slug, vertical_type ('service' | 'retail' | 'pharma' | 'shifting'),
  requires_scheduling (bool), requires_prescription (bool), active, city_availability (jsonb)

catalog_items
  id, category_id -> categories, name, description, price, unit,
  requires_prescription (bool, inherited default from category, overridable),
  active, created_at, updated_at

inventory
  id, catalog_item_id -> catalog_items, location_id (dark store / pharmacy / bakery outlet),
  stock_qty, updated_at
  -- used by grocery, bakery, pharma; ignored by pure services

provider_profiles
  id, user_id -> profiles, kyc_status, city, zones (jsonb), rating, active

provider_categories   -- junction: which verticals/categories a provider can fulfill
  provider_id -> provider_profiles, category_id -> categories

orders
  id, customer_id -> profiles, order_type (category slug or 'mixed'),
  status ('pending_payment'|'paid'|'confirmed'|'picked_up'|'in_progress'|'completed'|'cancelled'|'refunded'),
  amount_total (server-computed), currency, razorpay_order_id, razorpay_payment_id,
  address (jsonb), scheduled_at, prescription_status ('n/a'|'pending'|'verified'|'rejected'),
  created_at, updated_at

order_items
  id, order_id -> orders, catalog_item_id -> catalog_items, quantity, unit_price, provider_id (nullable)

order_status_history
  id, order_id -> orders, status, changed_by, changed_at
  -- audit trail; also the trigger source for notifications

provider_assignments
  id, order_id -> orders, provider_id -> provider_profiles,
  status ('offered'|'accepted'|'declined'|'expired'|'picked_up'|'completed'),
  offered_at, responded_at

payment_events
  id, order_id -> orders, event_type, payload (jsonb), created_at

notifications
  id, user_id, order_id (nullable), type, channel ('sms'|'email'|'push'),
  payload (jsonb), status ('pending'|'sent'|'failed'), created_at

disputes
  id, order_id -> orders, raised_by, reason, status, resolution_notes, created_at
```

**Why this scales to bakery/pharma without new tables:**
- Adding bakery = one new row in `categories` (`vertical_type = 'retail'`, `requires_scheduling = true` for pre-orders) + new rows in `catalog_items`. No migration.
- Adding pharma = one new row in `categories` (`requires_prescription = true`) + `orders.prescription_status` workflow already exists in the schema. The only *new* build is the pharmacist-verification screen in admin — the data model already supports it.
- Provider-fulfilled verticals (electrician, home chef) vs. inventory-fulfilled verticals (grocery, bakery, pharma) both flow through the same `orders`/`order_items`/`inventory` tables — `provider_id` is simply null for pure retail line items.

---

## 4. Scalable Service Architecture

Structure backend logic as discrete edge functions now (cheap on Supabase, no infra to manage), organized so each can be split into a standalone microservice later if volume demands it:

| Service | Responsibility | Scale trigger to extract |
|---|---|---|
| **Catalog service** | CRUD for categories/catalog_items/inventory, read-heavy | High read volume → add caching layer / CDN for catalog reads |
| **Order service** | `create-order`, amount computation, order_items | Order volume growth → dedicated service with queue |
| **Payment service** | `create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`, `cancel-order` | Rarely needs extraction; keep tightly coupled to orders for consistency |
| **Dispatch service** | Matches orders to eligible providers by category+zone, manages `provider_assignments`, timeout/escalation logic | High provider volume / geolocation complexity → dedicated service with a real matching algorithm (currently rule-based) |
| **Notification service** | `send-notification`, template management, multi-channel delivery, retry on failure | High notification volume → move to a queue-backed worker instead of synchronous edge function calls |
| **Admin service** | Aggregated views, approvals, dispute resolution — mostly reads plus privileged writes gated by `has_role()` | Rarely needs extraction |

This keeps you on Supabase edge functions through most of your growth curve, with a clear extraction point identified per service rather than a premature microservices split.

---

## 5. Admin Setup

**Roles** (extend your existing `has_role()` pattern):
- `super_admin` — full access, including role management
- `ops_admin` — orders, disputes, refunds, provider approval
- `category_manager` — catalog/pricing management, scoped optionally to specific categories (e.g. a pharma-only category manager who can't touch electrician pricing)
- `support_agent` — read-only order/customer view, can raise disputes

**Admin dashboard modules:**
1. **Orders** — all orders, filterable by category/status/city, manual reassignment/cancel/refund
2. **Providers** — KYC approval queue (view signed doc URLs), category/zone assignment, active/suspended toggle
3. **Catalog** — add/edit/deactivate categories and items per vertical, city availability toggle (used to stage bakery/pharma rollout city by city)
4. **Prescriptions** — pharma-specific queue: view uploaded prescription, approve/reject before fulfillment
5. **Disputes** — view/resolve, linked to order and payment_events
6. **Notifications log** — delivery status per event, useful for debugging "customer says they didn't get SMS"
7. **Analytics** — orders/revenue by vertical and city, provider response-time and completion-rate

---

## 6. Notification Service — the exact flow you described

```
Order paid (webhook confirms)
   │
   ▼
Dispatch service creates provider_assignments rows
(status='offered') for eligible providers in category+zone
   │
   ▼
send-notification → SMS/push to each offered provider:
"New order available — [category] — [zone] — tap to accept"
   │
   ├── Provider accepts ──▶ assignment.status='accepted', order.status='confirmed'
   │                        other offered assignments → 'expired'
   │                        notify customer: "Provider assigned"
   │
   └── No response within timeout ──▶ escalate to next provider tier
                                       (or notify admin if none available)

Provider marks "picked up" ──▶ order.status='picked_up'
                                 notify customer

Provider marks "completed" ──▶ order.status='completed'
                                 notify customer (rating prompt)
                                 notify admin (payout + QA tracking)   ◀── FR30
```

Every step writes to `order_status_history` (audit) and `notifications` (delivery tracking), so admin can always answer "where is this order and who was notified."

---

## 7. Suggested build order

1. Orders/payments hardening (already scoped in the previous Lovable prompt)
2. `provider_assignments` + dispatch logic + notification triggers (this session's ask)
3. Admin panel (orders, providers, catalog)
4. Categories/catalog_items generalization (migrate current static services + add bakery as first proof of the pattern)
5. Pharma (adds prescription workflow on top of the now-proven category pattern)

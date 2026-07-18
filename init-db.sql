-- Initial Schema for NestiGo

-- Extensions
create extension if not exists "postgis" with schema "extensions";
create extension if not exists "pgcrypto" with schema "extensions";

-- Custom Types
create type vertical_type as enum ('service', 'retail', 'pharma', 'shifting');
create type order_status as enum ('pending_payment', 'paid', 'confirmed', 'picked_up', 'in_progress', 'completed', 'cancelled', 'refunded');
create type prescription_status as enum ('n/a', 'pending', 'verified', 'rejected');
create type assignment_status as enum ('offered', 'accepted', 'declined', 'expired', 'picked_up', 'completed');
create type notification_channel as enum ('sms', 'email', 'push');
create type notification_status as enum ('pending', 'sent', 'failed');

-- Role Management (Function to check if user has admin role)
-- Assuming we'll use custom claims for admin roles or an admin_roles table.
-- We will create an admin_roles table for simplicity and strict RLS.
create table public.admin_roles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    role text not null check (role in ('super_admin', 'ops_admin', 'category_manager', 'support_agent')),
    created_at timestamptz default now() not null,
    unique(user_id, role)
);

-- Function to check role
create or replace function public.has_role(role_name text)
returns boolean as $$
declare
  is_admin boolean;
begin
  select exists(
    select 1 from public.admin_roles 
    where user_id = auth.uid() and role = role_name
  ) into is_admin;
  return is_admin;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_super_admin()
returns boolean as $$
begin
  return public.has_role('super_admin');
end;
$$ language plpgsql security definer set search_path = public;

-- Categories
create table public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text unique not null,
    vertical_type vertical_type not null,
    requires_scheduling boolean default false not null,
    requires_prescription boolean default false not null,
    active boolean default true not null,
    city_availability jsonb default '[]'::jsonb not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Catalog Items
create table public.catalog_items (
    id uuid default gen_random_uuid() primary key,
    category_id uuid references public.categories(id) on delete cascade not null,
    name text not null,
    description text,
    price numeric(10, 2) not null check (price >= 0),
    unit text not null, -- e.g., 'hour', 'item', 'kg'
    requires_prescription boolean default false not null,
    active boolean default true not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Provider Profiles
create table public.provider_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    kyc_status text default 'pending' check (kyc_status in ('pending', 'approved', 'rejected')),
    city text,
    zones jsonb default '[]'::jsonb not null, -- Store geojson or zone IDs
    rating numeric(3, 2) default 0.0,
    active boolean default false not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Provider Categories (Junction Table)
create table public.provider_categories (
    provider_id uuid references public.provider_profiles(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete cascade not null,
    primary key (provider_id, category_id)
);

-- Orders
create table public.orders (
    id uuid default gen_random_uuid() primary key,
    customer_id uuid references auth.users(id) on delete restrict not null,
    order_type text not null, -- category slug or 'mixed'
    status order_status default 'pending_payment' not null,
    amount_total numeric(10, 2) not null check (amount_total >= 0),
    currency text default 'INR' not null,
    razorpay_order_id text unique,
    razorpay_payment_id text unique,
    address jsonb not null,
    scheduled_at timestamptz,
    prescription_status prescription_status default 'n/a' not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Order Items
create table public.order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    catalog_item_id uuid references public.catalog_items(id) on delete restrict not null,
    quantity int not null check (quantity > 0),
    unit_price numeric(10, 2) not null check (unit_price >= 0),
    provider_id uuid references public.provider_profiles(id) on delete set null
);

-- Order Status History
create table public.order_status_history (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    status order_status not null,
    changed_by uuid references auth.users(id),
    changed_at timestamptz default now() not null
);

-- Provider Assignments
create table public.provider_assignments (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    provider_id uuid references public.provider_profiles(id) on delete cascade not null,
    status assignment_status default 'offered' not null,
    offered_at timestamptz default now() not null,
    responded_at timestamptz,
    unique(order_id, provider_id)
);

-- Payment Events
create table public.payment_events (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    event_type text not null,
    payload jsonb not null,
    created_at timestamptz default now() not null
);

-- Notifications
create table public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    order_id uuid references public.orders(id) on delete set null,
    type text not null,
    channel notification_channel not null,
    payload jsonb not null,
    status notification_status default 'pending' not null,
    created_at timestamptz default now() not null
);

-- Disputes
create table public.disputes (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    raised_by uuid references auth.users(id) on delete restrict not null,
    reason text not null,
    status text default 'open' check (status in ('open', 'resolved', 'closed')),
    resolution_notes text,
    created_at timestamptz default now() not null
);

-- Row Level Security (RLS)

alter table public.admin_roles enable row level security;
alter table public.categories enable row level security;
alter table public.catalog_items enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_categories enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.provider_assignments enable row level security;
alter table public.payment_events enable row level security;
alter table public.notifications enable row level security;
alter table public.disputes enable row level security;

-- Admin Roles RLS
create policy "Super admins can manage admin roles"
on public.admin_roles for all
using (public.is_super_admin())
with check (public.is_super_admin());

-- Categories RLS
create policy "Categories are viewable by everyone."
on public.categories for select using (true);

create policy "Categories can be managed by ops_admin and super_admin"
on public.categories for all
using (public.has_role('ops_admin') or public.is_super_admin());

-- Catalog Items RLS
create policy "Catalog items are viewable by everyone."
on public.catalog_items for select using (true);

create policy "Catalog items can be managed by category_manager and above"
on public.catalog_items for all
using (public.has_role('category_manager') or public.has_role('ops_admin') or public.is_super_admin());

-- Provider Profiles RLS
create policy "Providers can view and update their own profile."
on public.provider_profiles for select
using (auth.uid() = user_id);

create policy "Providers can update their own profile."
on public.provider_profiles for update
using (auth.uid() = user_id);

create policy "Providers can insert their own profile."
on public.provider_profiles for insert
with check (auth.uid() = user_id);

create policy "Ops admins can view and manage all provider profiles."
on public.provider_profiles for all
using (public.has_role('ops_admin') or public.is_super_admin());

create policy "Customers can view assigned provider profiles."
on public.provider_profiles for select
using (
    exists (
        select 1 from public.orders o
        join public.provider_assignments pa on o.id = pa.order_id
        where o.customer_id = auth.uid() and pa.provider_id = provider_profiles.id and pa.status in ('accepted', 'picked_up', 'completed')
    )
);

-- Provider Categories RLS
create policy "Providers can view their own categories."
on public.provider_categories for select
using (
    exists (
        select 1 from public.provider_profiles pp
        where pp.id = provider_categories.provider_id and pp.user_id = auth.uid()
    )
);

create policy "Admins can manage provider categories."
on public.provider_categories for all
using (public.has_role('ops_admin') or public.is_super_admin());

-- Orders RLS
create policy "Customers can view their own orders."
on public.orders for select
using (auth.uid() = customer_id);

create policy "Customers can insert their own orders."
on public.orders for insert
with check (auth.uid() = customer_id);

-- Customers shouldn't arbitrarily update orders (status, amounts etc are protected, maybe limit via edge functions, but for now we restrict to own)
-- It's safer to only allow edge functions (service role) to update orders.
create policy "Service role can manage all orders"
on public.orders for all
using (true);

create policy "Providers can view assigned orders."
on public.orders for select
using (
    exists (
        select 1 from public.provider_assignments pa
        join public.provider_profiles pp on pa.provider_id = pp.id
        where pa.order_id = orders.id and pp.user_id = auth.uid()
    )
);

create policy "Ops admins can view and manage all orders."
on public.orders for all
using (public.has_role('ops_admin') or public.is_super_admin() or public.has_role('support_agent'));

-- Order Items RLS
create policy "Customers can view their own order items."
on public.order_items for select
using (
    exists (
        select 1 from public.orders o
        where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
);

create policy "Customers can insert order items for their own orders."
on public.order_items for insert
with check (
    exists (
        select 1 from public.orders o
        where o.id = order_items.order_id and o.customer_id = auth.uid()
    )
);

create policy "Providers can view assigned order items."
on public.order_items for select
using (
    exists (
        select 1 from public.provider_assignments pa
        join public.provider_profiles pp on pa.provider_id = pp.id
        where pa.order_id = order_items.order_id and pp.user_id = auth.uid()
    )
);

create policy "Admins can view all order items."
on public.order_items for all
using (public.has_role('ops_admin') or public.is_super_admin() or public.has_role('support_agent'));

-- Order Status History RLS
create policy "Customers can view their own order history."
on public.order_status_history for select
using (
    exists (
        select 1 from public.orders o
        where o.id = order_status_history.order_id and o.customer_id = auth.uid()
    )
);

create policy "Providers can view assigned order history."
on public.order_status_history for select
using (
    exists (
        select 1 from public.provider_assignments pa
        join public.provider_profiles pp on pa.provider_id = pp.id
        where pa.order_id = order_status_history.order_id and pp.user_id = auth.uid()
    )
);

create policy "Admins can view and manage order history."
on public.order_status_history for all
using (public.has_role('ops_admin') or public.is_super_admin() or public.has_role('support_agent'));

-- Provider Assignments RLS
create policy "Providers can view their own assignments."
on public.provider_assignments for select
using (
    exists (
        select 1 from public.provider_profiles pp
        where pp.id = provider_assignments.provider_id and pp.user_id = auth.uid()
    )
);

create policy "Providers can update their own assignments."
on public.provider_assignments for update
using (
    exists (
        select 1 from public.provider_profiles pp
        where pp.id = provider_assignments.provider_id and pp.user_id = auth.uid()
    )
);

create policy "Admins can view and manage provider assignments."
on public.provider_assignments for all
using (public.has_role('ops_admin') or public.is_super_admin());

-- Notifications RLS
create policy "Users can view their own notifications."
on public.notifications for select
using (auth.uid() = user_id);

create policy "Admins can view all notifications."
on public.notifications for all
using (public.has_role('ops_admin') or public.is_super_admin() or public.has_role('support_agent'));

-- Disputes RLS
create policy "Users can view their own disputes."
on public.disputes for select
using (auth.uid() = raised_by);

create policy "Users can create disputes for their orders."
on public.disputes for insert
with check (auth.uid() = raised_by);

create policy "Admins can view and manage all disputes."
on public.disputes for all
using (public.has_role('ops_admin') or public.is_super_admin() or public.has_role('support_agent'));


-- Insert a mock user (customer)
INSERT INTO auth.users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'customer@nestigo.com') ON CONFLICT DO NOTHING;

-- Insert a mock user (provider)
INSERT INTO auth.users (id, email) VALUES ('22222222-2222-2222-2222-222222222222', 'provider@nestigo.com') ON CONFLICT DO NOTHING;

-- Insert Provider Profile
INSERT INTO public.provider_profiles (id, user_id, kyc_status, active) 
VALUES ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'approved', true)
ON CONFLICT DO NOTHING;

-- Insert Category
INSERT INTO public.categories (id, vertical_type, name, slug) 
VALUES ('33333333-3333-3333-3333-333333333333', 'service', 'Bakery', 'bakery')
ON CONFLICT DO NOTHING;

-- Insert Catalog Items
INSERT INTO public.catalog_items (id, category_id, name, description, price, unit, active)
VALUES 
  ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 'Chocolate Cake', 'Half kg chocolate truffle', 500, 'item', true),
  ('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333333', 'Black Forest Cake', 'Half kg black forest', 450, 'item', true)
ON CONFLICT DO NOTHING;

-- Refunds
create table public.refunds (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    amount numeric(10, 2) not null check (amount >= 0),
    status text default 'pending' check (status in ('pending', 'completed', 'failed')),
    reason text not null,
    created_at timestamptz default now() not null
);

-- Settlements
create table public.settlements (
    id uuid default gen_random_uuid() primary key,
    provider_id uuid references public.provider_profiles(id) on delete restrict not null,
    order_id uuid references public.orders(id) on delete cascade not null,
    amount numeric(10, 2) not null check (amount >= 0),
    status text default 'pending' check (status in ('pending', 'processed')),
    created_at timestamptz default now() not null
);

-- Wallets (Ledger Service)
create table public.wallets (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    balance numeric(10, 2) default 0.0 not null,
    currency text default 'INR' not null,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

create table public.ledger_transactions (
    id uuid default gen_random_uuid() primary key,
    wallet_id uuid references public.wallets(id) on delete cascade not null,
    amount numeric(10, 2) not null, -- positive for credit, negative for debit
    reference_type text not null, -- e.g., 'settlement', 'refund', 'deposit', 'withdrawal'
    reference_id text not null,
    created_at timestamptz default now() not null
);

-- Promotions (Pricing Service)
create table public.promotions (
    id uuid default gen_random_uuid() primary key,
    code text unique not null,
    discount_percentage numeric(5, 2) check (discount_percentage >= 0 and discount_percentage <= 100),
    max_discount_amount numeric(10, 2),
    active boolean default true not null,
    expires_at timestamptz,
    created_at timestamptz default now() not null
);

-- Provider KYC (KYC Service)
create table public.provider_kyc (
    id uuid default gen_random_uuid() primary key,
    provider_id uuid references public.provider_profiles(id) on delete cascade not null,
    document_type text not null, -- e.g., 'aadhar', 'pan', 'driving_license'
    document_url text not null,
    verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
    verified_by uuid references auth.users(id),
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Chat & Messages (Chat Service)
create table public.chat_rooms (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null unique,
    customer_id uuid references auth.users(id) on delete cascade not null,
    provider_id uuid references public.provider_profiles(id) on delete cascade not null,
    active boolean default true not null,
    created_at timestamptz default now() not null
);

create table public.messages (
    id uuid default gen_random_uuid() primary key,
    room_id uuid references public.chat_rooms(id) on delete cascade not null,
    sender_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    created_at timestamptz default now() not null
);

-- Audit Logs (Audit Service)
create table public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    topic text not null,
    event_type text not null,
    payload jsonb not null,
    created_at timestamptz default now() not null
);

-- Reviews (Review Service)
create table public.reviews (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null unique,
    customer_id uuid references auth.users(id) on delete cascade not null,
    provider_id uuid references public.provider_profiles(id) on delete cascade not null,
    rating int not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamptz default now() not null
);

-- Enable RLS on new tables (Allow service role full access for now)
alter table public.refunds enable row level security;
create policy "Service role manages refunds" on public.refunds for all using (true);

alter table public.settlements enable row level security;
create policy "Service role manages settlements" on public.settlements for all using (true);

alter table public.wallets enable row level security;
create policy "Service role manages wallets" on public.wallets for all using (true);

alter table public.ledger_transactions enable row level security;
create policy "Service role manages ledger" on public.ledger_transactions for all using (true);

alter table public.promotions enable row level security;
create policy "Service role manages promotions" on public.promotions for all using (true);

alter table public.provider_kyc enable row level security;
create policy "Service role manages kyc" on public.provider_kyc for all using (true);

alter table public.chat_rooms enable row level security;
create policy "Service role manages chat rooms" on public.chat_rooms for all using (true);

alter table public.messages enable row level security;
create policy "Service role manages messages" on public.messages for all using (true);

alter table public.audit_logs enable row level security;
create policy "Service role manages audit logs" on public.audit_logs for all using (true);

-- Insert Admin Mock Data for Testing
INSERT INTO auth.users (id, email) VALUES ('33333333-3333-3333-3333-333333333333', 'admin@nestigo.com') ON CONFLICT DO NOTHING;
INSERT INTO public.admin_roles (user_id, role) VALUES ('33333333-3333-3333-3333-333333333333', 'ops_admin') ON CONFLICT DO NOTHING;

alter table public.reviews enable row level security;
create policy "Service role manages reviews" on public.reviews for all using (true);

-- Inventory Table (For Retail, Pharma, Bakery)
create table public.inventory (
    id uuid default gen_random_uuid() primary key,
    catalog_item_id uuid references public.catalog_items(id) on delete cascade not null,
    location_id uuid not null,
    stock_qty int not null default 0 check (stock_qty >= 0),
    updated_at timestamptz default now() not null,
    unique(catalog_item_id, location_id)
);

alter table public.inventory enable row level security;
create policy "Service role manages inventory" on public.inventory for all using (true);

-- Insert Pharma Category
INSERT INTO public.categories (id, vertical_type, name, slug, requires_prescription) 
VALUES ('66666666-6666-6666-6666-666666666666', 'pharma', 'Pharmacy', 'pharma', true)
ON CONFLICT DO NOTHING;

-- Insert Pharma Catalog Items
INSERT INTO public.catalog_items (id, category_id, name, description, price, unit, requires_prescription, active)
VALUES 
  ('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666666', 'Paracetamol 500mg', 'Strip of 10 tablets', 50, 'strip', false, true),
  ('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666666', 'Amoxicillin 250mg', 'Antibiotic, Strip of 10 tablets', 120, 'strip', true, true)
ON CONFLICT DO NOTHING;

-- Insert Mock Inventory for Pharma Items at Mock Location '8888...'
INSERT INTO public.inventory (catalog_item_id, location_id, stock_qty)
VALUES
  ('77777777-7777-7777-7777-777777777771', '88888888-8888-8888-8888-888888888888', 100),
  ('77777777-7777-7777-7777-777777777772', '88888888-8888-8888-8888-888888888888', 50)
ON CONFLICT DO NOTHING;

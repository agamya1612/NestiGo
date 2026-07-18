-- Insert a mock user (customer)
INSERT INTO auth.users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'customer@nestigo.com') ON CONFLICT DO NOTHING;

-- Insert a mock user (provider)
INSERT INTO auth.users (id, email) VALUES ('22222222-2222-2222-2222-222222222222', 'provider@nestigo.com') ON CONFLICT DO NOTHING;

-- Insert Provider Profile
INSERT INTO public.provider_profiles (id, user_id, kyc_status, active) 
VALUES ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'approved', true)
ON CONFLICT DO NOTHING;

-- Insert Categories
INSERT INTO public.categories (id, vertical_type, name, slug) 
VALUES 
  ('33333333-3333-3333-3333-333333333331', 'service', 'Cleaning', 'cleaning'),
  ('33333333-3333-3333-3333-333333333332', 'service', 'Maintenance', 'maintenance'),
  ('33333333-3333-3333-3333-333333333333', 'service', 'Beauty', 'beauty')
ON CONFLICT DO NOTHING;

-- Insert Catalog Items
INSERT INTO public.catalog_items (id, category_id, name, description, price, unit, active)
VALUES 
  ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', 'Deep Home Cleaning', 'Full house deep cleaning including bathrooms and balcony', 1499, 'service', true),
  ('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333331', 'Sofa Cleaning', 'Shampooing and vacuuming of 5-seater sofa', 799, 'service', true),
  ('55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333332', 'AC Servicing', 'Foam jet wash and filter cleaning', 499, 'service', true),
  ('55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333332', 'Plumber Visit', 'Inspection and minor fixes (30 mins)', 199, 'hour', true),
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333332', 'Electrician Visit', 'Switchboard and wiring fixes (30 mins)', 199, 'hour', true),
  ('55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333333', 'Men Haircut', 'At-home grooming and haircut', 399, 'service', true),
  ('55555555-5555-5555-5555-555555555557', '33333333-3333-3333-3333-333333333333', 'Spa Therapy', 'Swedish deep tissue massage (60 mins)', 1299, 'service', true)
ON CONFLICT DO NOTHING;

-- Insert Mock Wallet
INSERT INTO public.wallets (user_id, balance) VALUES ('11111111-1111-1111-1111-111111111111', 5000.00) ON CONFLICT DO NOTHING;
INSERT INTO public.wallets (user_id, balance) VALUES ('22222222-2222-2222-2222-222222222222', 0.00) ON CONFLICT DO NOTHING;

-- Insert Mock Promotion
INSERT INTO public.promotions (code, discount_percentage, max_discount_amount) VALUES ('WELCOME50', 50.00, 200.00) ON CONFLICT DO NOTHING;


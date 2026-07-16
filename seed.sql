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

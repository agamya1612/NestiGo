-- Mock Supabase Auth Schema for Raw Postgres
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL
);

-- Mock auth.uid() function
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
  -- We just return a static test user UUID for local microservice testing.
  -- In production, the microservices shouldn't rely on this anyway because they query DB directly.
  RETURN '00000000-0000-0000-0000-000000000000'::UUID;
END;
$$ LANGUAGE plpgsql;

-- Now include the extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

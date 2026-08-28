/*
# Create shipping_rates table

1. Purpose
   Allow the admin to set per-city shipping charges. Customers at checkout
   get the shipping cost for their selected city automatically. A default
   rate applies when no city-specific rate is found.

2. New Tables
   - `shipping_rates`
     - `id` (uuid, primary key)
     - `city` (text, unique, not null) — the city name, case-insensitive match
     - `rate` (integer, not null) — shipping charge in PKR
     - `is_default` (boolean, default false) — marks the fallback rate
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

3. Security
   - RLS enabled.
   - Public read (anon + authenticated) so checkout can look up rates.
   - Admin-only write (insert/update/delete) via is_admin().

4. Seed Data
   - Default rate: PKR 300
   - Karachi: PKR 200
   - Lahore: PKR 250
   - Islamabad: PKR 250
   - Rawalpindi: PKR 250
   - Peshawar: PKR 400
   - Quetta: PKR 500
*/

CREATE TABLE IF NOT EXISTS shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text UNIQUE NOT NULL,
  rate integer NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_shipping_rates" ON shipping_rates;
CREATE POLICY "public_read_shipping_rates" ON shipping_rates
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admin insert
DROP POLICY IF EXISTS "admin_insert_shipping_rates" ON shipping_rates;
CREATE POLICY "admin_insert_shipping_rates" ON shipping_rates
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- Admin update
DROP POLICY IF EXISTS "admin_update_shipping_rates" ON shipping_rates;
CREATE POLICY "admin_update_shipping_rates" ON shipping_rates
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin delete
DROP POLICY IF EXISTS "admin_delete_shipping_rates" ON shipping_rates;
CREATE POLICY "admin_delete_shipping_rates" ON shipping_rates
  FOR DELETE TO authenticated
  USING (is_admin());

-- Seed data
INSERT INTO shipping_rates (city, rate, is_default) VALUES
  ('Default', 300, true),
  ('Karachi', 200, false),
  ('Lahore', 250, false),
  ('Islamabad', 250, false),
  ('Rawalpindi', 250, false),
  ('Peshawar', 400, false),
  ('Quetta', 500, false)
ON CONFLICT (city) DO NOTHING;

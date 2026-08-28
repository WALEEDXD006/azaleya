/*
# Create product reviews table

1. Purpose
   Allow customers to leave star ratings and written reviews on products.
   Reviews are displayed on the product detail page and the homepage.

2. New Tables
   - `product_reviews`
     - `id` (uuid, primary key)
     - `product_id` (uuid, FK to products, not null)
     - `user_id` (uuid, FK to auth.users, nullable — guests can review)
     - `user_name` (text, not null) — display name of reviewer
     - `rating` (integer 1-5, not null)
     - `title` (text, not null)
     - `body` (text, nullable)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

3. Security
   - RLS enabled.
   - Public read (anon + authenticated) so anyone can see reviews.
   - Anyone (anon + authenticated) can insert reviews.
   - Users can update/delete their own reviews (authenticated only).
*/

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  body text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "public_read_product_reviews" ON product_reviews;
CREATE POLICY "public_read_product_reviews" ON product_reviews
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anyone can insert reviews
DROP POLICY IF EXISTS "anyone_insert_product_reviews" ON product_reviews;
CREATE POLICY "anyone_insert_product_reviews" ON product_reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Users can update their own reviews
DROP POLICY IF EXISTS "user_update_own_review" ON product_reviews;
CREATE POLICY "user_update_own_review" ON product_reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
DROP POLICY IF EXISTS "user_delete_own_review" ON product_reviews;
CREATE POLICY "user_delete_own_review" ON product_reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

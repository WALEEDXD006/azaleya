/*
# Create product-images storage bucket

1. Purpose
   Allow admins to upload product images to Supabase Storage instead of using
   external image URLs. The bucket is public-readable so storefront visitors
   can load product images without authentication.

2. Storage
   - New bucket `product-images` (public = true).
   - Public read: anyone (anon + authenticated) can SELECT / download.
   - Authenticated write: only admin users (via is_admin()) can INSERT / UPDATE / DELETE.

3. Security
   - RLS on storage.objects for the product-images bucket.
   - Read: public (TO anon, authenticated USING true).
   - Write: admin-only (TO authenticated USING is_admin() WITH CHECK is_admin()).
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Admin insert
DROP POLICY IF EXISTS "admin_insert_product_images" ON storage.objects;
CREATE POLICY "admin_insert_product_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- Admin update
DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin())
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

-- Admin delete
DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

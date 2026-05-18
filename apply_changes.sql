-- 1. Add unit column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'Unit';

-- 2. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Set up storage policies for the bucket
-- Allow public viewing of images
CREATE POLICY "Public Access to Product Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

-- Allow authenticated sellers to upload images
CREATE POLICY "Sellers can upload images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product-images');

-- Allow sellers to update and delete their own images
CREATE POLICY "Sellers can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid());

CREATE POLICY "Sellers can delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND owner = auth.uid());

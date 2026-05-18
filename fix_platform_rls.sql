-- FIX 1: Add missing policies for categories table since RLS is enabled
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create categories" 
ON public.categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- FIX 2: Explicit INSERT policy for products to fix new listing publication issues
CREATE POLICY "Owners can insert their products" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_id AND companies.owner_id = auth.uid()
  )
);

-- FIX 3: Fix Row-Level Security for notifications when inquiries are made
CREATE POLICY "Allow authenticated users to insert notifications" 
ON public.notifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

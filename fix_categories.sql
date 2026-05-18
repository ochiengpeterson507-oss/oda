-- Add missing policies for categories table
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create categories" 
ON public.categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Explicit INSERT policy for products just to be safe
CREATE POLICY "Owners can insert their products" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = company_id AND companies.owner_id = auth.uid()
  )
);

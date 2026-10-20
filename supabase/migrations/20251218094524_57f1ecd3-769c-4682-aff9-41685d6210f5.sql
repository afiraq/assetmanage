-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can update assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can delete assets" ON public.assets;

-- Create new policies allowing all authenticated users
CREATE POLICY "Authenticated users can insert assets" 
ON public.assets 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update assets" 
ON public.assets 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete assets" 
ON public.assets 
FOR DELETE 
TO authenticated
USING (auth.uid() IS NOT NULL);
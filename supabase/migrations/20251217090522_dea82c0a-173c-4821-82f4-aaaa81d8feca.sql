-- Create staff table for employees who can be assigned assets but don't need login access
CREATE TABLE public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  employee_id text,
  department text,
  position text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all active staff
CREATE POLICY "Authenticated users can view staff"
ON public.staff
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert staff
CREATE POLICY "Admins can insert staff"
ON public.staff
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update staff
CREATE POLICY "Admins can update staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete staff
CREATE POLICY "Admins can delete staff"
ON public.staff
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
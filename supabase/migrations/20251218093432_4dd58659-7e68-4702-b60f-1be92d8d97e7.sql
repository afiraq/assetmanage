-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sublocations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_number TEXT NOT NULL,
  sap_number TEXT,
  model TEXT,
  brand TEXT,
  serial TEXT,
  specification TEXT,
  item_name TEXT NOT NULL,
  office_number TEXT,
  year_number TEXT,
  category_number TEXT,
  item_number TEXT,
  sequence_number TEXT,
  location TEXT,
  sublocation TEXT,
  price NUMERIC DEFAULT 0,
  accrued_date TEXT,
  purchase_code TEXT,
  voucher_number TEXT,
  deducted_after_auction BOOLEAN DEFAULT false,
  auctioned_date TEXT,
  tag_attached BOOLEAN DEFAULT false,
  quantity INTEGER DEFAULT 1,
  comments TEXT,
  assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Locations policies - all authenticated users can view
CREATE POLICY "Authenticated users can view locations"
ON public.locations FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins can manage locations
CREATE POLICY "Admins can insert locations"
ON public.locations FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update locations"
ON public.locations FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete locations"
ON public.locations FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Assets policies - all authenticated users can view
CREATE POLICY "Authenticated users can view assets"
ON public.assets FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins can manage assets
CREATE POLICY "Admins can insert assets"
ON public.assets FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assets"
ON public.assets FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assets"
ON public.assets FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Insert default locations
INSERT INTO public.locations (name, sublocations) VALUES
  ('Head Office', ARRAY['Floor 1', 'Floor 2', 'Floor 3']),
  ('Branch Office', ARRAY['Main Hall', 'Storage']),
  ('Warehouse', ARRAY['Section A', 'Section B', 'Section C']);
-- Add asset_class column to assets table (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'assets' AND column_name = 'asset_class'
  ) THEN
    ALTER TABLE public.assets ADD COLUMN asset_class text;
  END IF;
END $$;
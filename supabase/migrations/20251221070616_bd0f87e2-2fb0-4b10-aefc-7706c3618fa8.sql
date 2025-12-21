-- Add status column to assets table
ALTER TABLE public.assets 
ADD COLUMN status text DEFAULT 'active';

-- Add comment to describe valid values
COMMENT ON COLUMN public.assets.status IS 'Asset status: active, transferred, discarded, stolen, auctioned';
-- Create buckets table
-- Stores the bucket definitions (Necessity, Investment, etc.)
CREATE TABLE IF NOT EXISTS buckets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  allocation_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
  limiter_light NUMERIC(5, 2) NOT NULL DEFAULT 1,
  limiter_intermediate NUMERIC(5, 2) NOT NULL DEFAULT 1,
  limiter_strict NUMERIC(5, 2) NOT NULL DEFAULT 1,
  color TEXT, -- Hex color code for UI
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT valid_allocation CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
  CONSTRAINT valid_limiters CHECK (limiter_light > 0 AND limiter_intermediate > 0 AND limiter_strict > 0)
);

-- Enable Row Level Security
ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view buckets (they're shared definitions)
CREATE POLICY "Authenticated users can view buckets"
  ON buckets FOR SELECT
  TO authenticated
  USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS buckets_name_idx ON buckets(name);
CREATE INDEX IF NOT EXISTS buckets_display_order_idx ON buckets(display_order);


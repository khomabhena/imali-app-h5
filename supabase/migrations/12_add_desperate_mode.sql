-- Add desperate mode support
-- This migration adds limiter_desperate column and updates settings to allow desperate mode

-- 1. Add limiter_desperate column to buckets table
ALTER TABLE buckets 
ADD COLUMN IF NOT EXISTS limiter_desperate NUMERIC(5, 2) NOT NULL DEFAULT 1;

-- 2. Update the constraint to include desperate limiter
ALTER TABLE buckets 
DROP CONSTRAINT IF EXISTS valid_limiters;

ALTER TABLE buckets 
ADD CONSTRAINT valid_limiters CHECK (
  limiter_light > 0 
  AND limiter_intermediate > 0 
  AND limiter_strict > 0 
  AND limiter_desperate > 0
);

-- 3. Update settings table to allow 'desperate' mode
ALTER TABLE settings 
DROP CONSTRAINT IF EXISTS settings_default_mode_check;

ALTER TABLE settings 
ADD CONSTRAINT settings_default_mode_check 
CHECK (default_mode IN ('light', 'intermediate', 'strict', 'desperate'));

-- 4. Update existing buckets with desperate limiter values
-- Desperate mode allows spending with lower balances (lower limiters = easier to spend)
UPDATE buckets SET limiter_desperate = 
  CASE 
    WHEN name = 'Necessity' THEN 1.5
    WHEN name = 'Investment' THEN 1.5
    WHEN name = 'Learning' THEN 1.5
    WHEN name = 'Emergency' THEN 1.2
    WHEN name = 'Fun' THEN 5.00
    ELSE 1.00
  END
WHERE limiter_desperate = 1.00;


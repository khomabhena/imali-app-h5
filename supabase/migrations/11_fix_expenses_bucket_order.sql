-- Fix Expenses bucket display order
-- Update existing Expenses bucket to appear at bottom (display_order: 7)

UPDATE buckets
SET display_order = 7
WHERE name = 'Expenses' AND display_order != 7;


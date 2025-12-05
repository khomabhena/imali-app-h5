-- Add missing columns to expenses table
-- Add category column for expense categorization
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add paid_amount column for incremental payments
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(15, 2) DEFAULT 0;

-- Add index for category for better query performance
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);


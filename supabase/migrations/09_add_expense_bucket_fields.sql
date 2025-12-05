-- Add bucket_id, paid_amount, and category fields to expenses table
-- Expenses are automatically assigned to Expense Bucket
-- Category is for reporting/tracking purposes only

-- Add bucket_id column (will point to Expenses bucket)
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS bucket_id UUID REFERENCES buckets(id) ON DELETE SET NULL;

-- Add paid_amount column (for incremental payments)
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;

-- Add category column (optional, for tagging: Necessity, Learning, etc.)
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add index for bucket_id for faster queries
CREATE INDEX IF NOT EXISTS expenses_bucket_id_idx ON expenses(bucket_id);

-- Add index for paid_amount to help with incremental payment queries
CREATE INDEX IF NOT EXISTS expenses_paid_amount_idx ON expenses(paid_amount);

-- Update existing expenses: if they don't have paid_amount, set it to amount (full payment)
UPDATE expenses
SET paid_amount = amount
WHERE paid_amount IS NULL AND amount IS NOT NULL;

-- Add comment to columns
COMMENT ON COLUMN expenses.bucket_id IS 'Always points to Expenses bucket. Auto-assigned when expense is created.';
COMMENT ON COLUMN expenses.paid_amount IS 'Amount already paid for this expense. For full payments, equals amount. For incremental, less than amount.';
COMMENT ON COLUMN expenses.category IS 'Optional category for reporting (Necessity, Investment, Learning, Emergency, Fun). Does not affect bucket deduction.';


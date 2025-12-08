-- Create Expenses bucket
-- This bucket holds allocated funds for expenses
-- Expenses are automatically allocated here when income is recorded

INSERT INTO buckets (name, allocation_pct, limiter_light, limiter_intermediate, limiter_strict, color, display_order)
VALUES
  ('Expenses', 0.00, 1.00, 1.00, 1.00, '#8b5cf6', 0)
ON CONFLICT (name) DO NOTHING;

-- Note: allocation_pct is 0 because expenses are calculated dynamically
-- based on total active expenses, not a fixed percentage



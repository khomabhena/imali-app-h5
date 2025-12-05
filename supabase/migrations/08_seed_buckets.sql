-- Seed default buckets
-- These are shared across all users

INSERT INTO buckets (name, allocation_pct, limiter_light, limiter_intermediate, limiter_strict, color, display_order)
VALUES
  ('Necessity', 60.00, 2.00, 3.00, 6.00, '#0891b2', 1),
  ('Investment', 10.00, 2.00, 3.00, 5.00, '#14b8a6', 2),
  ('Learning', 10.00, 2.00, 3.00, 5.00, '#0ea5e9', 3),
  ('Emergency', 10.00, 2.00, 3.00, 5.00, '#ef4444', 4),
  ('Fun', 10.00, 10.00, 10.00, 10.00, '#f59e0b', 5),
  ('Savings', 0.00, 1.00, 1.00, 1.00, '#64748b', 6),
  ('Expenses', 0.00, 1.00, 1.00, 1.00, '#8b5cf6', 0)
ON CONFLICT (name) DO NOTHING;


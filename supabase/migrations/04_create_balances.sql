-- Create balances table
-- User balances per bucket and currency
CREATE TABLE IF NOT EXISTS balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, bucket_id, currency_code)
);

-- Enable Row Level Security
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own balances
CREATE POLICY "Users can view own balances"
  ON balances FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own balances
CREATE POLICY "Users can insert own balances"
  ON balances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own balances
CREATE POLICY "Users can update own balances"
  ON balances FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS balances_user_id_idx ON balances(user_id);
CREATE INDEX IF NOT EXISTS balances_bucket_id_idx ON balances(bucket_id);
CREATE INDEX IF NOT EXISTS balances_currency_idx ON balances(currency_code);
CREATE INDEX IF NOT EXISTS balances_user_currency_idx ON balances(user_id, currency_code);


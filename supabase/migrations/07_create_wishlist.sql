-- Create wishlist_items table
-- Items users want to buy
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  bucket_id UUID NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)), -- 1=High, 2=Medium, 3=Low
  category TEXT,
  note TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE, -- When item was purchased
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own wishlist items
CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own wishlist items
CREATE POLICY "Users can update own wishlist items"
  ON wishlist_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS wishlist_items_user_id_idx ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS wishlist_items_bucket_id_idx ON wishlist_items(bucket_id);
CREATE INDEX IF NOT EXISTS wishlist_items_currency_idx ON wishlist_items(currency_code);
CREATE INDEX IF NOT EXISTS wishlist_items_purchased_idx ON wishlist_items(purchased_at);


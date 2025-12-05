-- Clear All App Data Script
-- Run this in your Supabase SQL Editor to clear all user data
-- WARNING: This will permanently delete ALL your app data!

-- Delete all transactions
DELETE FROM transactions;

-- Delete all wishlist items
DELETE FROM wishlist_items;

-- Delete all expenses
DELETE FROM expenses;

-- Delete all balances
DELETE FROM balances;

-- Delete all settings
DELETE FROM settings;

-- Optional: Delete all profiles (this will also delete auth users)
-- Uncomment the next line if you want to delete user accounts too
-- DELETE FROM profiles;

-- Note: Buckets are preserved as they are shared definitions

-- Verify deletion (optional - run these to check)
-- SELECT COUNT(*) FROM transactions;
-- SELECT COUNT(*) FROM wishlist_items;
-- SELECT COUNT(*) FROM expenses;
-- SELECT COUNT(*) FROM balances;
-- SELECT COUNT(*) FROM settings;


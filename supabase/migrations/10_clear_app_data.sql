-- Clear all app data
-- This script deletes all user data but preserves the schema and shared definitions (buckets)
-- WARNING: This will delete ALL data. Use with caution!

-- Delete in order to respect foreign key constraints
-- Start with tables that have foreign keys to other user tables

-- 1. Delete transactions (references balances, buckets, but not other user tables)
DELETE FROM transactions;

-- 2. Delete wishlist items (references buckets)
DELETE FROM wishlist_items;

-- 3. Delete expenses (no foreign keys to other user tables)
DELETE FROM expenses;

-- 4. Delete balances (references buckets)
DELETE FROM balances;

-- 5. Delete settings (references profiles)
DELETE FROM settings;

-- 6. Delete profiles (this will cascade delete related data due to ON DELETE CASCADE)
-- Note: This will also delete auth users if you want to clear everything
-- Uncomment the line below if you also want to delete auth users
-- DELETE FROM auth.users;

-- Note: Buckets are NOT deleted as they are shared definitions

-- Reset sequences if any (PostgreSQL auto-increment sequences)
-- This ensures new IDs start from 1 after clearing data
-- Note: Supabase uses UUIDs, so sequences may not be needed, but included for completeness


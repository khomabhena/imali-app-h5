# Supabase Database Migrations

This directory contains SQL migration files to set up the Imali app database schema.

## Migration Order

Run these migrations in order:

1. `01_create_profiles.sql` - User profiles table
2. `02_create_buckets.sql` - Bucket definitions table
3. `03_create_settings.sql` - User settings table
4. `04_create_balances.sql` - User balances per bucket/currency
5. `05_create_transactions.sql` - Transaction history
6. `06_create_expenses.sql` - One-time expenses
7. `07_create_wishlist.sql` - Wishlist items
8. `08_seed_buckets.sql` - Seed default buckets

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content in order
4. Click **Run** to execute

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: psql (PostgreSQL client)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/01_create_profiles.sql
\i supabase/migrations/02_create_buckets.sql
# ... etc
```

## Verification

After running migrations, verify tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `profiles`
   - `buckets`
   - `settings`
   - `balances`
   - `transactions`
   - `expenses`
   - `wishlist_items`

3. Check that buckets were seeded:
   - Go to `buckets` table
   - You should see 6 rows (Necessity, Investment, Learning, Emergency, Fun, Savings)

## Row-Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to view/insert/update/delete only their own data
- Buckets table is readable by all authenticated users (shared definitions)

## Important Notes

- **Profiles**: Automatically created when a user signs up (via trigger)
- **Buckets**: Shared across all users, seeded once
- **Balances**: Created on-demand when needed (per user/bucket/currency)
- **Settings**: One row per user, created on first access

## Next Steps

After running migrations:
1. Test authentication flow
2. Create data service hooks in the app
3. Replace mock data with real Supabase queries


# Imali Database Schema

Complete database schema documentation for the Imali app.

## Tables Overview

### 1. `profiles`
User profile information linked to Supabase auth.

**Columns:**
- `id` (UUID, PK) - References `auth.users(id)`
- `email` (TEXT) - User email
- `full_name` (TEXT, nullable) - User's full name
- `avatar_url` (TEXT, nullable) - Profile picture URL
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/update/insert their own profile

**Triggers:**
- Auto-creates profile when user signs up

---

### 2. `buckets`
Bucket definitions (shared across all users).

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT, UNIQUE) - Bucket name (Necessity, Investment, etc.)
- `allocation_pct` (NUMERIC) - Percentage allocated on income (0-100)
- `limiter_light` (NUMERIC) - Limiter for Light mode
- `limiter_intermediate` (NUMERIC) - Limiter for Intermediate mode
- `limiter_strict` (NUMERIC) - Limiter for Strict mode
- `color` (TEXT) - Hex color code for UI
- `display_order` (INTEGER) - Order for display
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- All authenticated users can view buckets

**Seed Data:**
- Necessity (60%, limiters: 2/3/6)
- Investment (10%, limiters: 2/3/5)
- Learning (10%, limiters: 2/3/5)
- Emergency (10%, limiters: 2/3/5)
- Fun (10%, limiters: 10/10/10)
- Savings (0%, limiters: 1/1/1)

---

### 3. `settings`
User preferences and settings.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id, UNIQUE)
- `default_mode` (TEXT) - 'light', 'intermediate', or 'strict'
- `default_currency` (TEXT) - Default currency code (USD, ZAR, etc.)
- `locale` (TEXT) - Locale for formatting (en-US, etc.)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/insert/update their own settings

---

### 4. `balances`
User balances per bucket and currency.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `bucket_id` (UUID, FK → buckets.id)
- `currency_code` (TEXT) - Currency code (USD, ZAR, etc.)
- `balance` (NUMERIC) - Current balance (can be negative)
- `updated_at` (TIMESTAMP)

**Unique Constraint:**
- `(user_id, bucket_id, currency_code)` - One balance per user/bucket/currency

**RLS Policies:**
- Users can view/insert/update their own balances

**Note:**
- Balances are calculated from transactions, but cached here for performance
- Should be updated when transactions are created

---

### 5. `transactions`
Income and expense transaction records.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `type` (TEXT) - 'income', 'expense', 'sweep', or 'reserve'
- `amount` (NUMERIC) - Signed amount (positive for income, negative for expense)
- `currency_code` (TEXT) - Currency code
- `bucket_id` (UUID, FK → buckets.id, nullable) - Null for income/reserve
- `item_name` (TEXT, nullable) - Item/product name
- `category` (TEXT, nullable) - Transaction category
- `note` (TEXT, nullable) - Additional notes
- `date` (TIMESTAMP) - Transaction date
- `created_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/insert/update/delete their own transactions

**Indexes:**
- `user_id`, `date DESC`, `type`, `bucket_id`, `currency_code`

---

### 6. `expenses`
One-time expense entries.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `name` (TEXT) - Expense name
- `amount` (NUMERIC) - Expense amount
- `currency_code` (TEXT) - Currency code
- `active` (BOOLEAN) - Whether expense is active
- `due_date` (DATE, nullable) - Due date if applicable
- `priority` (INTEGER, nullable) - 1=High, 2=Medium, 3=Low
- `note` (TEXT, nullable) - Additional notes
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/insert/update/delete their own expenses

**Indexes:**
- `user_id`, `active`, `currency_code`

---

### 7. `wishlist_items`
Items users want to buy.

**Columns:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → profiles.id)
- `name` (TEXT) - Item name
- `amount` (NUMERIC) - Estimated cost
- `currency_code` (TEXT) - Currency code
- `bucket_id` (UUID, FK → buckets.id) - Which bucket to use
- `priority` (INTEGER) - 1=High, 2=Medium, 3=Low
- `category` (TEXT, nullable) - Item category
- `note` (TEXT, nullable) - Additional notes
- `purchased_at` (TIMESTAMP, nullable) - When item was purchased
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**RLS Policies:**
- Users can view/insert/update/delete their own wishlist items

**Indexes:**
- `user_id`, `bucket_id`, `currency_code`, `purchased_at`

---

## Relationships

```
profiles (1) ──< (many) settings
profiles (1) ──< (many) balances
profiles (1) ──< (many) transactions
profiles (1) ──< (many) expenses
profiles (1) ──< (many) wishlist_items

buckets (1) ──< (many) balances
buckets (1) ──< (many) transactions
buckets (1) ──< (many) wishlist_items
```

## Data Flow

### Income Allocation Flow
1. User records income → `transactions` (type='income')
2. Calculate net after expenses
3. Allocate to buckets → `transactions` (type='sweep' or multiple entries)
4. Update `balances` for each bucket

### Purchase Flow
1. Check affordability using `balances` and bucket limiters
2. If affordable → Create `transactions` (type='expense')
3. Update `balances` for the bucket

### Expense Reservation Flow
1. User creates expense → `expenses` (active=true)
2. On income allocation, sum active expenses
3. Deduct from income before bucket allocation

## Security

All tables use Row-Level Security (RLS) to ensure:
- Users can only access their own data
- Buckets are readable by all (shared definitions)
- No user can access another user's financial data

## Performance Considerations

- Indexes on foreign keys and frequently queried columns
- `balances` table caches calculated values for fast queries
- Transaction history indexed by date for efficient filtering
- Currency-aware indexes for multi-currency support


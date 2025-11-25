## Imali H5 App — Product & Technical Specification

Last updated: 2025-11-16

### Overview
Imali is a mobile-first H5 app for personal finance discipline. It allocates income into predefined buckets, blocks unaffordable purchases per bucket rules, supports multi-currency, records one-time expenses, and provides analytics including per-item spend. Auth and database are hosted on Supabase.

Reference context: [imali-app.vercel.app](https://imali-app.vercel.app)


## Core Concepts

### Buckets
- Necessity (10%)
- Investment (10%)
- Learning (10)  — label is “Learning” (previously “Education”)
- Emergency (10%)
- Fun (10%)
- Savings (remainder after allocations on each income event)

Notes:
- Allocations apply only on income events (see Flow below).
- Savings is not used for affordability checks directly; purchases are evaluated against their selected non-Savings bucket.

### Affordability Rule
On purchase from a bucket, block the transaction if:

\[bucketBalance < amount × limiter\]

Limiters are determined by the current “mode” (Light, Intermediate, Strict) per bucket.

### Modes and Limiters

| Mode | Necessity | Emergency | Learning | Investment | Fun |
|---|---:|---:|---:|---:|---:|
| Light | ×2 | ×2 | ×2 | ×2 | ×10 |
| Intermediate | ×5 | ×4 | ×4 | ×4 | ×10 |
| Strict | ×6 | ×5 | ×5 | ×5 | ×10 |

Notes:
- Savings limiter is not used for purchase gating; Savings is a sink for sweeps.

### Expenses
- Expense entries are one-time (no recurrence for v1).
- Expenses are reserved against the period’s income before bucket allocations.
- If expenses > income, operate in the negative. The deficit carries forward and is cleared when future income exceeds expenses.

### Multi-Currency
- Per-user, per-currency balances.
- Currency-aware transactions and analytics.


## Flow

### On New Income (Allocation Event)
1) Record gross income (currency-scoped).  
2) Reserve one-time expenses for the current period.  
3) Compute netAfterExpenses = income − totalExpenses (can be negative).  
4) Allocate 10% each to Necessity, Investment, Learning, Emergency, Fun from netAfterExpenses.  
5) Sweep the remainder to Savings (can be negative if netAfterExpenses is negative).  
6) Update balances per bucket and record transactions.

### On Purchase
1) User selects a bucket (not Savings).  
2) Show live check: remaining = bucketBalance − amount; block if remaining violates limiter rule (amount × limiter > balance).  
3) **If blocked** (when `amount × limiter > bucketBalance`):
   - Alert the user with clear message explaining the affordability violation
   - Display maximum affordable amount: `maxAffordable = bucketBalance ÷ limiter`
   - Show calculation breakdown: current balance, limiter value, and resulting max affordable amount
   - Offer actions:
     - Reduce amount to max affordable (one-click option)
     - Use different bucket (show other buckets with their max affordable amounts)
     - Cancel/deny purchase (no Savings fallback for affordability checks)
4) On success, record an expense transaction against the chosen bucket.

### Month-End
- No automatic month-end sweep is required. Sweeps happen upon receiving new income.


## Data Model (Supabase)

Tables (MVP suggestion; subject to migration as features grow):

- profiles
  - id (uuid, PK, equals auth user id)
  - email, created_at

- buckets
  - id (uuid, PK)
  - name (text, enum: Necessity, Investment, Learning, Emergency, Fun, Savings)
  - allocation_pct (numeric) — for the five main buckets (10 each); Savings can be 0
  - limiter_light (numeric), limiter_intermediate (numeric), limiter_strict (numeric)
  - created_at (timestamp)

- balances
  - id (uuid, PK)
  - user_id (uuid, FK -> profiles.id)
  - currency_code (text) — e.g., USD, ZAR, ZWL
  - bucket_id (uuid, FK -> buckets.id)
  - balance (numeric) — can be negative
  - updated_at (timestamp)

- transactions
  - id (uuid, PK)
  - user_id (uuid, FK -> profiles.id)
  - type (text enum: income | expense | sweep | reserve)
  - amount (numeric, signed)
  - currency_code (text)
  - bucket_id (uuid, nullable for income or reserve)
  - item_name (text) — product/item spent on
  - category (text, optional label)
  - note (text)
  - date (timestamp)

- expenses
  - id (uuid, PK)
  - user_id (uuid, FK -> profiles.id)
  - name (text)
  - amount (numeric)
  - currency_code (text)
  - active (boolean, default true)
  - due_date (date, optional)
  - priority (int, optional)
  - note (text)
  - created_at (timestamp)

- settings
  - id (uuid, PK)
  - user_id (uuid, FK -> profiles.id)
  - default_mode (text enum: light | intermediate | strict)
  - default_currency (text)
  - locale (text)
  - created_at (timestamp)

Row-Level Security (RLS): Restrict all `balances`, `transactions`, `expenses`, `settings` rows by `user_id = auth.uid()`.


## Calculations
- Balance per bucket = sum(transactions.amount for that bucket and currency).  
  - income: positive, bucket_id null (distribution recorded as per-bucket positive entries or a single sweep + inferred allocation entries)
  - expense: negative against a specific bucket
  - sweep: moves amounts between buckets (Savings target), represented as two rows or a single signed row, depending on design preference
- Affordability check for a purchase from bucket B at mode M: block if balance_B < amount × limiter_M(B).
- Net after expenses = income − totalOneTimeExpenses for the period; can be negative (deficit).


## Analytics (MVP)
- Per-item spend (sum by `item_name`, filter by dates, currency, bucket).
- Per-bucket flows and balances over time.
- Income vs. expenses trend.
- Top categories/items by spend.
- Multi-currency aware filtering and display.


## Auth & Hosting
- Auth: Supabase Auth.
- Database: Supabase Postgres (with RLS).
- App: H5, mobile-first UI.
- Payments: Users will pay to use the app (details later; not in MVP scope).


## Open Defaults to Confirm
- Default mode on first launch (light/intermediate/strict).
- Supported currency list and default currency (e.g., USD, ZAR, ZWL).
- Locale/formatting defaults.


## References
- Prior context and inspiration: [imali-app.vercel.app](https://imali-app.vercel.app)
- Legacy implementation patterns (internal reference): `C:\Users\KholwaniMabhena\work\imali-clone-old`



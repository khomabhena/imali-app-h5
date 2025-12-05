# Expense Deduction from Buckets Feature

## Overview

Expenses can now be deducted directly from allocated bucket amounts, with support for incremental (little by little) payments.

## Features

### 1. Bucket-Based Deduction
- Expenses can be assigned to a specific bucket
- When an expense is created/activated, it deducts from the selected bucket's balance
- Only active expenses with a bucket assigned will deduct from buckets

### 2. Incremental Payments
- Expenses can be paid in full or incrementally
- **Full Payment**: Deducts the entire amount immediately
- **Incremental Payment**: Track partial payments over time
  - Shows payment progress bar
  - Displays paid amount vs remaining amount
  - Only deducts the paid amount from the bucket

### 3. Payment Tracking
- Visual progress bar for incremental expenses
- Shows: Paid amount, Remaining amount, Total amount
- Updates in real-time as payments are made

## Database Changes

### New Fields in `expenses` table:
- `bucket_id` (UUID, nullable) - Bucket to deduct from
- `paid_amount` (NUMERIC, default 0) - Amount already paid

### Migration
Run migration: `09_add_expense_bucket_fields.sql`

## How It Works

### Creating an Expense

1. **Select Bucket**: Choose which bucket to deduct from
2. **Choose Payment Type**:
   - **Full Payment**: Deducts entire amount immediately
   - **Incremental**: Pay little by little
3. **For Incremental Payments**:
   - Enter total amount
   - Enter amount paid so far
   - Remaining amount is calculated automatically

### Deduction Process

When an expense is created or updated:
1. Checks if expense has a bucket assigned
2. Checks if expense is active
3. Calculates amount to deduct:
   - Full payment: entire amount
   - Incremental: only the paid amount
4. Validates bucket has sufficient balance
5. Creates transaction record
6. Updates bucket balance

### Example Scenarios

#### Scenario 1: Full Payment
- Expense: $500 Rent
- Bucket: Necessity
- Payment Type: Full
- Result: $500 deducted from Necessity bucket immediately

#### Scenario 2: Incremental Payment
- Expense: $1,000 Insurance
- Bucket: Emergency
- Payment Type: Incremental
- Paid So Far: $300
- Result: Only $300 deducted from Emergency bucket
- Remaining: $700 (will be deducted as you pay more)

## UI Updates

### Add Expense Form
- ✅ Bucket selector dropdown
- ✅ Payment type toggle (Full/Incremental)
- ✅ Paid amount input (for incremental)
- ✅ Progress bar showing payment status
- ✅ Remaining amount display

### Expenses List
- ✅ Shows bucket name for each expense
- ✅ Progress bar for incremental payments
- ✅ Paid vs Remaining amounts

## Service Functions

### `expenseService.js`

1. **`deductExpenseFromBucket()`**
   - Deducts amount from bucket balance
   - Validates sufficient balance
   - Creates transaction record
   - Updates bucket balance

2. **`processExpenseDeduction()`**
   - Automatically called when expense is created/updated
   - Handles both full and incremental payments
   - Calculates difference for updates

3. **`updateIncrementalPayment()`**
   - Updates incremental payment amount
   - Deducts only the additional amount

## Important Notes

1. **Bucket Selection**: Expenses without a bucket will still work as before (reserved from income)

2. **Inactive Expenses**: Only active expenses deduct from buckets

3. **Insufficient Balance**: If bucket doesn't have enough balance, deduction fails with error message

4. **Incremental Updates**: When updating paid amount, only the difference is deducted

5. **Currency Matching**: Bucket and expense must use the same currency

## Next Steps

1. **Run Migration**: Apply `09_add_expense_bucket_fields.sql` to your database

2. **Test the Feature**:
   - Create an expense with bucket selection
   - Try full payment
   - Try incremental payment
   - Update incremental payment amount

3. **Optional Enhancements**:
   - Add "Pay More" button for incremental expenses
   - Show bucket balance when selecting bucket
   - Add validation for bucket balance before creating expense


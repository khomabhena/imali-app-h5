# Imali App - Business Logic Documentation

Last updated: 2025-11-21

## Overview

This document outlines all business logic for the Imali personal finance app, including income allocation, affordability checks, daily expense calculations, and recommendations for where logic should reside (frontend vs backend).

---

## 1. Income Allocation Logic

### Flow

When a user records income, the following steps occur:

1. **Record Gross Income**
   - User enters: amount, currency, date, source (optional), note (optional)
   - Gross income is stored as a positive transaction

2. **Reserve Active Expenses**
   - All active expenses for the current period are summed
   - Expenses are currency-scoped (only expenses matching income currency)
   - Formula: `totalActiveExpenses = sum(activeExpenses where currency === incomeCurrency)`

3. **Calculate Net After Expenses**
   - Formula: `netAfterExpenses = grossIncome - totalActiveExpenses`
   - Can be negative if expenses exceed income (deficit carries forward)

4. **Allocate to Buckets**
   - **Necessity**: 60% of `netAfterExpenses`
   - **Investment**: 10% of `netAfterExpenses`
   - **Learning**: 10% of `netAfterExpenses`
   - **Emergency**: 10% of `netAfterExpenses`
   - **Fun**: 10% of `netAfterExpenses`
   - **Savings**: Remainder after all allocations

5. **Update Balances**
   - Each bucket balance is increased by its allocation amount
   - Transactions are recorded for each allocation

### Formulas

```javascript
// Step 1: Calculate net after expenses
netAfterExpenses = grossIncome - totalActiveExpenses

// Step 2: Calculate allocations
necessityAllocation = netAfterExpenses × 0.6
investmentAllocation = netAfterExpenses × 0.1
learningAllocation = netAfterExpenses × 0.1
emergencyAllocation = netAfterExpenses × 0.1
funAllocation = netAfterExpenses × 0.1

// Step 3: Calculate savings (remainder)
totalAllocated = necessityAllocation + investmentAllocation + learningAllocation + emergencyAllocation + funAllocation
savingsAllocation = netAfterExpenses - totalAllocated

// Step 4: Update balances
bucketBalance = bucketBalance + allocation
```

### Example

**Input:**
- Gross Income: $1,800
- Active Expenses: $0
- Currency: USD

**Calculation:**
1. Net after expenses: $1,800 - $0 = $1,800
2. Necessity: $1,800 × 0.6 = $1,080
3. Investment: $1,800 × 0.1 = $180
4. Learning: $1,800 × 0.1 = $180
5. Emergency: $1,800 × 0.1 = $180
6. Fun: $1,800 × 0.1 = $180
7. Savings: $1,800 - ($1,080 + $180 + $180 + $180 + $180) = $0

---

## 2. Affordability Check Logic

### Purpose

The affordability check ensures users maintain a safety buffer in each bucket before making purchases. The limiter acts as a multiplier that requires users to have X times the purchase amount in their bucket balance.

### Affordability Rule

A purchase is **blocked** if:
```
bucketBalance < (purchaseAmount × limiter)
```

A purchase is **approved** if:
```
bucketBalance >= (purchaseAmount × limiter)
```

### Limiter Values by Mode

| Mode | Necessity | Investment | Learning | Emergency | Fun |
|------|-----------|------------|----------|-----------|-----|
| Light | ×2 | ×2 | ×2 | ×2 | ×10 |
| Intermediate | ×5 | ×4 | ×4 | ×4 | ×10 |
| Strict | ×6 | ×5 | ×5 | ×5 | ×10 |

### Calculation Steps

1. **Get Limiter for Bucket and Mode**
   ```javascript
   limiter = getLimiter(bucketName, mode)
   ```

2. **Calculate Required Balance**
   ```javascript
   requiredBalance = purchaseAmount × limiter
   ```

3. **Check Affordability**
   ```javascript
   isAffordable = bucketBalance >= requiredBalance
   ```

4. **Calculate Maximum Affordable Amount**
   ```javascript
   maxAffordable = bucketBalance ÷ limiter
   ```

### Important Notes

- **The limiter is only for the check** - when a purchase is made, only the actual purchase amount is deducted from the bucket balance, NOT `purchaseAmount × limiter`
- **Savings bucket is excluded** - purchases cannot be made from Savings, and Savings has no limiter
- **Currency-aware** - affordability checks are scoped to the bucket's currency

### Example

**Scenario:**
- Bucket: Necessity
- Current Balance: $1,080
- Purchase Amount: $350
- Mode: Intermediate (limiter = ×5)

**Calculation:**
1. Required balance: $350 × 5 = $1,750
2. Check: $1,080 < $1,750 → **BLOCKED**
3. Max affordable: $1,080 ÷ 5 = $216

**After Purchase (if approved):**
- Balance before: $1,080
- Purchase amount deducted: $350 (NOT $1,750)
- Balance after: $1,080 - $350 = $730

---

## 3. Daily Expense Calculation

### Purpose

Allows users to check if they can afford a recurring daily expense for the remaining days in the current month.

### Calculation Steps

1. **Calculate Days Remaining in Month**
   ```javascript
   today = new Date()
   lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
   daysRemaining = lastDayOfMonth.getDate() - today.getDate()
   ```

2. **Calculate Monthly Total**
   ```javascript
   monthlyTotal = dailyAmount × daysRemaining
   ```

3. **Apply Affordability Check**
   - Use `monthlyTotal` as the purchase amount
   - Apply the same affordability logic as a regular purchase
   - Formula: `bucketBalance >= (monthlyTotal × limiter)`

### Example

**Scenario:**
- Today: November 21, 2025
- Days remaining: 9 days (Nov 22-30)
- Daily amount: $10/day
- Bucket: Necessity
- Mode: Light (limiter = ×2)

**Calculation:**
1. Monthly total: $10 × 9 = $90
2. Required balance: $90 × 2 = $180
3. Check: If bucket balance >= $180 → Approved, else Blocked

---

## 4. Income Needed Calculation

### Purpose

When a purchase is blocked, calculate how much income the user needs to earn to afford it.

### Calculation Steps

1. **Calculate Additional Balance Needed**
   ```javascript
   additionalBalanceNeeded = requiredBalance - currentBalance
   ```

2. **Determine Allocation Percentage**
   - Necessity: 60% (0.6)
   - Investment, Learning, Emergency, Fun: 10% each (0.1)

3. **Calculate Net Income Needed**
   ```javascript
   netIncomeNeeded = additionalBalanceNeeded ÷ allocationPercentage
   ```

4. **Add Active Expenses**
   ```javascript
   activeExpensesTotal = sum(activeExpenses where currency matches)
   grossIncomeNeeded = netIncomeNeeded + activeExpensesTotal
   ```

### Example

**Scenario:**
- Purchase: $350
- Bucket: Necessity
- Mode: Intermediate (limiter = ×5)
- Current balance: $1,080
- Active expenses: $0

**Calculation:**
1. Required balance: $350 × 5 = $1,750
2. Additional needed: $1,750 - $1,080 = $670
3. Net income needed: $670 ÷ 0.6 = $1,117
4. Gross income needed: $1,117 + $0 = $1,117

---

## 5. Where Should Logic Reside?

### Recommendation: **Hybrid Approach**

#### **Frontend (Client-Side)**

**Should handle:**
- ✅ Real-time affordability checks (as user types)
- ✅ Income allocation previews
- ✅ Daily expense calculations
- ✅ UI feedback and validation
- ✅ Form validation

**Why:**
- Immediate user feedback without server round-trips
- Better UX with instant calculations
- Reduces server load for preview/check operations
- Works offline for calculations

**Files:**
- `src/data/mockData.js` - Helper functions (currently)
- `src/pages/Purchase.jsx` - Real-time affordability checks
- `src/pages/Income.jsx` - Allocation previews

#### **Backend (Server-Side)**

**Must handle:**
- ✅ **Final validation** before recording transactions
- ✅ **Actual balance updates** (never trust client)
- ✅ **Transaction recording** to database
- ✅ **Income allocation execution**
- ✅ **Currency conversion** (if multi-currency)
- ✅ **Audit logging**

**Why:**
- Security: Client can be manipulated
- Data integrity: Single source of truth
- Consistency: All users see same calculations
- Compliance: Financial data must be server-validated

**Implementation:**
- Supabase Edge Functions or API routes
- Database triggers for balance updates
- Row-level security (RLS) policies

### Recommended Architecture

```
┌─────────────────┐
│   Frontend      │
│                 │
│  • Preview      │  ← Real-time calculations
│  • Validation   │     (can be manipulated)
│  • UI Feedback  │
└────────┬────────┘
         │
         │ API Call
         ▼
┌─────────────────┐
│   Backend       │
│                 │
│  • Validation   │  ← Final authority
│  • Calculation  │     (cannot be manipulated)
│  • Database     │
│  • Balance      │
└─────────────────┘
```

### Implementation Strategy

1. **Keep helper functions in frontend** for UX
2. **Create matching server functions** for validation
3. **Always validate on server** before database writes
4. **Use same calculation logic** on both sides (shared utilities if possible)

### Example Flow

**Income Recording:**
1. Frontend: Show allocation preview (instant feedback)
2. User submits
3. Backend: Recalculate allocation (don't trust frontend)
4. Backend: Update balances in database
5. Backend: Record transactions
6. Frontend: Refresh and show updated balances

**Purchase Recording:**
1. Frontend: Real-time affordability check (as user types)
2. User submits
3. Backend: Re-validate affordability (don't trust frontend)
4. Backend: If valid, deduct amount from balance
5. Backend: Record transaction
6. Frontend: Refresh and show updated balance

---

## 6. Key Formulas Summary

### Income Allocation
```
netAfterExpenses = grossIncome - totalActiveExpenses
necessityAllocation = netAfterExpenses × 0.6
otherBucketAllocation = netAfterExpenses × 0.1
savingsAllocation = netAfterExpenses - totalAllocated
```

### Affordability Check
```
requiredBalance = purchaseAmount × limiter
isAffordable = bucketBalance >= requiredBalance
maxAffordable = bucketBalance ÷ limiter
```

### Daily Expense
```
daysRemaining = lastDayOfMonth - today
monthlyTotal = dailyAmount × daysRemaining
requiredBalance = monthlyTotal × limiter
```

### Income Needed
```
additionalBalanceNeeded = requiredBalance - currentBalance
netIncomeNeeded = additionalBalanceNeeded ÷ allocationPercentage
grossIncomeNeeded = netIncomeNeeded + activeExpensesTotal
```

---

## 7. Edge Cases

### Negative Net After Expenses
- If expenses > income, `netAfterExpenses` can be negative
- Allocations are still calculated (can result in negative allocations)
- Deficit carries forward to next income event

### Zero or Negative Balance
- Affordability check still applies
- `maxAffordable` can be zero or negative
- Purchase will be blocked

### Currency Mismatch
- Expenses must match income currency to be deducted
- Bucket balances are currency-specific
- Affordability checks are currency-scoped

### Month-End Edge Cases
- Days remaining calculation handles month boundaries correctly
- Last day of month: `daysRemaining = 0` (no daily expense possible)

---

## 8. Testing Scenarios

### Income Allocation
- [ ] Income with no expenses
- [ ] Income with expenses less than income
- [ ] Income with expenses equal to income
- [ ] Income with expenses greater than income (deficit)
- [ ] Multi-currency income

### Affordability Checks
- [ ] Purchase within limit (approved)
- [ ] Purchase at limit (approved)
- [ ] Purchase over limit (blocked)
- [ ] Different limiters per mode
- [ ] Different limiters per bucket
- [ ] Zero balance purchase attempt

### Daily Expenses
- [ ] Beginning of month (many days)
- [ ] Middle of month
- [ ] End of month (few days)
- [ ] Last day of month (0 days)
- [ ] Month boundary crossing

### Income Needed
- [ ] With active expenses
- [ ] Without active expenses
- [ ] Necessity bucket (60% allocation)
- [ ] Other buckets (10% allocation)
- [ ] Already sufficient balance

---

## 9. Future Considerations

### Potential Enhancements
- Recurring expenses (monthly, weekly)
- Budget planning (projected income/expenses)
- Multi-currency conversion
- Interest/returns on Investment bucket
- Emergency fund targets
- Savings goals

### Performance Optimizations
- Cache limiter values
- Batch balance updates
- Optimistic UI updates
- Background sync for offline support

---

## 10. Code Organization

### Current Structure (Frontend)
```
src/
├── data/
│   └── mockData.js          # Helper functions (move to utils/)
├── pages/
│   ├── Income.jsx           # Allocation preview
│   └── Purchase.jsx          # Affordability checks
└── utils/                   # (Recommended)
    ├── allocation.js        # Income allocation logic
    ├── affordability.js     # Affordability checks
    └── calculations.js      # Shared calculations
```

### Recommended Structure (Shared)
```
shared/
├── business-logic/
│   ├── allocation.ts        # Income allocation (TypeScript)
│   ├── affordability.ts     # Affordability checks
│   └── calculations.ts      # Shared utilities
```

### Backend Structure (Supabase)
```
supabase/
├── functions/
│   ├── record-income/       # Income recording
│   ├── record-purchase/     # Purchase recording
│   └── validate-affordability/ # Affordability validation
└── migrations/
    └── triggers/            # Balance update triggers
```

---

## Conclusion

The business logic should be implemented in **both frontend and backend**:
- **Frontend**: For instant user feedback and better UX
- **Backend**: For security, validation, and data integrity

Always validate on the backend before making any database changes. The frontend calculations are for UX only and should never be trusted for actual transactions.


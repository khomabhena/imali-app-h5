# UI Component Build Order (Mock Data First)

Last updated: 2025-11-16

## Recommended Build Order

### 🎯 Phase 1: Layout & Navigation (Start Here)

**Why First**: Needed for all pages, establishes app structure

**Components to Build**:
1. **App Layout** (`src/components/Layout/AppLayout.jsx`)
   - Main container
   - Header with currency switcher, mode indicator
   - Content area
   - Bottom navigation bar

2. **Bottom Navigation** (`src/components/Navigation/BottomNav.jsx`)
   - 5 tabs: Dashboard, Transactions, Expenses, Analytics, Settings
   - Icons for each tab
   - Active state styling
   - Mobile-first design

3. **Header** (`src/components/Layout/Header.jsx`)
   - Currency selector dropdown
   - Mode badge (Light/Intermediate/Strict)
   - User menu/profile icon

**Mock Data Needed**: None (just navigation state)

**Estimated Time**: 1-2 hours

---

### 🏠 Phase 2: Dashboard Page (Highest Visual Impact)

**Why Second**: Main page users see, establishes design system, shows all buckets

**Components to Build**:
1. **Dashboard Page** (`src/pages/Dashboard.jsx`)
   - Total balance display
   - Quick action buttons (Add Income, Record Purchase)
   - Bucket cards grid

2. **Bucket Card** (`src/components/Buckets/BucketCard.jsx`)
   - Bucket name
   - Balance display (large, prominent)
   - Allocation percentage
   - Color-coded styling
   - Positive/negative/zero states

3. **Quick Actions Bar** (`src/components/Dashboard/QuickActions.jsx`)
   - "Add Income" button (primary)
   - "Record Purchase" button (secondary)

**Mock Data**:
```javascript
// src/data/mockData.js
export const mockBuckets = [
  { id: '1', name: 'Necessity', balance: 1250.50, allocationPct: 10, color: '#3B82F6' },
  { id: '2', name: 'Investment', balance: 1250.50, allocationPct: 10, color: '#10B981' },
  { id: '3', name: 'Learning', balance: 1250.50, allocationPct: 10, color: '#8B5CF6' },
  { id: '4', name: 'Emergency', balance: 500.00, allocationPct: 10, color: '#EF4444' },
  { id: '5', name: 'Fun', balance: 2500.75, allocationPct: 10, color: '#F59E0B' },
  { id: '6', name: 'Savings', balance: 5248.25, allocationPct: 0, color: '#6B7280' },
];

export const mockSettings = {
  defaultCurrency: 'USD',
  mode: 'intermediate',
  locale: 'en-US'
};
```

**Estimated Time**: 2-3 hours

---

### 💰 Phase 3: Add Income Page

**Why Third**: Important flow, introduces form patterns, shows allocation logic

**Components to Build**:
1. **Add Income Page** (`src/pages/AddIncome.jsx`)
   - Form with amount, currency, date, note fields
   - Allocation preview component

2. **Allocation Preview** (`src/components/Income/AllocationPreview.jsx`)
   - Gross income display
   - Active expenses total
   - Net after expenses
   - Breakdown: 10% to each bucket
   - Remainder to Savings
   - Visual bars or list

3. **Form Components** (`src/components/Forms/`)
   - CurrencyInput (with currency symbol)
   - DatePicker
   - TextInput
   - TextArea

**Mock Data**:
```javascript
export const mockActiveExpenses = [
  { id: '1', name: 'Rent', amount: 800, currency: 'USD', active: true },
  { id: '2', name: 'Utilities', amount: 150, currency: 'USD', active: true },
];

// Example: Income of $5000
// Expenses: $950
// Net: $4050
// Allocations: $405 each to 5 buckets (10% each)
// Savings: $4050 - ($405 × 5) = $2025
```

**Estimated Time**: 3-4 hours

---

### 🛒 Phase 4: Record Purchase Page (Core Feature)

**Why Fourth**: Most complex feature, affordability checks, establishes alert patterns

**Components to Build**:
1. **Record Purchase Page** (`src/pages/RecordPurchase.jsx`)
   - Form: amount, bucket, item name, category, date, note
   - Live affordability check component

2. **Affordability Check** (`src/components/Purchase/AffordabilityCheck.jsx`)
   - Status indicator (Approved/Warning/Blocked)
   - Balance, amount, remaining display
   - Required minimum balance
   - Mode indicator

3. **Blocked Alert** (`src/components/Purchase/BlockedAlert.jsx`)
   - Red alert banner
   - Error message
   - **Maximum affordable amount**: `balance ÷ limiter`
   - Calculation breakdown
   - "Use Max Affordable" button

4. **Bucket Selector** (`src/components/Purchase/BucketSelector.jsx`)
   - Radio buttons or dropdown
   - Exclude Savings
   - Show balances for each bucket

**Mock Data**:
```javascript
export const mockModeLimiters = {
  light: { Necessity: 2, Investment: 2, Learning: 2, Emergency: 2, Fun: 10 },
  intermediate: { Necessity: 5, Investment: 4, Learning: 4, Emergency: 4, Fun: 10 },
  strict: { Necessity: 6, Investment: 5, Learning: 5, Emergency: 5, Fun: 10 },
};

// Example scenarios:
// Balance: $1000, Mode: Intermediate, Bucket: Necessity (limiter ×5)
// Max affordable: $1000 ÷ 5 = $200
// If user enters $300: BLOCKED (needs $300 × 5 = $1500, only has $1000)
```

**Estimated Time**: 4-5 hours (most complex)

---

### 📋 Phase 5: Expenses Page

**Why Fifth**: Simpler than purchase, good for form patterns

**Components to Build**:
1. **Expenses Page** (`src/pages/Expenses.jsx`)
   - Active expenses list
   - Summary card
   - Add expense button

2. **Expense Card** (`src/components/Expenses/ExpenseCard.jsx`)
   - Name, amount, currency
   - Due date (if set)
   - Priority indicator
   - Active toggle

3. **Add/Edit Expense Form** (`src/components/Expenses/ExpenseForm.jsx`)
   - All expense fields
   - Active toggle

**Mock Data**:
```javascript
export const mockExpenses = [
  {
    id: '1',
    name: 'Rent',
    amount: 800,
    currency: 'USD',
    active: true,
    dueDate: '2025-12-01',
    priority: 1,
    note: 'Monthly rent payment'
  },
  {
    id: '2',
    name: 'Utilities',
    amount: 150,
    currency: 'USD',
    active: true,
    dueDate: '2025-11-25',
    priority: 2
  },
];
```

**Estimated Time**: 2-3 hours

---

### 📜 Phase 6: Transactions Page

**Why Sixth**: List view, filtering patterns, good for data display

**Components to Build**:
1. **Transactions Page** (`src/pages/Transactions.jsx`)
   - Filters bar
   - Transaction list grouped by date

2. **Transaction Item** (`src/components/Transactions/TransactionItem.jsx`)
   - Type icon
   - Item name/description
   - Bucket name
   - Amount (positive/negative)
   - Date/time

3. **Filters Bar** (`src/components/Transactions/FiltersBar.jsx`)
   - Date range picker
   - Bucket filter (multi-select)
   - Currency filter
   - Type filter

**Mock Data**:
```javascript
export const mockTransactions = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    currency: 'USD',
    date: '2025-11-15T10:00:00Z',
    note: 'Salary'
  },
  {
    id: '2',
    type: 'expense',
    amount: -150,
    currency: 'USD',
    bucketId: '1',
    bucketName: 'Necessity',
    itemName: 'Groceries',
    category: 'Food',
    date: '2025-11-16T14:30:00Z'
  },
  {
    id: '3',
    type: 'expense',
    amount: -50,
    currency: 'USD',
    bucketId: '5',
    bucketName: 'Fun',
    itemName: 'Movie tickets',
    category: 'Entertainment',
    date: '2025-11-16T19:00:00Z'
  },
];
```

**Estimated Time**: 3-4 hours

---

### ⚙️ Phase 7: Settings Page

**Why Seventh**: Simpler page, good for completing navigation

**Components to Build**:
1. **Settings Page** (`src/pages/Settings.jsx`)
   - Mode selection cards
   - Currency settings
   - Profile section
   - Logout button

2. **Mode Card** (`src/components/Settings/ModeCard.jsx`)
   - Mode name
   - Description
   - Limiter values table
   - Radio button/toggle

**Mock Data**: Use existing mockSettings

**Estimated Time**: 2-3 hours

---

### 📊 Phase 8: Analytics Page (Optional for MVP)

**Why Last**: Nice to have, requires chart libraries

**Components to Build**:
1. **Analytics Page** (`src/pages/Analytics.jsx`)
   - Summary cards
   - Charts (install recharts or chart.js)
   - Per-item spend table

**Estimated Time**: 4-5 hours

---

## Quick Start: Create Mock Data File

Create `src/data/mockData.js` with all the mock data above, then import where needed.

## Component Structure

```
src/
  components/
    Layout/
      AppLayout.jsx
      Header.jsx
    Navigation/
      BottomNav.jsx
    Buckets/
      BucketCard.jsx
    Dashboard/
      QuickActions.jsx
    Income/
      AllocationPreview.jsx
    Purchase/
      AffordabilityCheck.jsx
      BlockedAlert.jsx
      BucketSelector.jsx
    Expenses/
      ExpenseCard.jsx
      ExpenseForm.jsx
    Transactions/
      TransactionItem.jsx
      FiltersBar.jsx
    Forms/
      CurrencyInput.jsx
      DatePicker.jsx
      TextInput.jsx
      TextArea.jsx
    Settings/
      ModeCard.jsx
  pages/
    Dashboard.jsx
    AddIncome.jsx
    RecordPurchase.jsx
    Expenses.jsx
    Transactions.jsx
    Settings.jsx
    Analytics.jsx
  data/
    mockData.js
```

## Recommended Order Summary

1. ✅ **Layout & Navigation** (Foundation)
2. ✅ **Dashboard** (Main page, establishes design)
3. ✅ **Add Income** (Important flow)
4. ✅ **Record Purchase** (Core feature, most complex)
5. ✅ **Expenses** (Simple forms)
6. ✅ **Transactions** (List views)
7. ✅ **Settings** (Complete navigation)
8. ⬜ **Analytics** (Optional)

## Tips

- **Start with Dashboard**: Gives you the most visual progress
- **Build reusable components**: Button, Card, Input components first
- **Use Tailwind utilities**: Leverage Tailwind for styling
- **Test on mobile viewport**: Always check mobile-first
- **Mock data is your friend**: Don't worry about real data yet


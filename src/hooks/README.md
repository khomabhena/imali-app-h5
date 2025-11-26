# Data Service Hooks

React hooks for fetching and managing data from Supabase.

## Available Hooks

### `useBuckets()`
Fetch all bucket definitions (shared across users).

```jsx
import { useBuckets } from '../hooks';

function MyComponent() {
  const { buckets, loading, error, refetch } = useBuckets();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {buckets.map(bucket => (
        <div key={bucket.id}>{bucket.name}</div>
      ))}
    </div>
  );
}
```

### `useSettings()`
Fetch and update user settings.

```jsx
import { useSettings } from '../hooks';

function MyComponent() {
  const { settings, loading, updateSettings } = useSettings();
  
  const handleModeChange = async (mode) => {
    const { error } = await updateSettings({ default_mode: mode });
    if (error) {
      console.error('Failed to update mode:', error);
    }
  };
  
  return <div>Current mode: {settings?.default_mode}</div>;
}
```

### `useBalances(currency)`
Fetch user balances for a specific currency.

```jsx
import { useBalances } from '../hooks';

function MyComponent() {
  const { balances, loading, getBalanceByBucket } = useBalances('USD');
  
  const necessityBalance = getBalanceByBucket(necessityBucketId);
  
  return <div>Necessity: ${necessityBalance}</div>;
}
```

### `useTransactions(filters)`
Fetch and create transactions.

```jsx
import { useTransactions } from '../hooks';

function MyComponent() {
  const { transactions, loading, createTransaction } = useTransactions({
    type: 'expense',
    currency: 'USD',
  });
  
  const handleCreate = async () => {
    const { data, error } = await createTransaction({
      type: 'expense',
      amount: -50,
      bucket_id: bucketId,
      item_name: 'Groceries',
    });
  };
}
```

### `useExpenses(filters)`
Fetch and manage expenses.

```jsx
import { useExpenses } from '../hooks';

function MyComponent() {
  const { expenses, loading, createExpense, updateExpense, deleteExpense } = useExpenses({
    active: 'active',
    currency: 'USD',
  });
  
  const handleToggle = async (expenseId, isActive) => {
    await updateExpense(expenseId, { active: isActive });
  };
}
```

### `useWishlist(filters)`
Fetch and manage wishlist items.

```jsx
import { useWishlist } from '../hooks';

function MyComponent() {
  const { wishlistItems, loading, createWishlistItem, deleteWishlistItem } = useWishlist({
    currency: 'USD',
  });
  
  const handleAdd = async () => {
    await createWishlistItem({
      name: 'MacBook Pro',
      amount: 2499,
      bucket_id: bucketId,
    });
  };
}
```

## Services

### `recordIncome(data)`
Record income and automatically allocate to buckets.

```jsx
import { recordIncome } from '../services';

const { data, error } = await recordIncome({
  userId: user.id,
  amount: 1800,
  currency: 'USD',
  note: 'Salary',
});
```

### `recordPurchase(data)`
Record a purchase with affordability check.

```jsx
import { recordPurchase } from '../services';

const { data, error } = await recordPurchase({
  userId: user.id,
  amount: 50,
  bucketId: bucketId,
  itemName: 'Groceries',
});
```

## Error Handling

All hooks return an `error` state that you should check:

```jsx
const { data, error } = await createTransaction(...);

if (error) {
  // Handle error
  console.error('Failed:', error);
  // Show error message to user
}
```

## Loading States

All hooks provide a `loading` state:

```jsx
const { loading } = useBuckets();

if (loading) {
  return <LoadingSpinner />;
}
```

## Refetching Data

All hooks provide a `refetch` function to manually refresh data:

```jsx
const { refetch } = useTransactions();

// After creating a new transaction
await createTransaction(...);
await refetch(); // Refresh the list
```


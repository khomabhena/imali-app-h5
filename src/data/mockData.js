// Mock data for UI development
// Replace with real Supabase queries later
import { bucketColors } from './colors.js';

export const mockBuckets = [
  { 
    id: '1', 
    name: 'Necessity', 
    balance: 1250.50, 
    allocationPct: 10, 
    color: bucketColors.Necessity  // Cyan-teal: #0891b2
  },
  { 
    id: '2', 
    name: 'Investment', 
    balance: 1250.50, 
    allocationPct: 10, 
    color: bucketColors.Investment  // Primary teal: #14b8a6
  },
  { 
    id: '3', 
    name: 'Learning', 
    balance: 1250.50, 
    allocationPct: 10, 
    color: bucketColors.Learning  // Sky blue-teal: #0ea5e9
  },
  { 
    id: '4', 
    name: 'Emergency', 
    balance: 500.00, 
    allocationPct: 10, 
    color: bucketColors.Emergency  // Red: #ef4444
  },
  { 
    id: '5', 
    name: 'Fun', 
    balance: 2500.75, 
    allocationPct: 10, 
    color: bucketColors.Fun  // Amber: #f59e0b
  },
  { 
    id: '6', 
    name: 'Savings', 
    balance: 5248.25, 
    allocationPct: 0, 
    color: bucketColors.Savings  // Slate gray: #64748b
  },
];

export const mockSettings = {
  mode: 'intermediate',
  defaultCurrency: 'USD',
};

export const mockModeLimiters = {
  light: { 
    Necessity: 2, 
    Investment: 2, 
    Learning: 2, 
    Emergency: 2, 
    Fun: 10 
  },
  intermediate: { 
    Necessity: 3, 
    Investment: 3, 
    Learning: 3, 
    Emergency: 3, 
    Fun: 10 
  },
  strict: { 
    Necessity: 6, 
    Investment: 5, 
    Learning: 5, 
    Emergency: 5, 
    Fun: 10 
  },
};

export const mockActiveExpenses = [
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

export const mockTransactions = [
  {
    id: '1',
    type: 'income',
    amount: 1900,
    currency: 'USD',
    date: '2025-11-15T10:00:00Z',
    note: 'Salary',
    bucketId: null,
    bucketName: null,
    itemName: null,
    category: null
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
    date: '2025-11-16T14:30:00Z',
    note: 'Weekly grocery shopping'
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
    date: '2025-11-16T19:00:00Z',
    note: null
  },
  {
    id: '4',
    type: 'expense',
    amount: -25,
    currency: 'USD',
    bucketId: '3',
    bucketName: 'Learning',
    itemName: 'Online course',
    category: 'Education',
    date: '2025-11-14T09:00:00Z',
    note: 'React course subscription'
  },
  {
    id: '5',
    type: 'income',
    amount: 3000,
    currency: 'USD',
    date: '2025-11-01T10:00:00Z',
    note: 'Freelance work',
    bucketId: null,
    bucketName: null,
    itemName: null,
    category: null
  },
];

// Helper function to get bucket by ID
export const getBucketById = (id) => {
  return mockBuckets.find(bucket => bucket.id === id);
};

// Helper function to get limiter for current mode
export const getLimiter = (bucketName, mode = mockSettings.mode) => {
  return mockModeLimiters[mode]?.[bucketName] || 1;
};

// Helper function to calculate max affordable amount
export const calculateMaxAffordable = (balance, bucketName, mode = mockSettings.mode) => {
  const limiter = getLimiter(bucketName, mode);
  return balance / limiter;
};

// Helper function to check affordability
export const checkAffordability = (amount, balance, bucketName, mode = mockSettings.mode) => {
  const limiter = getLimiter(bucketName, mode);
  const requiredBalance = amount * limiter;
  return {
    isAffordable: balance >= requiredBalance,
    requiredBalance,
    maxAffordable: balance / limiter,
    limiter
  };
};

// Helper function to format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString, locale = 'en-US') => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};


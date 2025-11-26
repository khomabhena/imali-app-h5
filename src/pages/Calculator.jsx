/**
 * Financial Calculator / What-If Simulator
 * Stateless calculator to test income allocation and affordability
 */
import { useState, useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useBuckets } from '../hooks/useBuckets';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency, checkAffordability, calculateMaxAffordable } from '../data/mockData';
import { getBucketColor } from '../data/colors';
import { 
  CalculatorIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

const MODES = [
  { id: 'light', name: 'Light', description: 'More flexible' },
  { id: 'intermediate', name: 'Intermediate', description: 'Balanced' },
  { id: 'strict', name: 'Strict', description: 'Maximum discipline' },
];

export default function Calculator() {
  const { buckets, loading: bucketsLoading } = useBuckets();
  const { settings, loading: settingsLoading } = useSettings();
  
  // Income Simulator State
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeCurrency, setIncomeCurrency] = useState(settings?.default_currency || 'USD');
  const [expenses, setExpenses] = useState([{ id: 1, name: '', amount: '' }]);
  const [selectedMode, setSelectedMode] = useState(settings?.default_mode || 'intermediate');

  // Affordability Checker State
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [selectedBucketId, setSelectedBucketId] = useState('');

  // Calculate allocation from simulated income
  const allocation = useMemo(() => {
    const income = parseFloat(incomeAmount) || 0;
    const totalExpenses = expenses.reduce((sum, exp) => {
      return sum + (parseFloat(exp.amount) || 0);
    }, 0);
    const netAfterExpenses = Math.max(0, income - totalExpenses);

    // Allocation: Necessity gets 60%, others get 10% each
    const allocationBuckets = buckets.filter(b => b.name !== 'Savings');
    const necessityBucket = allocationBuckets.find(b => b.name === 'Necessity');
    const otherBuckets = allocationBuckets.filter(b => b.name !== 'Necessity');

    const necessityAllocation = netAfterExpenses * 0.6;
    const otherBucketAllocation = netAfterExpenses * 0.1;
    const totalAllocated = necessityAllocation + (otherBucketAllocation * otherBuckets.length);
    const remainderToSavings = netAfterExpenses - totalAllocated;

    // Calculate bucket balances after allocation
    const bucketBalances = {};
    if (necessityBucket) {
      bucketBalances[necessityBucket.id] = necessityAllocation;
    }
    otherBuckets.forEach(bucket => {
      bucketBalances[bucket.id] = otherBucketAllocation;
    });
    const savingsBucket = buckets.find(b => b.name === 'Savings');
    if (savingsBucket) {
      bucketBalances[savingsBucket.id] = remainderToSavings;
    }

    return {
      income,
      totalExpenses,
      netAfterExpenses,
      necessityAllocation,
      otherBucketAllocation,
      remainderToSavings,
      bucketBalances,
      necessityBucket,
      otherBuckets,
      savingsBucket,
    };
  }, [incomeAmount, expenses, buckets]);

  // Calculate affordability
  const affordability = useMemo(() => {
    if (!itemAmount || !selectedBucketId || !allocation.bucketBalances[selectedBucketId]) {
      return null;
    }

    const bucket = buckets.find(b => b.id === selectedBucketId);
    if (!bucket) return null;

    const bucketBalance = allocation.bucketBalances[selectedBucketId];
    const amount = parseFloat(itemAmount) || 0;

    return checkAffordability(
      amount,
      bucketBalance,
      bucket.name,
      selectedMode
    );
  }, [itemAmount, selectedBucketId, allocation.bucketBalances, buckets, selectedMode]);

  const handleAddExpense = () => {
    setExpenses([...expenses, { id: Date.now(), name: '', amount: '' }]);
  };

  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleExpenseChange = (id, field, value) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const handleClear = () => {
    setIncomeAmount('');
    setExpenses([{ id: 1, name: '', amount: '' }]);
    setItemName('');
    setItemAmount('');
    setSelectedBucketId('');
  };

  if (bucketsLoading || settingsLoading) {
    return (
      <AppLayout>
        <PageLayout
          title="Financial Calculator"
          subtitle="Test scenarios without saving data"
          showBackButton={true}
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-sm text-gray-600">Loading calculator...</p>
            </div>
          </div>
        </PageLayout>
      </AppLayout>
    );
  }

  const availableBuckets = buckets.filter(b => b.name !== 'Savings');

  return (
    <AppLayout>
      <PageLayout
        title="Financial Calculator"
        subtitle="Test scenarios without saving data"
        showBackButton={true}
      >
        {/* Mode Selector */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <p className="text-xs text-gray-500 mb-2">Discipline Mode</p>
          <div className="flex gap-2">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedMode === mode.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Income Simulator */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Income Simulator</h3>
            <p className="text-xs text-gray-500">Enter income to see allocation breakdown</p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Income Input */}
            <div>
              <Input
                label="Income Amount"
                type="number"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                placeholder="0.00"
                icon={CurrencyDollarIcon}
                step="0.01"
                min="0"
              />
            </div>

            {/* Currency Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={incomeCurrency}
                onChange={(e) => setIncomeCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 hover:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Expenses Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Expenses (Optional)
                </label>
                <button
                  onClick={handleAddExpense}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Expense
                </button>
              </div>
              <div className="space-y-2">
                {expenses.map((expense, index) => (
                  <div key={expense.id} className="flex gap-2">
                    <Input
                      placeholder="Expense name"
                      value={expense.name}
                      onChange={(e) => handleExpenseChange(expense.id, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={expense.amount}
                      onChange={(e) => handleExpenseChange(expense.id, 'amount', e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-24"
                    />
                    {expenses.length > 1 && (
                      <button
                        onClick={() => handleRemoveExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Allocation Preview */}
            {incomeAmount && parseFloat(incomeAmount) > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Allocation Preview</h4>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gross Income:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(allocation.income, incomeCurrency)}
                    </span>
                  </div>
                  {allocation.totalExpenses > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Expenses:</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(allocation.totalExpenses, incomeCurrency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Net After Expenses:</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(allocation.netAfterExpenses, incomeCurrency)}
                    </span>
                  </div>
                </div>

                {/* Bucket Allocations */}
                <div className="space-y-2">
                  {allocation.necessityBucket && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBucketColor(allocation.necessityBucket.name).main }}
                        />
                        <span className="text-sm text-gray-700">{allocation.necessityBucket.name}</span>
                        <span className="text-xs text-gray-500">(60%)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(allocation.necessityAllocation, incomeCurrency)}
                      </span>
                    </div>
                  )}

                  {allocation.otherBuckets.map(bucket => (
                    <div key={bucket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBucketColor(bucket.name).main }}
                        />
                        <span className="text-sm text-gray-700">{bucket.name}</span>
                        <span className="text-xs text-gray-500">(10%)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(allocation.otherBucketAllocation, incomeCurrency)}
                      </span>
                    </div>
                  ))}

                  {allocation.savingsBucket && (
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getBucketColor(allocation.savingsBucket.name).main }}
                        />
                        <span className="text-sm text-gray-700">{allocation.savingsBucket.name}</span>
                        <span className="text-xs text-gray-500">(Remainder)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(allocation.remainderToSavings, incomeCurrency)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Affordability Checker */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Affordability Checker</h3>
            <p className="text-xs text-gray-500">Check if you can afford an item with simulated income</p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Item Input */}
            <Input
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., MacBook Pro"
            />

            <Input
              label="Item Amount"
              type="number"
              value={itemAmount}
              onChange={(e) => setItemAmount(e.target.value)}
              placeholder="0.00"
              icon={CurrencyDollarIcon}
              step="0.01"
              min="0"
            />

            {/* Bucket Selector */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2.5">
                Select Bucket
              </label>
              <select
                value={selectedBucketId}
                onChange={(e) => setSelectedBucketId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-4 text-lg min-h-[52px] bg-gray-50 hover:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              >
                <option value="">Select a bucket</option>
                {availableBuckets.map(bucket => {
                  const balance = allocation.bucketBalances[bucket.id] || 0;
                  return (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name} ({formatCurrency(balance, incomeCurrency)})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Affordability Result */}
            {affordability && selectedBucketId && (
              <div className={`rounded-xl border-2 p-4 ${
                affordability.isAffordable
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {affordability.isAffordable ? (
                    <>
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                      <h4 className="text-sm font-semibold text-green-900">Purchase Approved</h4>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="w-6 h-6 text-red-600" />
                      <h4 className="text-sm font-semibold text-red-900">Purchase Blocked</h4>
                    </>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bucket Balance:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(allocation.bucketBalances[selectedBucketId], incomeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item Amount:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(parseFloat(itemAmount), incomeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required Balance:</span>
                    <span className={`font-medium ${
                      affordability.isAffordable ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {formatCurrency(affordability.requiredBalance, incomeCurrency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Limiter ({selectedMode}):</span>
                    <span className="font-medium text-gray-900">×{affordability.limiter}</span>
                  </div>
                  {!affordability.isAffordable && (
                    <div className="pt-2 border-t border-red-200">
                      <div className="flex justify-between mb-1">
                        <span className="text-red-700">Max Affordable:</span>
                        <span className="font-bold text-red-900">
                          {formatCurrency(affordability.maxAffordable, incomeCurrency)}
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-2">
                        You need {formatCurrency(affordability.requiredBalance, incomeCurrency)} but only have {formatCurrency(allocation.bucketBalances[selectedBucketId], incomeCurrency)}
                      </p>
                    </div>
                  )}
                  {affordability.isAffordable && (
                    <div className="pt-2 border-t border-green-200">
                      <div className="flex justify-between">
                        <span className="text-green-700">Remaining Balance:</span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(
                            allocation.bucketBalances[selectedBucketId] - parseFloat(itemAmount),
                            incomeCurrency
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedBucketId && !affordability && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-500">
                  Enter an item amount to check affordability
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Clear Button */}
        <Button
          onClick={handleClear}
          variant="secondary"
          className="w-full"
        >
          Clear All
        </Button>
      </PageLayout>
    </AppLayout>
  );
}


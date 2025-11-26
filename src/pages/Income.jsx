import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useBuckets } from '../hooks/useBuckets';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../contexts/AuthContext';
import { recordIncome } from '../services/incomeService';
import { formatCurrency } from '../data/mockData';
import { CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export default function Income() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buckets, loading: bucketsLoading } = useBuckets();
  const { settings, loading: settingsLoading } = useSettings();
  const { expenses, loading: expensesLoading } = useExpenses({ active: 'active' });
  const [formData, setFormData] = useState({
    amount: '',
    currency: settings?.default_currency || 'USD',
    date: new Date().toISOString().split('T')[0],
    source: '',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Update currency when settings load
  useEffect(() => {
    if (settings?.default_currency) {
      setFormData(prev => ({ ...prev, currency: settings.default_currency }));
    }
  }, [settings]);

  // Calculate allocation preview
  const amount = parseFloat(formData.amount) || 0;
  const activeExpensesTotal = expenses
    .filter(exp => exp.active && exp.currency_code === formData.currency)
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  const netAfterExpenses = Math.max(0, amount - activeExpensesTotal);
  
  // Allocation: Necessity gets 60%, others get 10% each (excluding Savings)
  const allocationBuckets = buckets.filter(b => b.name !== 'Savings');
  const necessityBucket = allocationBuckets.find(b => b.name === 'Necessity');
  const otherBuckets = allocationBuckets.filter(b => b.name !== 'Necessity');
  
  const necessityAllocation = netAfterExpenses * 0.6; // 60%
  const otherBucketAllocation = netAfterExpenses * 0.1; // 10% each
  const totalAllocated = necessityAllocation + (otherBucketAllocation * otherBuckets.length);
  const remainderToSavings = netAfterExpenses - totalAllocated;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.currency) {
      newErrors.currency = 'Please select a currency';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !user) return;

    setSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await recordIncome({
        userId: user.id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: new Date(formData.date).toISOString(),
        note: formData.note,
        source: formData.source,
      });

      if (error) {
        setErrors({ submit: error.message || 'Failed to record income' });
        setSubmitting(false);
        return;
      }

      // Success - navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error recording income:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setSubmitting(false);
    }
  };

  if (bucketsLoading || settingsLoading || expensesLoading) {
    return (
      <AppLayout>
        <PageLayout
          title="Add Income"
          subtitle="Record your income and see how it will be allocated"
          showBackButton={true}
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </PageLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageLayout
        title="Add Income"
        subtitle="Record your income and see how it will be allocated"
        showBackButton={true}
      >
        <form onSubmit={handleSubmit} className="pb-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          {/* Form Fields Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <div className="space-y-4">
              {/* Amount Input */}
              <Input
                label="Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                error={errors.amount}
                icon={CurrencyDollarIcon}
                step="0.01"
                min="0"
              />

              {/* Currency Selector */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border transition-all duration-200
                    pl-3 pr-3 py-3 text-gray-900 text-base
                    ${errors.currency
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 bg-gray-50 hover:bg-white hover:border-gray-300'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                  `}
                  required
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
                {errors.currency && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.currency}</p>
                )}
              </div>

              {/* Date Picker */}
              <Input
                label="Date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                error={errors.date}
                icon={CalendarIcon}
              />

              {/* Source/Description (Optional) */}
              <Input
                label="Source"
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., Salary, Freelance, Bonus"
                helperText="Optional: Where did this income come from?"
              />

              {/* Note (Optional) */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="
                    w-full rounded-lg border border-gray-200 transition-all duration-200
                    px-3 py-3 text-gray-900 placeholder-gray-400 text-base
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
                    bg-gray-50 hover:bg-white hover:border-gray-300
                    resize-none
                  "
                />
              </div>
            </div>
          </div>

          {/* Allocation Preview */}
          {amount > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 mb-4">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700">Allocation Preview</h3>
              </div>
              <div className="p-4">
              
                {/* Summary */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gross Income</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(amount, formData.currency)}
                    </span>
                  </div>
                  {activeExpensesTotal > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Expenses</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(activeExpensesTotal, formData.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-1">
                        <span className="text-gray-900">Net After Expenses</span>
                        <span className="text-teal-600">
                          {formatCurrency(netAfterExpenses, formData.currency)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bucket Allocations */}
                <div className="space-y-3 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Bucket Allocations</p>
                  
                  {/* Necessity - 60% */}
                  {necessityBucket && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: necessityBucket.color }}
                        />
                        <span className="text-sm text-gray-700">{necessityBucket.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(necessityAllocation, formData.currency)}
                      </span>
                    </div>
                  )}

                  {/* Other buckets - 10% each */}
                  {otherBuckets.map(bucket => (
                    <div key={bucket.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bucket.color }}
                        />
                        <span className="text-sm text-gray-700">{bucket.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(otherBucketAllocation, formData.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Savings */}
                {remainderToSavings > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: mockBuckets.find(b => b.name === 'Savings')?.color }}
                        />
                        <span className="text-sm font-medium text-gray-700">Savings (Remainder)</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(remainderToSavings, formData.currency)}
                      </span>
                    </div>
                  </div>
                )}

                {netAfterExpenses < 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      ⚠️ Your expenses exceed your income. Consider adjusting your expenses or income amount.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="full"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={!amount || amount <= 0 || submitting}
            >
              {submitting ? 'Recording Income...' : 'Record Income'}
            </Button>
          </div>
        </form>
      </PageLayout>
    </AppLayout>
  );
}


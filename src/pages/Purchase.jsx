import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { 
  mockBuckets, 
  mockSettings, 
  mockActiveExpenses,
  formatCurrency, 
  checkAffordability,
  calculateMaxAffordable,
  getLimiter
} from '../data/mockData';
import { CurrencyDollarIcon, CalendarIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Purchase() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    bucketId: '',
    itemName: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [isDailyExpense, setIsDailyExpense] = useState(false);
  const [dailyAmount, setDailyAmount] = useState('');

  // Get available buckets (exclude Savings)
  const availableBuckets = mockBuckets.filter(b => b.name !== 'Savings');
  const selectedBucket = availableBuckets.find(b => b.id === formData.bucketId);
  
  // Calculate days remaining in current month
  const getDaysRemainingInMonth = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = lastDayOfMonth.getDate() - today.getDate();
    return daysRemaining;
  };

  const daysRemaining = getDaysRemainingInMonth();
  const dailyAmountValue = parseFloat(dailyAmount) || 0;
  const monthlyTotal = isDailyExpense ? dailyAmountValue * daysRemaining : 0;

  // Calculate affordability
  const amount = isDailyExpense ? monthlyTotal : (parseFloat(formData.amount) || 0);
  let affordability = null;
  if (selectedBucket && amount > 0) {
    affordability = checkAffordability(
      amount,
      selectedBucket.balance,
      selectedBucket.name,
      mockSettings.mode
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUseMaxAffordable = () => {
    if (selectedBucket && affordability) {
      const maxAmount = Math.max(0, affordability.maxAffordable - 1);
      setFormData(prev => ({ ...prev, amount: maxAmount.toFixed(2) }));
      // Scroll to top after state update
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (isDailyExpense) {
      if (!dailyAmount || dailyAmountValue <= 0) {
        newErrors.amount = 'Daily amount must be greater than 0';
      }
    } else {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    }
    if (!formData.bucketId) {
      newErrors.bucketId = 'Please select a bucket';
    }
    if (!isDailyExpense && !formData.itemName) {
      newErrors.itemName = 'Item name is required';
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    if (affordability && !affordability.isAffordable) {
      newErrors.affordability = 'Purchase is not affordable';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (isDailyExpense) {
        // Just a check, don't record - affordability is already shown
        return;
      }
      // TODO: Submit to backend
      console.log('Purchase recorded:', formData);
      // Navigate back to dashboard
      navigate('/dashboard');
    }
  };

  const modeLabels = {
    light: 'Light',
    intermediate: 'Intermediate',
    strict: 'Strict'
  };

  // Determine header color based on affordability status
  const headerColor = selectedBucket && amount > 0 && affordability && !affordability.isAffordable
    ? 'bg-gradient-to-br from-red-600 to-red-700'
    : 'bg-gradient-to-br from-teal-500 to-teal-600';

  return (
    <AppLayout>
      <div>
        {/* Custom Header with dynamic color */}
        <div className={`${headerColor} text-white px-4 pt-12 pb-8`}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">Record Purchase</h1>
                <p className="text-sm text-white/80">Record a purchase and check affordability</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-md mx-auto px-4 -mt-4">
        <form onSubmit={handleSubmit} className="pb-6">
          {/* Form Fields Card */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <div className="space-y-4">
              {/* Bucket Selector */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bucket <span className="text-red-500">*</span>
                </label>
                <select
                  name="bucketId"
                  value={formData.bucketId}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border transition-all duration-200
                    pl-3 pr-3 py-3 text-gray-900 text-base
                    ${errors.bucketId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
                      : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 bg-gray-50 hover:bg-white hover:border-gray-300'
                    }
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                  `}
                  required
                >
                  <option value="">Select a bucket</option>
                  {availableBuckets.map(bucket => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name} ({formatCurrency(bucket.balance)})
                    </option>
                  ))}
                </select>
                {errors.bucketId && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.bucketId}</p>
                )}
              </div>

              {/* Daily Expense Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-700">Daily Expense</label>
                  <p className="text-xs text-gray-500">Check affordability for remaining days in month</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsDailyExpense(!isDailyExpense);
                    if (!isDailyExpense) {
                      setDailyAmount('');
                      setFormData(prev => ({ ...prev, amount: '' }));
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDailyExpense ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDailyExpense ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Amount Input - Single Purchase */}
              {!isDailyExpense && (
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
              )}

              {/* Daily Amount Input */}
              {isDailyExpense && (
                <div>
                  <Input
                    label="Daily Amount"
                    type="number"
                    value={dailyAmount}
                    onChange={(e) => setDailyAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    icon={CurrencyDollarIcon}
                    step="0.01"
                    min="0"
                  />
                  {dailyAmountValue > 0 && (
                    <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Monthly Breakdown:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Daily amount:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(dailyAmountValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days remaining:</span>
                          <span className="font-medium text-gray-900">{daysRemaining} days</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-teal-200">
                          <span className="font-medium text-gray-900">Total cost:</span>
                          <span className="font-semibold text-teal-600">{formatCurrency(monthlyTotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Item Name */}
              {!isDailyExpense && (
                <Input
                  label="Item Name"
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g., Groceries, Movie tickets"
                  required
                  error={errors.itemName}
                />
              )}

              {/* Category (Optional) */}
              <Input
                label="Category"
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g., Food, Entertainment"
                helperText="Optional: Categorize this purchase"
              />

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

          {/* Affordability Check */}
          {selectedBucket && amount > 0 && affordability && (
            <div className={`bg-white rounded-xl border mb-4 ${
              affordability.isAffordable 
                ? 'border-green-200 shadow-sm' 
                : 'border-red-200 shadow-sm'
            }`}>
              <div className={`px-4 py-3 rounded-t-xl ${
                affordability.isAffordable 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600' 
                  : 'bg-gradient-to-r from-red-600 to-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  {affordability.isAffordable ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 text-white" />
                      <h3 className="text-sm font-semibold text-white">Purchase Approved</h3>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                      <h3 className="text-sm font-semibold text-white">Purchase Blocked</h3>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                {affordability.isAffordable ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">This purchase is affordable</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bucket Balance</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(selectedBucket.balance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Amount</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining After Purchase</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(selectedBucket.balance - amount)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-600">Mode</span>
                        <span className="font-medium text-gray-900">
                          {modeLabels[mockSettings.mode]} (×{affordability.limiter})
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Blocked Alert */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-semibold text-red-900 mb-4">
                        Affordability Limit Exceeded.
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">You need a balance of</span>
                          <span className="font-semibold text-red-900">
                            {formatCurrency(affordability.requiredBalance)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-700">You only have</span>
                          <span className="font-semibold text-red-900">
                            {formatCurrency(selectedBucket.balance)}
                          </span>
                        </div>
                        {(() => {
                          // Step 1: Calculate how much additional balance is needed in this bucket
                          // Required balance = amount × limiter (what you need to afford the purchase)
                          // Current balance = what you currently have
                          const additionalBalanceNeeded = affordability.requiredBalance - selectedBucket.balance;
                          
                          // If already have enough, no income needed
                          if (additionalBalanceNeeded <= 0) {
                            return null;
                          }
                          
                          // Step 2: Calculate net income needed (after expenses, before allocations)
                          // Income allocation: Necessity gets 60%, others get 10%
                          const allocationPct = selectedBucket.name === 'Necessity' ? 0.6 : 0.1;
                          const netIncomeNeeded = additionalBalanceNeeded / allocationPct;
                          
                          // Step 3: Add active expenses to get gross income needed
                          // Income flow: Gross Income - Expenses = Net Income → Allocations
                          const activeExpensesTotal = mockActiveExpenses
                            .filter(exp => exp.active && exp.currency === 'USD')
                            .reduce((sum, exp) => sum + exp.amount, 0);
                          
                          const grossIncomeNeeded = netIncomeNeeded + activeExpensesTotal;
                          
                          return (
                            <div className="flex justify-between text-sm">
                              <span className="text-red-700">You need an Income of</span>
                              <span className="font-semibold text-red-900">
                                {formatCurrency(grossIncomeNeeded)}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Max Affordable Display */}
                      <div className="bg-white p-3 rounded border border-red-200 mb-3">
                        <p className="text-xs text-gray-600 mb-1">You can afford up to:</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(affordability.maxAffordable)}
                        </p>
                      </div>

                      {/* Quick Action */}
                      <Button
                        type="button"
                        variant="outline"
                        size="full"
                        onClick={handleUseMaxAffordable}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Use Max Affordable
                      </Button>
                    </div>

                    {/* Alternative Buckets */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-2">Other Buckets Available:</p>
                      <div className="space-y-2">
                        {availableBuckets
                          .filter(b => b.id !== formData.bucketId)
                          .map(bucket => {
                            const maxAffordable = calculateMaxAffordable(
                              bucket.balance,
                              bucket.name,
                              mockSettings.mode
                            );
                            return (
                              <div
                                key={bucket.id}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, bucketId: bucket.id }));
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: bucket.color }}
                                  />
                                  <span className="text-sm text-gray-700">{bucket.name}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs text-gray-500 block">Max: {formatCurrency(maxAffordable)}</span>
                                  <span className="text-xs text-gray-400">Balance: {formatCurrency(bucket.balance)}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
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
              disabled={!amount || amount <= 0 || (affordability && !affordability.isAffordable)}
            >
              {isDailyExpense ? 'Check Affordability' : 'Record Purchase'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}


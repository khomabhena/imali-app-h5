import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '../data/mockData';
import { CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

const PRIORITIES = [
  { value: '', label: 'None' },
  { value: '1', label: 'High' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Low' },
];

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.includes('/edit/');
  const editExpense = location.state?.expense;
  const { settings } = useSettings();
  const { createExpense, updateExpense } = useExpenses();
  const [formData, setFormData] = useState({
    name: editExpense?.name || '',
    amount: editExpense?.amount?.toString() || '',
    currency: editExpense?.currency_code || settings?.default_currency || 'USD',
    category: editExpense?.category || '', // Category for reporting (optional)
    paymentType: editExpense?.paid_amount !== undefined && editExpense?.paid_amount < editExpense?.amount ? 'incremental' : 'full', // 'full' or 'incremental'
    paidAmount: editExpense?.paid_amount?.toString() || '', // For incremental payments
    dueDate: editExpense?.due_date ? editExpense.due_date.split('T')[0] : '',
    priority: editExpense?.priority?.toString() || '',
    note: editExpense?.note || '',
    active: editExpense?.active !== undefined ? editExpense.active : true,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Expense name is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.currency) {
      newErrors.currency = 'Please select a currency';
    }
    if (formData.paymentType === 'incremental') {
      const paidAmount = parseFloat(formData.paidAmount || 0);
      const totalAmount = parseFloat(formData.amount || 0);
      if (paidAmount < 0) {
        newErrors.paidAmount = 'Paid amount cannot be negative';
      }
      if (paidAmount > totalAmount) {
        newErrors.paidAmount = 'Paid amount cannot exceed total amount';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate remaining amount for incremental payments
  const remainingAmount = formData.paymentType === 'incremental' && formData.amount && formData.paidAmount
    ? parseFloat(formData.amount) - parseFloat(formData.paidAmount || 0)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const expenseData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency_code: formData.currency,
        category: formData.category || null, // Category for reporting (optional)
        paid_amount: formData.paymentType === 'incremental' ? parseFloat(formData.paidAmount || 0) : parseFloat(formData.amount), // Full payment or partial
        active: formData.active,
        due_date: formData.dueDate || null,
        priority: formData.priority ? parseInt(formData.priority) : null,
        note: formData.note || null,
      };

      if (isEditing && editExpense?.id) {
        const { error } = await updateExpense(editExpense.id, expenseData);
        if (error) {
          setErrors({ submit: error || 'Failed to update expense' });
          setSubmitting(false);
          return;
        }
      } else {
        const { error } = await createExpense(expenseData);
        if (error) {
          setErrors({ submit: error || 'Failed to create expense' });
          setSubmitting(false);
          return;
        }
      }

      // Success - navigate back
      navigate('/expenses');
    } catch (err) {
      console.error('Error creating expense:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageLayout
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        subtitle={isEditing ? 'Update expense details' : 'Create a one-time expense'}
        showBackButton={true}
      >
        <form onSubmit={handleSubmit} className="pb-6">
          {/* Form Fields Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <div className="space-y-5">
              {/* Expense Name */}
              <Input
                label="Expense Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Rent, Utilities, Insurance"
                required
                error={errors.name}
              />

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
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Currency <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className={`
                    w-full rounded-lg border transition-all duration-200
                    pl-4 pr-4 py-4 text-gray-900 text-lg min-h-[52px]
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
                  <p className="mt-2 text-base text-red-600">{errors.currency}</p>
                )}
              </div>

              {/* Category Selector (Optional) */}
              <div className="w-full">
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Category <span className="text-gray-400 text-sm">(Optional)</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 bg-gray-50 hover:bg-white hover:border-gray-300 transition-all duration-200 pl-4 pr-4 py-4 text-gray-900 text-lg min-h-[52px] focus:outline-none focus:ring-2 focus:ring-offset-0"
                >
                  <option value="">No category</option>
                  <option value="Necessity">Necessity</option>
                  <option value="Investment">Investment</option>
                  <option value="Learning">Learning</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Fun">Fun</option>
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Categorize for reporting. All expenses deduct from Expense Bucket automatically.
                </p>
              </div>

              {/* Payment Type */}
              <div className="w-full">
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Payment Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentType: 'full', paidAmount: prev.amount }))}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      formData.paymentType === 'full'
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Full Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentType: 'incremental', paidAmount: prev.paidAmount || '0' }))}
                    className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                      formData.paymentType === 'incremental'
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Incremental
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  {formData.paymentType === 'full' 
                    ? 'Deduct full amount immediately'
                    : 'Pay little by little over time'
                  }
                </p>
              </div>

              {/* Paid Amount (for incremental payments) */}
              {formData.paymentType === 'incremental' && (
                <>
                  <Input
                    label="Amount Paid So Far"
                    type="number"
                    name="paidAmount"
                    value={formData.paidAmount}
                    onChange={handleChange}
                    placeholder="0.00"
                    error={errors.paidAmount}
                    icon={CurrencyDollarIcon}
                    step="0.01"
                    min="0"
                    helperText={`Remaining: ${remainingAmount >= 0 ? formatCurrency(remainingAmount, formData.currency) : '0.00'}`}
                  />
                  {formData.amount && formData.paidAmount && remainingAmount > 0 && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Payment Progress:</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (parseFloat(formData.paidAmount || 0) / parseFloat(formData.amount)) * 100)}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Paid: {formatCurrency(parseFloat(formData.paidAmount || 0), formData.currency)}</span>
                        <span className="text-gray-600">Remaining: {formatCurrency(remainingAmount, formData.currency)}</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Due Date */}
              <Input
                label="Due Date"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                icon={CalendarIcon}
                helperText="Optional: When is this expense due?"
              />

              {/* Priority */}
              <div className="w-full">
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="
                    w-full rounded-lg border border-gray-200 transition-all duration-200
                    pl-4 pr-4 py-4 text-gray-900 text-lg min-h-[52px]
                    focus:border-teal-500 focus:ring-teal-500/20 bg-gray-50 hover:bg-white hover:border-gray-300
                    focus:outline-none focus:ring-2 focus:ring-offset-0
                  "
                >
                  {PRIORITIES.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <label className="text-sm font-medium text-gray-700">Active</label>
                  <p className="text-xs text-gray-500">Active expenses are deducted from the selected bucket</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.active ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Note (Optional) */}
              <div className="w-full">
                <label className="block text-base font-medium text-gray-700 mb-2.5">
                  Note
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Add any additional notes..."
                  rows={4}
                  className="
                    w-full rounded-lg border border-gray-200 transition-all duration-200
                    px-4 py-4 text-gray-900 placeholder-gray-400 text-lg
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none
                    bg-gray-50 hover:bg-white hover:border-gray-300
                    resize-none
                  "
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="full"
              onClick={() => navigate('/expenses')}
            >
              Cancel
            </Button>
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Expense' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </PageLayout>
    </AppLayout>
  );
}


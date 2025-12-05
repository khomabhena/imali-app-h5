/**
 * Expenses Page
 * One-time expense management
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import { useExpenses } from '../hooks/useExpenses';
import { useSettings } from '../hooks/useSettings';
import { formatCurrency } from '../data/mockData';
import { PlusIcon, CalendarIcon, ExclamationCircleIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Expenses() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currency = settings?.default_currency || 'USD';
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { expenseId, expenseName }
  const { expenses, loading, toggleActive, deleteExpense } = useExpenses({
    active: filter,
    currency,
  });

  // Helper to get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Necessity': 'bg-cyan-100 text-cyan-700',
      'Investment': 'bg-teal-100 text-teal-700',
      'Learning': 'bg-blue-100 text-blue-700',
      'Emergency': 'bg-red-100 text-red-700',
      'Fun': 'bg-amber-100 text-amber-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  // Helper to calculate payment progress
  const getPaymentProgress = (expense) => {
    if (!expense.paid_amount && expense.paid_amount !== 0) {
      return null; // Full payment, no progress tracking
    }
    const total = parseFloat(expense.amount || 0);
    const paid = parseFloat(expense.paid_amount || 0);
    const remaining = total - paid;
    const percentage = total > 0 ? (paid / total) * 100 : 0;
    return { paid, remaining, total, percentage };
  };

  // Calculate totals (for active expenses in current currency)
  const totalActive = expenses
    .filter(exp => exp.active && exp.currency_code === currency)
    .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleToggleActive = async (expenseId, isActive) => {
    await toggleActive(expenseId, isActive);
  };

  const handleEdit = (expense) => {
    navigate(`/expenses/edit/${expense.id}`, {
      state: { expense }
    });
  };

  const handleDeleteClick = (expenseId, expenseName) => {
    setDeleteConfirm({ expenseId, expenseName });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      await deleteExpense(deleteConfirm.expenseId);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const getPriorityColor = (priority) => {
    if (priority === 1) return 'text-red-600 bg-red-50';
    if (priority === 2) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 1) return 'High';
    if (priority === 2) return 'Medium';
    return 'Low';
  };

  return (
    <AppLayout>
      <PageLayout
        title="Expenses"
        subtitle="Manage your one-time expenses"
        showBackButton={true}
      >
        {/* Summary Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Active Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalActive)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <ExclamationCircleIcon className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <p className="text-xs text-gray-500 mb-2">Filter</p>
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Add Expense Button */}
        <button
          onClick={() => navigate('/expenses/add')}
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl py-3 px-3 mb-4 flex items-center justify-center gap-2 hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-semibold">Add Expense</span>
        </button>

        {/* Expenses List */}
        <div className="bg-white rounded-xl border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-sm text-gray-600">Loading expenses...</p>
            </div>
          ) : expenses.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {expenses.map((expense) => (
                <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{expense.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            expense.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {expense.active ? 'Active' : 'Inactive'}
                        </span>
                        {expense.priority && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(expense.priority)}`}
                          >
                            {getPriorityLabel(expense.priority)}
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(expense.amount, expense.currency_code)}
                      </p>
                      {expense.category && (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      )}
                      {(() => {
                        const progress = getPaymentProgress(expense);
                        if (progress && progress.remaining > 0) {
                          return (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Paid: {formatCurrency(progress.paid, expense.currency_code)}</span>
                                <span>Remaining: {formatCurrency(progress.remaining, expense.currency_code)}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-teal-500 h-1.5 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, progress.percentage)}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(expense.id, !expense.active)}
                        className={`p-2 rounded-lg transition-colors ${
                          expense.active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        aria-label={expense.active ? 'Deactivate expense' : 'Activate expense'}
                      >
                        {expense.active ? (
                          <CheckIcon className="w-5 h-5" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(expense)}
                        className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense.id, expense.name)}
                        className="p-2 rounded-lg border border-gray-300 text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                    {expense.dueDate && (
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Due: {formatDate(expense.dueDate)}</span>
                      </div>
                    )}
                    {expense.note && (
                      <span className="text-gray-400">• {expense.note}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-1">No expenses found</p>
              <p className="text-xs text-gray-400">
                {filter === 'all' 
                  ? 'Add your first expense to get started'
                  : `No ${filter} expenses`
                }
              </p>
            </div>
          )}
        </div>
      </PageLayout>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Delete Expense?
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <span className="font-medium">"{deleteConfirm.expenseName}"</span>? This action cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

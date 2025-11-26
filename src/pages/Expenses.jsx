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
import { PlusIcon, CalendarIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Expenses() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const currency = settings?.default_currency || 'USD';
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const { expenses, loading, toggleActive, deleteExpense } = useExpenses({
    active: filter,
    currency,
  });

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

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(expenseId);
    }
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
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          expense.active
                            ? 'bg-green-600 border-green-600'
                            : 'border-gray-300'
                        }`} />
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
    </AppLayout>
  );
}

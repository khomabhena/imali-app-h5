/**
 * Analytics Page
 * Spending insights and visualizations
 */
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import { mockTransactions, mockBuckets, mockSettings, formatCurrency } from '../data/mockData';
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function Analytics() {
  const [timePeriod, setTimePeriod] = useState('thisMonth');
  const [currency, setCurrency] = useState(mockSettings.defaultCurrency);

  // Filter transactions by currency and time period
  const filteredTransactions = mockTransactions.filter(t => t.currency === currency);

  // Calculate summary
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0));

  const netBalance = totalIncome - totalExpenses;

  // Calculate per-item spend
  const itemSpend = filteredTransactions
    .filter(t => t.type === 'expense' && t.itemName)
    .reduce((acc, t) => {
      const key = t.itemName;
      if (!acc[key]) {
        acc[key] = {
          name: key,
          total: 0,
          count: 0,
          bucket: t.bucketName,
          category: t.category,
        };
      }
      acc[key].total += Math.abs(t.amount);
      acc[key].count += 1;
      return acc;
    }, {});

  const topItems = Object.values(itemSpend)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Calculate per-bucket spending
  const bucketSpending = filteredTransactions
    .filter(t => t.type === 'expense' && t.bucketId)
    .reduce((acc, t) => {
      const bucketName = t.bucketName || 'Unknown';
      if (!acc[bucketName]) {
        acc[bucketName] = {
          name: bucketName,
          total: 0,
          color: mockBuckets.find(b => b.name === bucketName)?.color || '#64748b',
        };
      }
      acc[bucketName].total += Math.abs(t.amount);
      return acc;
    }, {});

  const bucketSpendingArray = Object.values(bucketSpending)
    .sort((a, b) => b.total - a.total);

  // Get top spending category
  const categorySpend = filteredTransactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      const category = t.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(t.amount);
      return acc;
    }, {});

  const topCategory = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <AppLayout>
      <PageLayout
        title="Analytics"
        subtitle="Spending insights and visualizations"
        showBackButton={true}
      >
        {/* Time Period & Currency Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-2">Time Period</p>
              <div className="flex gap-2 flex-wrap">
                {['thisMonth', 'lastMonth', 'thisYear', 'all'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      timePeriod === period
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period === 'thisMonth' ? 'This Month' :
                     period === 'lastMonth' ? 'Last Month' :
                     period === 'thisYear' ? 'This Year' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Currency</p>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 hover:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">ZAR</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Total Income</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(totalIncome, currency)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-xs text-gray-500">Total Expenses</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(totalExpenses, currency)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-teal-600" />
              </div>
              <p className="text-xs text-gray-500">Net Balance</p>
            </div>
            <p className={`text-lg font-bold ${
              netBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(netBalance, currency)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-xs text-gray-500">Top Category</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {topCategory ? topCategory[0] : 'N/A'}
            </p>
            {topCategory && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(topCategory[1], currency)}
              </p>
            )}
          </div>
        </div>

        {/* Per-Bucket Spending */}
        {bucketSpendingArray.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 mb-4">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">Spending by Bucket</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {bucketSpendingArray.map((bucket) => {
                  const maxSpending = Math.max(...bucketSpendingArray.map(b => b.total));
                  const percentage = maxSpending > 0 ? (bucket.total / maxSpending) * 100 : 0;
                  
                  return (
                    <div key={bucket.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: bucket.color }}
                          />
                          <span className="text-sm text-gray-700">{bucket.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(bucket.total, currency)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: bucket.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Top Items by Spend */}
        {topItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 mb-4">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">Top Items by Spend</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {topItems.map((item, index) => (
                <div key={item.name} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.total, currency)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 ml-8">
                    {item.bucket && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {item.bucket}
                      </span>
                    )}
                    {item.category && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {item.category}
                      </span>
                    )}
                    <span>{item.count} {item.count === 1 ? 'purchase' : 'purchases'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <ChartBarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-1">No data available</p>
            <p className="text-xs text-gray-400">Try selecting a different time period or currency</p>
          </div>
        )}
      </PageLayout>
    </AppLayout>
  );
}

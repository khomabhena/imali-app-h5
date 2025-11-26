/**
 * Transactions Page
 * Transaction history with filters
 */
import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import TransactionItem from '../components/transactions/TransactionItem';
import { useTransactions } from '../hooks/useTransactions';
import { useBuckets } from '../hooks/useBuckets';
import { useSettings } from '../hooks/useSettings';
import { FunnelIcon } from '@heroicons/react/24/outline';

export default function Transactions() {
  const { settings } = useSettings();
  const { buckets } = useBuckets();
  const currency = settings?.default_currency || 'USD';
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBucket, setSelectedBucket] = useState('all');

  const { transactions, loading } = useTransactions({
    type: selectedType,
    bucketId: selectedBucket,
    currency,
  });

  // Group by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <AppLayout>
      <PageLayout
        title="Transactions"
        subtitle="View your transaction history"
        showBackButton={true}
      >
        <div className="pb-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">Filters</p>
            </div>
            
            <div className="space-y-3">
              {/* Type Filter */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Type</p>
                <div className="flex gap-2">
                  {['all', 'income', 'expense'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedType === type
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bucket Filter */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Bucket</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedBucket('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedBucket === 'all'
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {buckets.map((bucket) => (
                    <button
                      key={bucket.id}
                      onClick={() => setSelectedBucket(bucket.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedBucket === bucket.id
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {bucket.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-sm text-gray-600">Loading transactions...</p>
            </div>
          ) : Object.keys(groupedTransactions).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <div key={date}>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500">{date}</p>
                  </div>
                  <div className="px-4">
                    {transactions.map((transaction) => (
                      <TransactionItem key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-1">No transactions found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </div>
        </div>
      </PageLayout>
    </AppLayout>
  );
}



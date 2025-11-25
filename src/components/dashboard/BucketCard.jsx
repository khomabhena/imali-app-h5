/**
 * BucketCard Component
 * Displays a bucket with balance and allocation
 */
import { formatCurrency } from '../../data/mockData';
import { getBucketColor } from '../../data/colors';

export default function BucketCard({ bucket, onClick }) {
  const colors = getBucketColor(bucket.name);
  const isPositive = bucket.balance >= 0;
  const balanceColor = isPositive ? 'text-gray-900' : 'text-red-600';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: colors.main }}
        >
          {bucket.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{bucket.name}</h3>
          {bucket.allocationPct > 0 && (
            <p className="text-xs text-gray-500">{bucket.allocationPct}% allocation</p>
          )}
        </div>
      </div>
      
      <div>
        <p className={`text-2xl font-bold ${balanceColor}`}>
          {formatCurrency(bucket.balance)}
        </p>
        {!isPositive && (
          <p className="text-xs text-red-600 mt-1">Low balance</p>
        )}
      </div>
    </button>
  );
}


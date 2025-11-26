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
      className="w-full bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left active:scale-[0.98] min-h-[120px]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
          style={{ backgroundColor: colors.main }}
        >
          {bucket.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate">{bucket.name}</h3>
          {bucket.allocationPct > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{bucket.allocationPct}% allocation</p>
          )}
        </div>
      </div>
      
      <div>
        <p className={`text-2xl font-bold ${balanceColor}`}>
          {formatCurrency(bucket.balance)}
        </p>
        {!isPositive && (
          <p className="text-sm text-red-600 mt-1.5">Low balance</p>
        )}
      </div>
    </button>
  );
}


/**
 * TransactionItem Component
 * Displays a single transaction
 */
import { formatCurrency, formatDate } from '../../data/mockData';

export default function TransactionItem({ transaction }) {
  const isExpense = transaction.type === 'expense';
  const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
  const sign = isExpense ? '-' : '+';
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isExpense ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <span className={`text-lg ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
            {isExpense ? '↓' : '↑'}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {transaction.item_name || transaction.note || transaction.type}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(transaction.date)}
            {transaction.bucket?.name && ` • ${transaction.bucket.name}`}
          </p>
        </div>
      </div>
      <p className={`font-semibold ${amountColor}`}>
        {sign}{formatCurrency(Math.abs(transaction.amount), transaction.currency_code)}
      </p>
    </div>
  );
}


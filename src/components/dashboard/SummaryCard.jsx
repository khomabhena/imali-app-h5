/**
 * SummaryCard Component
 * Shows income/expenses summary
 */
import { formatCurrency } from '../../data/mockData';

export default function SummaryCard({ label, amount, isPositive = true }) {
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const sign = isPositive ? '+' : '-';
  
  return (
    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <p className="text-sm text-teal-100 mb-1.5">{label}</p>
      <p className={`text-xl font-bold ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
        {sign}{formatCurrency(Math.abs(amount))}
      </p>
    </div>
  );
}


import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../data/mockData';
import { useBuckets } from '../hooks/useBuckets';
import { useBalances } from '../hooks/useBalances';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';
import BucketCard from '../components/dashboard/BucketCard';
import { Squares2X2Icon, PlusIcon, CreditCardIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { buckets, loading: bucketsLoading } = useBuckets();
  const { settings } = useSettings();
  const currency = settings?.default_currency || 'USD';
  const { balances, loading: balancesLoading, getBalanceByBucket } = useBalances(currency);
  
  // Combine buckets with balances
  const bucketsWithBalances = buckets.map(bucket => ({
    ...bucket,
    balance: getBalanceByBucket(bucket.id),
  }));
  
  // Calculate total balance
  const totalBalance = bucketsWithBalances.reduce((sum, bucket) => sum + bucket.balance, 0);
  
  // Loading state
  if (bucketsLoading || balancesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white px-4 pt-12 pb-8">
        <div className="max-w-md mx-auto">
          {/* User Welcome */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 hidden rounded-full bg-white/20 items-center justify-center">
                <span className="text-lg font-semibold">U</span>
              </div>
              <div>
                <p className="font-bold text-2xl">iMali</p>
                <p className="text-sm text-teal-100">{user?.email?.split('@')[0] || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Total Balance */}
          <div>
            <p className="text-sm text-teal-100 mb-2">Total Balance</p>
            <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-md mx-auto px-4 -mt-4">
            {/* Quick Actions - At the Top */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => navigate('/income')}
                className="bg-white rounded-xl p-5 border-2 border-dashed border-gray-300 hover:border-teal-500 transition-colors flex flex-col items-center justify-center gap-2.5"
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <PlusIcon className="w-6 h-6 text-teal-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">Add Income</p>
              </button>
              
              <button
                onClick={() => navigate('/purchase')}
                className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white hover:from-teal-600 hover:to-teal-700 transition-all flex flex-col items-center justify-center gap-2.5 shadow-lg shadow-teal-500/30"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold">Record Purchase</p>
              </button>
            </div>

            {/* Buckets Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Buckets</h2>
            <button className="text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors">
              View all
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {bucketsWithBalances.map((bucket) => (
              <BucketCard
                key={bucket.id}
                bucket={bucket}
                onClick={() => navigate(`/buckets/${bucket.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}



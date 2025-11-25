import { useNavigate } from 'react-router-dom';
import { mockBuckets, formatCurrency } from '../data/mockData';
import AppLayout from '../components/layout/AppLayout';
import BucketCard from '../components/dashboard/BucketCard';
import { Squares2X2Icon, PlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Calculate total balance
  const totalBalance = mockBuckets.reduce((sum, bucket) => sum + bucket.balance, 0);
  
  // All buckets in one array (Savings included)
  const allBuckets = [...mockBuckets];

  return (
    <AppLayout>
      {/* Header Section */}
      <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white px-4 pt-12 pb-8">
        <div className="max-w-md mx-auto">
          {/* User Welcome */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg font-semibold">U</span>
              </div>
              <div>
                <p className="font-semibold">Welcome Back</p>
                <p className="text-sm text-teal-100">User</p>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Squares2X2Icon className="w-6 h-6" />
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
            {allBuckets.map((bucket) => (
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



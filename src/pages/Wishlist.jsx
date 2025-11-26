import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import { useWishlist } from '../hooks/useWishlist';
import { useBuckets } from '../hooks/useBuckets';
import { useBalances } from '../hooks/useBalances';
import { useSettings } from '../hooks/useSettings';
import { 
  checkAffordability,
  formatCurrency 
} from '../data/mockData';
import { 
  PlusIcon, 
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function Wishlist() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { buckets } = useBuckets();
  const currency = settings?.default_currency || 'USD';
  const { balances, getBalanceByBucket } = useBalances(currency);
  const [filter, setFilter] = useState('all'); // all, affordable, blocked
  const [bucketFilter, setBucketFilter] = useState('all');
  
  const { wishlistItems, loading, deleteWishlistItem } = useWishlist({
    bucketId: bucketFilter !== 'all' ? bucketFilter : 'all',
    currency,
  });

  // Calculate affordability for each item
  const itemsWithAffordability = wishlistItems.map(item => {
    const bucket = buckets.find(b => b.id === item.bucket_id);
    if (!bucket) return { ...item, affordability: null };
    
    const bucketBalance = getBalanceByBucket(item.bucket_id);
    const affordability = checkAffordability(
      item.amount,
      bucketBalance,
      bucket.name,
      settings?.default_mode || 'intermediate'
    );
    
    return {
      ...item,
      affordability,
      bucketBalance,
      bucketName: bucket.name,
    };
  });

  // Filter items
  const filteredItems = itemsWithAffordability.filter(item => {
    if (filter === 'affordable' && !item.affordability?.isAffordable) return false;
    if (filter === 'blocked' && item.affordability?.isAffordable) return false;
    if (bucketFilter !== 'all' && item.bucket_id !== bucketFilter) return false;
    return true;
  });

  // Get available buckets (exclude Savings)
  const availableBuckets = buckets.filter(b => b.name !== 'Savings');

  const handleBuyNow = (item) => {
    // Navigate to purchase page with pre-filled data
    navigate('/purchase', {
      state: {
        prefill: {
          amount: item.amount,
          bucketId: item.bucket_id,
          itemName: item.name,
          category: item.category,
          note: item.note,
        }
      }
    });
  };

  const handleEdit = (item) => {
    navigate(`/wishlist/edit/${item.id}`, {
      state: { item }
    });
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your wishlist?')) {
      await deleteWishlistItem(itemId);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-700 border-red-300';
      case 2: return 'bg-amber-100 text-amber-700 border-amber-300';
      case 3: return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Low';
    }
  };

  return (
    <AppLayout>
      <PageLayout
        title="Wishlist"
        subtitle="Items you want to buy"
        showBackButton={true}
      >
      <div className="pb-6">
        {/* Summary Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Total Items</h3>
            </div>
            <span className="text-2xl font-bold text-teal-600">{wishlistItems?.length || 0}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Affordable</p>
              <p className="text-lg font-semibold text-green-600">
                {itemsWithAffordability.filter(i => i.affordability?.isAffordable).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Blocked</p>
              <p className="text-lg font-semibold text-red-600">
                {itemsWithAffordability.filter(i => !i.affordability?.isAffordable).length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Filter by Status</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('affordable')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'affordable'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Affordable
                </button>
                <button
                  onClick={() => setFilter('blocked')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'blocked'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Blocked
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Filter by Bucket</p>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setBucketFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bucketFilter === 'all'
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {buckets.filter(b => b.name !== 'Savings').map(bucket => (
                  <button
                    key={bucket.id}
                    onClick={() => setBucketFilter(bucket.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      bucketFilter === bucket.id
                        ? 'bg-teal-600 text-white'
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

        {/* Add Button */}
        <Button
          onClick={() => navigate('/wishlist/add')}
          className="w-full mb-4"
          variant="primary"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add to Wishlist
        </Button>

        {/* Wishlist Items */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading wishlist...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">No items found</p>
            <p className="text-sm text-gray-500 mb-4">
              {filter !== 'all' || bucketFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start adding items to your wishlist'}
            </p>
            {filter === 'all' && bucketFilter === 'all' && (
              <Button
                onClick={() => navigate('/wishlist/add')}
                variant="primary"
              >
                Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => {
              const isAffordable = item.affordability?.isAffordable;
              const bucket = buckets.find(b => b.id === item.bucket_id);
              
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl p-4 border-2 transition-all ${
                    isAffordable
                      ? 'border-green-200 hover:border-green-300'
                      : 'border-red-200 hover:border-red-300'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                          {getPriorityLabel(item.priority)}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-teal-600 mb-1">
                        {formatCurrency(item.amount, item.currency_code)}
                      </p>
                      {item.category && (
                        <p className="text-xs text-gray-500">{item.category}</p>
                      )}
                    </div>
                    
                    {/* Affordability Status */}
                    <div className="flex flex-col items-end gap-1">
                      {isAffordable ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="text-xs font-medium">Affordable</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircleIcon className="w-5 h-5" />
                          <span className="text-xs font-medium">Blocked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bucket Info */}
                  {bucket && (
                    <div className="mb-3 p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">From {item.bucketName || bucket.name}</span>
                        <span className="font-medium text-gray-900">
                          Balance: {formatCurrency(item.bucketBalance || 0, item.currency_code)}
                        </span>
                      </div>
                      {!isAffordable && item.affordability && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                          <p className="text-red-600 mb-1">
                            Need: {formatCurrency(item.affordability.requiredBalance, item.currency_code)}
                          </p>
                          <p className="text-gray-600">
                            Max affordable: {formatCurrency(item.affordability.maxAffordable, item.currency_code)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Note */}
                  {item.note && (
                    <p className="text-sm text-gray-600 mb-3">{item.note}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => handleBuyNow(item)}
                      variant={isAffordable ? 'primary' : 'secondary'}
                      className="flex-1"
                      disabled={!isAffordable}
                    >
                      Buy Now
                    </Button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg border border-gray-300 text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </PageLayout>
    </AppLayout>
  );
}


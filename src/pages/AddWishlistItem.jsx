import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useBuckets } from '../hooks/useBuckets';
import { useBalances } from '../hooks/useBalances';
import { useSettings } from '../hooks/useSettings';
import { useWishlist } from '../hooks/useWishlist';
import { checkAffordability, formatCurrency } from '../data/mockData';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function AddWishlistItem() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.includes('/edit/');
  const editItem = location.state?.item;
  const { settings } = useSettings();
  const { buckets, loading: bucketsLoading } = useBuckets();
  const currency = settings?.default_currency || 'USD';
  const { balances, getBalanceByBucket } = useBalances(currency);
  const { createWishlistItem, updateWishlistItem } = useWishlist();

  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    amount: editItem?.amount?.toString() || '',
    currency: editItem?.currency_code || currency,
    bucketId: editItem?.bucket_id || '',
    priority: editItem?.priority || 2, // 1=High, 2=Medium, 3=Low
    category: editItem?.category || '',
    note: editItem?.note || '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Get available buckets (exclude Savings)
  const availableBuckets = buckets.filter(b => b.name !== 'Savings');
  const selectedBucket = availableBuckets.find(b => b.id === formData.bucketId);

  // Calculate affordability in real-time
  const amount = parseFloat(formData.amount) || 0;
  const bucketBalance = selectedBucket ? getBalanceByBucket(selectedBucket.id) : 0;
  const affordability = selectedBucket && amount > 0
    ? checkAffordability(
        amount,
        bucketBalance,
        selectedBucket.name,
        settings?.default_mode || 'intermediate'
      )
    : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePriorityChange = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority: parseInt(priority)
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.bucketId) {
      newErrors.bucketId = 'Please select a bucket';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const itemData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency_code: formData.currency,
        bucket_id: formData.bucketId,
        priority: formData.priority,
        category: formData.category || null,
        note: formData.note || null,
      };

      if (isEditing && editItem?.id) {
        const { error } = await updateWishlistItem(editItem.id, itemData);
        if (error) {
          setErrors({ submit: error || 'Failed to update wishlist item' });
          setSubmitting(false);
          return;
        }
      } else {
        const { error } = await createWishlistItem(itemData);
        if (error) {
          setErrors({ submit: error || 'Failed to create wishlist item' });
          setSubmitting(false);
          return;
        }
      }

      // Success - navigate back
      navigate('/wishlist');
    } catch (err) {
      console.error('Error saving wishlist item:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setSubmitting(false);
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

  if (bucketsLoading) {
    return (
      <PageLayout
        title={isEditing ? 'Edit Wishlist Item' : 'Add to Wishlist'}
        subtitle={isEditing ? 'Update item details' : 'Save items you want to buy'}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={isEditing ? 'Edit Wishlist Item' : 'Add to Wishlist'}
      subtitle={isEditing ? 'Update item details' : 'Save items you want to buy'}
    >
      <form onSubmit={handleSubmit} className="pb-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}
        {/* Form Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="space-y-5">
            {/* Item Name */}
            <Input
              label="Item Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., MacBook Pro 16 inch"
              error={errors.name}
              required
            />

            {/* Amount */}
            <div>
              <Input
                label="Estimated Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.amount}
                required
                step="0.01"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                Currency: {formData.currency || currency}
              </p>
            </div>

            {/* Bucket Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bucket <span className="text-red-500">*</span>
              </label>
              {errors.bucketId && (
                <p className="text-sm text-red-600 mb-2">{errors.bucketId}</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {availableBuckets.map(bucket => (
                  <button
                    key={bucket.id}
                    type="button"
                    onClick={() => handleChange({ target: { name: 'bucketId', value: bucket.id } })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.bucketId === bucket.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{bucket.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Balance: {formatCurrency(getBalanceByBucket(bucket.id), formData.currency || currency)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePriorityChange(priority)}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                      formData.priority === priority
                        ? getPriorityColor(priority) + ' border-current'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <Input
              label="Category (optional)"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Electronics, Travel, Education"
            />

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (optional)
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 placeholder-gray-400 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Affordability Preview */}
        {selectedBucket && amount > 0 && affordability && (
          <div className={`bg-white rounded-xl p-4 border-2 mb-4 ${
            affordability.isAffordable
              ? 'border-green-200 bg-green-50/50'
              : 'border-red-200 bg-red-50/50'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {affordability.isAffordable ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">You can afford this!</h3>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Currently not affordable</h3>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item cost:</span>
                <span className="font-medium">{formatCurrency(amount, formData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bucket balance:</span>
                <span className="font-medium">{formatCurrency(selectedBucket.balance, formData.currency)}</span>
              </div>
              {!affordability.isAffordable && (
                <>
                  <div className="flex justify-between text-red-600">
                    <span>Required balance:</span>
                    <span className="font-medium">{formatCurrency(affordability.requiredBalance, formData.currency)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Max affordable:</span>
                    <span className="font-medium">{formatCurrency(affordability.maxAffordable, formData.currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => navigate('/wishlist')}
            variant="secondary"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting}
          >
            {submitting 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Update Item' : 'Add to Wishlist')
            }
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}


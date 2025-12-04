/**
 * Settings Page
 * Mode selection, currency preferences, profile settings
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PageLayout from '../components/layout/PageLayout';
import { useSettings } from '../hooks/useSettings';
import { useBuckets } from '../hooks/useBuckets';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircleIcon, 
  CurrencyDollarIcon, 
  UserIcon, 
  InformationCircleIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

const MODES = [
  {
    id: 'light',
    name: 'Light',
    description: 'More flexible spending limits',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Balanced discipline',
    color: 'bg-teal-50 border-teal-200',
    textColor: 'text-teal-700',
  },
  {
    id: 'strict',
    name: 'Strict',
    description: 'Maximum financial discipline',
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
  },
];

const BUCKET_NAMES = ['Necessity', 'Investment', 'Learning', 'Emergency', 'Fun'];

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { buckets, loading: bucketsLoading } = useBuckets();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const mode = settings?.default_mode || 'intermediate';
  const currency = settings?.default_currency || 'USD';

  // Get limiters from buckets
  const getLimiters = (modeId) => {
    if (!buckets.length) return {};
    const limiters = {};
    buckets.forEach(bucket => {
      if (bucket.name !== 'Savings') {
        limiters[bucket.name] = modeId === 'light' 
          ? bucket.limiter_light 
          : modeId === 'intermediate' 
          ? bucket.limiter_intermediate 
          : bucket.limiter_strict;
      }
    });
    return limiters;
  };

  const handleModeChange = async (newMode) => {
    setSaving(true);
    const { error } = await updateSettings({ default_mode: newMode });
    if (error) {
      console.error('Failed to update mode:', error);
      // You could show an error toast here
    }
    setSaving(false);
  };

  const handleCurrencyChange = async (newCurrency) => {
    setSaving(true);
    const { error } = await updateSettings({ default_currency: newCurrency });
    if (error) {
      console.error('Failed to update currency:', error);
      // You could show an error toast here
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      setShowLogoutConfirm(false);
      navigate('/login', { replace: true });
    }
  };

  if (settingsLoading || bucketsLoading) {
    return (
      <AppLayout>
        <PageLayout
          title="Settings"
          subtitle="Mode, currency, and profile preferences"
          showBackButton={true}
          showSettingsButton={false}
        >
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
              <p className="text-sm text-gray-600">Loading settings...</p>
            </div>
          </div>
        </PageLayout>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageLayout
        title="Settings"
        subtitle="Mode, currency, and profile preferences"
        showBackButton={true}
        showSettingsButton={false}
      >
        {/* Mode Selection */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700">Discipline Mode</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Modes affect affordability checks by setting spending limiters
            </p>
          </div>
          <div className="p-4 space-y-3">
            {MODES.map((modeOption) => {
              const isSelected = mode === modeOption.id;
              const limiters = getLimiters(modeOption.id);
              
              return (
                <button
                  key={modeOption.id}
                  onClick={() => handleModeChange(modeOption.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `${modeOption.color} border-2 ${modeOption.textColor}`
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{modeOption.name}</h4>
                        {isSelected && (
                          <CheckCircleIcon className="w-5 h-5 text-teal-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{modeOption.description}</p>
                      
                      {/* Limiter Values Table */}
                      <div className="bg-white/50 rounded p-2">
                        <p className="text-xs font-medium text-gray-700 mb-1.5">Limiters:</p>
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          {BUCKET_NAMES.map((bucketName) => (
                            <div key={bucketName} className="text-center">
                              <p className="text-gray-500 text-[10px] mb-0.5">{bucketName.slice(0, 3)}</p>
                              <p className="font-semibold text-gray-900">×{limiters[bucketName]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700">Currency</h3>
            </div>
          </div>
          <div className="p-4">
            <label className="block text-xs text-gray-500 mb-2">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 hover:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.name} ({curr.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700">Profile</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email || 'user@example.com'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Account Created</p>
              <p className="text-sm font-medium text-gray-900">November 1, 2025</p>
            </div>
            <button
              onClick={() => console.log('Change password')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">Change Password</p>
              <p className="text-xs text-gray-500 mt-0.5">Update your account password</p>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl border border-gray-200 mb-4">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <InformationCircleIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-700">About</h3>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">App Version</p>
              <p className="text-sm font-medium text-gray-900">1.0.0</p>
            </div>
            <button
              onClick={() => console.log('Terms of Service')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">Terms of Service</p>
            </button>
            <button
              onClick={() => console.log('Privacy Policy')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">Privacy Policy</p>
            </button>
            <button
              onClick={() => console.log('Support')}
              className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <p className="text-sm font-medium text-gray-900">Support & Contact</p>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-red-100 active:bg-red-200 transition-colors mb-4 min-h-[56px] touch-manipulation"
          type="button"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="font-semibold text-base">Logout</span>
        </button>

        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Logout</h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium min-h-[48px] touch-manipulation"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors font-medium min-h-[48px] touch-manipulation"
                  type="button"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </AppLayout>
  );
}

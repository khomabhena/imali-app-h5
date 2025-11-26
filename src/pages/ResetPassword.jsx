/**
 * Reset Password Page
 * Handles password reset after clicking the reset link in email
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import ErrorMessage from '../components/auth/ErrorMessage';
import SuccessMessage from '../components/auth/SuccessMessage';
import { useAuth } from '../contexts/AuthContext';
import { useForm, validatePassword } from '../hooks/useForm';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, verifyOtp } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'form', 'success', 'error'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { formData, errors, loading, setErrors, setLoading, handleChange, validate } = useForm(
    { password: '', confirmPassword: '' },
    (data) => {
      const newErrors = {};
      const passwordError = validatePassword(data.password);
      if (passwordError) newErrors.password = passwordError;
      if (!data.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (data.password !== data.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      return newErrors;
    }
  );

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (token_hash && type === 'recovery') {
      // Verify the recovery token
      handleTokenVerification(token_hash, type);
    } else {
      setError('Invalid or missing reset link. Please request a new password reset.');
      setStatus('error');
    }
  }, [searchParams]);

  const handleTokenVerification = async (token_hash, type) => {
    try {
      const { data, error } = await verifyOtp(token_hash, type);
      
      if (error) {
        setError(error.message || 'Invalid or expired reset link. Please request a new one.');
        setStatus('error');
      } else if (data?.user) {
        // Token is valid, show password form
        setStatus('form');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setStatus('error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    setError('');
    
    try {
      const { error } = await updatePassword(formData.password);
      
      if (error) {
        setError(error.message || 'Failed to update password. Please try again.');
      } else {
        setSuccess(true);
        setStatus('success');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'verifying') {
    return (
      <PageLayout
        title="Reset Password"
        subtitle="Verifying your reset link"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Verifying reset link...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (status === 'error') {
    return (
      <PageLayout
        title="Reset Link Invalid"
        subtitle="This password reset link is invalid or has expired"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          {error && <ErrorMessage message={error} />}
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Password reset links expire after a short period for security reasons. Please:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Request a new password reset from the login page</li>
              <li>Make sure you're using the latest link from your email</li>
              <li>Check that the link hasn't been used already</li>
            </ul>
          </div>

          <Button
            variant="primary"
            size="full"
            onClick={() => navigate('/forgot-password')}
          >
            Request New Reset Link
          </Button>
          <Button
            variant="ghost"
            size="full"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (status === 'success') {
    return (
      <PageLayout
        title="Password Reset"
        subtitle="Your password has been successfully updated"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-10 h-10 text-teal-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Updated!
              </h3>
              <p className="text-sm text-gray-600">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
            <Button
              variant="primary"
              size="full"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Form status
  return (
    <PageLayout
      title="Reset Password"
      subtitle="Enter your new password"
    >
      <form onSubmit={handleSubmit} className="pb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <LockClosedIcon className="w-10 h-10 text-teal-600" />
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message="Password updated successfully!" />}

          <div className="space-y-4">
            <PasswordInput
              label="New Password"
              name="newPassword"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
              autoComplete="new-password"
            />

            {formData.password && (
              <PasswordStrength password={formData.password} />
            )}

            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="full"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="full"
              onClick={() => navigate('/login')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}


/**
 * Verify Email Page
 * Handles email verification after signup
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Button from '../components/ui/Button';
import SuccessMessage from '../components/auth/SuccessMessage';
import ErrorMessage from '../components/auth/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerificationEmail, user } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'resend'
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (token_hash && type) {
      handleVerification(token_hash, type);
    } else if (user && !user.email_confirmed_at) {
      // User is logged in but email not verified
      setEmail(user.email);
      setStatus('resend');
    } else if (user && user.email_confirmed_at) {
      // Already verified, redirect to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // No token and no user, redirect to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, user]);

  const handleVerification = async (token_hash, type) => {
    try {
      const { data, error } = await verifyEmail(token_hash, type);
      
      if (error) {
        setError(error.message || 'Verification failed. The link may have expired.');
        setStatus('error');
      } else if (data?.user) {
        setStatus('success');
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setStatus('error');
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    try {
      const { error } = await resendVerificationEmail(email);
      
      if (error) {
        setError(error.message || 'Failed to resend verification email');
      } else {
        setStatus('resend');
        setError('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  if (status === 'verifying') {
    return (
      <PageLayout
        title="Verifying Email"
        subtitle="Please wait while we verify your email address"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-sm text-gray-600">Verifying your email...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (status === 'success') {
    return (
      <PageLayout
        title="Email Verified"
        subtitle="Your email has been successfully verified"
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
                Verification Successful!
              </h3>
              <p className="text-sm text-gray-600">
                Your email has been verified. Redirecting to dashboard...
              </p>
            </div>
            <Button
              variant="primary"
              size="full"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (status === 'error') {
    return (
      <PageLayout
        title="Verification Failed"
        subtitle="We couldn't verify your email address"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          {error && <ErrorMessage message={error} />}
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              The verification link may have expired or is invalid. You can:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
              <li>Request a new verification email</li>
              <li>Check your spam folder</li>
              <li>Make sure you're using the latest link from your email</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="full"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
            {email && (
              <Button
                variant="primary"
                size="full"
                onClick={handleResend}
              >
                Resend Email
              </Button>
            )}
          </div>
        </div>
      </PageLayout>
    );
  }

  // Resend status
  return (
    <PageLayout
      title="Verify Your Email"
      subtitle="We've sent a verification link to your email"
    >
      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <EnvelopeIcon className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Check Your Email
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We've sent a verification link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-gray-500">
            Click the link in the email to verify your account. The link will expire in 24 hours.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Didn't receive the email?
          </p>
          <Button
            variant="secondary"
            size="full"
            onClick={handleResend}
          >
            Resend Verification Email
          </Button>
          <Button
            variant="ghost"
            size="full"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}


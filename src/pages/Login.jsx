import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ErrorMessage from '../components/auth/ErrorMessage';
import EmailInput from '../components/auth/EmailInput';
import PasswordInput from '../components/auth/PasswordInput';
import SubmitButton from '../components/auth/SubmitButton';
import FormFooter from '../components/auth/FormFooter';
import SocialLogin from '../components/auth/SocialLogin';
import { useForm, validateEmail, validatePassword } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';
import { FingerPrintIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    signIn,
    signInWithOAuth,
    signInWithBiometric,
    isBiometricSupported,
    hasBiometricCredentials,
    user,
  } = useAuth();
  const { formData, errors, loading, setErrors, setLoading, handleChange, validate } = useForm(
    { email: '', password: '' },
    (data) => {
      const newErrors = {};
      const emailError = validateEmail(data.email);
      const passwordError = validatePassword(data.password);
      if (emailError) newErrors.email = emailError;
      if (passwordError) newErrors.password = passwordError;
      return newErrors;
    }
  );

  // Check for OAuth error from callback
  useEffect(() => {
    if (location.state?.error) {
      setErrors({ submit: location.state.error });
      // Clear the error from location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, setErrors]);

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors({ submit: error.message || 'Invalid email or password' });
      } else if (data?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setErrors({});
    
    try {
      // Map UI provider names to Supabase provider names
      const providerMap = {
        'Google': 'google',
        'Facebook': 'facebook',
        'Apple': 'apple',
      };
      
      const supabaseProvider = providerMap[provider];
      if (!supabaseProvider) {
        setErrors({ submit: 'Unsupported provider' });
        return;
      }

      const { error } = await signInWithOAuth(supabaseProvider);
      
      if (error) {
        setErrors({ submit: error.message || 'Failed to sign in with ' + provider });
      }
      // OAuth redirects automatically, so we don't need to navigate
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await signInWithBiometric();
      
      if (error) {
        setErrors({ submit: error.message || 'Biometric authentication failed' });
      } else if (data?.user || data?.session) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout
      title="Welcome back"
      subtitle="Sign in to continue"
    >
      <form onSubmit={handleSubmit} className="pb-6">
        {/* Biometric Login Button */}
        {isBiometricSupported && hasBiometricCredentials && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl py-4 px-4 flex items-center justify-center gap-3 hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FingerPrintIcon className="w-6 h-6" />
              <span className="font-semibold text-lg">
                {loading ? 'Authenticating...' : 'Sign in with Biometric'}
              </span>
            </button>
            <div className="mt-4 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="space-y-6">
            <ErrorMessage message={errors.submit} />

            <EmailInput
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

                <PasswordInput
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember" className="ml-3 block text-base text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-base text-teal-600 hover:text-teal-700 font-medium transition-colors py-2 px-2"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <SubmitButton loading={loading} loadingText="Signing in...">
          Sign in
        </SubmitButton>

        <SocialLogin
          onFacebook={() => handleSocialLogin('Facebook')}
          onGoogle={() => handleSocialLogin('Google')}
          onApple={() => handleSocialLogin('Apple')}
        />

        <FormFooter
          text="Don't have an account?"
          linkText="Sign up"
          linkTo="/signup"
        />
      </form>
    </PageLayout>
  );
}


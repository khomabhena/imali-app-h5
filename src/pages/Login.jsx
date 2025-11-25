import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import ErrorMessage from '../components/auth/ErrorMessage';
import EmailInput from '../components/auth/EmailInput';
import PasswordInput from '../components/auth/PasswordInput';
import SubmitButton from '../components/auth/SubmitButton';
import FormFooter from '../components/auth/FormFooter';
import SocialLogin from '../components/auth/SocialLogin';
import { useForm, validateEmail, validatePassword } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithOAuth, user } = useAuth();
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

  return (
    <PageLayout
      title="Welcome back"
      subtitle="Sign in to continue"
    >
      <form onSubmit={handleSubmit} className="pb-6">
        {/* Form Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="space-y-5">
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
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
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


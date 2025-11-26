import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import ErrorMessage from '../components/auth/ErrorMessage';
import EmailInput from '../components/auth/EmailInput';
import PasswordInput from '../components/auth/PasswordInput';
import PasswordStrength from '../components/auth/PasswordStrength';
import SubmitButton from '../components/auth/SubmitButton';
import FormFooter from '../components/auth/FormFooter';
import SocialLogin from '../components/auth/SocialLogin';
import { useForm, validateEmail, validatePassword } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, signInWithOAuth, user } = useAuth();
  const { formData, errors, loading, setErrors, setLoading, handleChange, validate } = useForm(
    { email: '', password: '', confirmPassword: '' },
    (data) => {
      const newErrors = {};
      const emailError = validateEmail(data.email);
      const passwordError = validatePassword(data.password);
      if (emailError) newErrors.email = emailError;
      if (passwordError) newErrors.password = passwordError;
      if (!data.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (data.password !== data.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
      const { data, error } = await signUp(formData.email, formData.password);
      
      if (error) {
        setErrors({ submit: error.message || 'An error occurred. Please try again.' });
      } else if (data?.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // Email already confirmed (e.g., in development mode)
          navigate('/dashboard');
        } else {
          // Email confirmation required - redirect to verification page
          navigate('/verify-email');
        }
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
        setErrors({ submit: error.message || 'Failed to sign up with ' + provider });
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
      title="Get started"
      subtitle="Create your account"
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

            <div>
              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                showToggle={true}
                autoComplete="new-password"
              />
              <PasswordStrength password={formData.password} />
            </div>

            <PasswordInput
              label="Confirm your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <SubmitButton loading={loading} loadingText="Creating account...">
          Sign Up
        </SubmitButton>

        <SocialLogin
          onFacebook={() => handleSocialLogin('Facebook')}
          onGoogle={() => handleSocialLogin('Google')}
          onApple={() => handleSocialLogin('Apple')}
        />

        <FormFooter
          text="Already have an account?"
          linkText="Sign in"
          linkTo="/login"
        />
      </form>
    </PageLayout>
  );
}


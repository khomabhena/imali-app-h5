import { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';
import ErrorMessage from '../components/auth/ErrorMessage';
import EmailInput from '../components/auth/EmailInput';
import SubmitButton from '../components/auth/SubmitButton';
import FormFooter from '../components/auth/FormFooter';
import SuccessMessage from '../components/auth/SuccessMessage';
import { useForm, validateEmail } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { formData, errors, loading, setErrors, setLoading, handleChange, validate } = useForm(
    { email: '' },
    (data) => {
      const newErrors = {};
      const emailError = validateEmail(data.email);
      if (emailError) newErrors.email = emailError;
      return newErrors;
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await resetPassword(formData.email);
      
      if (error) {
        setErrors({ submit: error.message || 'An error occurred. Please try again.' });
      } else {
        setSuccess(true);
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageLayout
        title="Check your email"
        subtitle="We've sent you a reset link"
      >
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <SuccessMessage
            title="Reset link sent"
            message="Please check your email and click the link to reset your password."
            email={formData.email}
            linkText="Back to sign in"
            linkTo="/login"
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Reset password"
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={handleSubmit} className="pb-6">
        {/* Form Card */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <div className="space-y-4">
            <ErrorMessage message={errors.submit || errors.email} />

            <EmailInput
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={EnvelopeIcon}
            />

            <div className="text-sm text-gray-600">
              Enter the email address associated with your account and we'll send you
              a link to reset your password.
            </div>
          </div>
        </div>

        <SubmitButton loading={loading} loadingText="Sending...">
          Send reset link
        </SubmitButton>

        <FormFooter
          linkText="Back to sign in"
          linkTo="/login"
          showBack={true}
        />
      </form>
    </PageLayout>
  );
}


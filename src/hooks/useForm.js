/**
 * useForm Hook
 * Common form state and validation logic
 */
import { useState } from 'react';

export function useForm(initialValues = {}, validateFn) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    if (!validateFn) return true;
    const newErrors = validateFn(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setFormData(initialValues);
    setErrors({});
    setLoading(false);
  };

  return {
    formData,
    errors,
    loading,
    setFormData,
    setErrors,
    setLoading,
    handleChange,
    validate,
    reset,
  };
}

/**
 * Email validation helper
 */
export function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid';
  return '';
}

/**
 * Password validation helper
 */
export function validatePassword(password, minLength = 8) {
  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters`;
  return '';
}


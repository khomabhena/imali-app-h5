/**
 * PasswordInput Component
 * Password input with show/hide toggle icon inside the field
 */
import { useState } from 'react';
import Input from '../ui/Input';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function PasswordInput({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  placeholder = 'Enter your password',
  error,
  required = false,
  showToggle = true,
  autoComplete,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine autocomplete value if not provided
  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    if (name === 'password' || name === 'newPassword') return 'current-password';
    if (name === 'confirmPassword') return 'new-password';
    return 'current-password';
  };

  return (
    <Input
      label={label}
      type={showPassword ? 'text' : 'password'}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error}
      required={required}
      autoComplete={getAutoComplete()}
      rightIcon={showToggle ? (showPassword ? EyeSlashIcon : EyeIcon) : undefined}
      onRightIconClick={showToggle ? () => setShowPassword(!showPassword) : undefined}
      {...props}
    />
  );
}


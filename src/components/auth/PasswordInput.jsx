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
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

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
      rightIcon={showToggle ? (showPassword ? EyeSlashIcon : EyeIcon) : undefined}
      onRightIconClick={showToggle ? () => setShowPassword(!showPassword) : undefined}
      {...props}
    />
  );
}


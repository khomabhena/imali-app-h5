/**
 * EmailInput Component
 * Standardized email input field
 */
import Input from '../ui/Input';

export default function EmailInput({
  value,
  onChange,
  error,
  required = true,
  autoComplete = 'email',
  ...props
}) {
  return (
    <Input
      label="Email"
      type="email"
      name="email"
      value={value}
      onChange={onChange}
      placeholder="you@example.com"
      error={error}
      required={required}
      autoComplete={autoComplete}
      {...props}
    />
  );
}


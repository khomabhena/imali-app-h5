/**
 * Input Component
 * Reusable input field with label, error, and icon support
 */
export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-base font-medium text-gray-700 mb-2.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-lg border transition-all duration-200
            ${Icon ? 'pl-10' : 'pl-3'}
            ${RightIcon ? 'pr-10' : 'pr-3'}
            py-4 text-gray-900 placeholder-gray-400 text-lg min-h-[52px]
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50'
              : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 bg-gray-50 hover:bg-white hover:border-gray-300'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            <RightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-base text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-base text-gray-500">{helperText}</p>
      )}
    </div>
  );
}


/**
 * SuccessMessage Component
 * Displays success state with icon and message
 */
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function SuccessMessage({ title, message, email, linkText, linkTo = '/login' }) {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 animate-fade-in">
        <CheckCircleIcon className="h-10 w-10 text-teal-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {email && (
          <p className="text-sm text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        )}
        {message && (
          <p className="text-sm text-gray-500">{message}</p>
        )}
      </div>

      <div className="pt-4">
        <Link
          to={linkTo}
          className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
}


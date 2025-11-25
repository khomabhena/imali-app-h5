/**
 * FormFooter Component
 * Footer links for auth forms
 */
import { Link } from 'react-router-dom';

export default function FormFooter({ text, linkText, linkTo, showBack = false, backTo = '/login' }) {
  return (
    <div className="text-center pt-4 border-t border-gray-100">
      {showBack ? (
        <Link
          to={backTo}
          className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors inline-flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {linkText}
        </Link>
      ) : (
        <p className="text-sm text-gray-600">
          {text}{' '}
          <Link
            to={linkTo}
            className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
          >
            {linkText}
          </Link>
        </p>
      )}
    </div>
  );
}


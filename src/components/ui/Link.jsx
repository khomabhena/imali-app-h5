/**
 * Link Component
 * Styled link for navigation using React Router
 */
import { Link as RouterLink } from 'react-router-dom';

export default function Link({ children, to, className = '', ...props }) {
  return (
    <RouterLink
      to={to}
      className={`text-teal-600 hover:text-teal-700 font-medium transition-colors ${className}`}
      {...props}
    >
      {children}
    </RouterLink>
  );
}


/**
 * FloatingActionButton Component
 * Circular FAB for quick access to Financial Calculator
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { CalculatorIcon } from '@heroicons/react/24/outline';

export default function FloatingActionButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show FAB on calculator page itself
  if (location.pathname === '/calculator') {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto px-4 relative">
        <button
          onClick={() => navigate('/calculator')}
          className="ml-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 pointer-events-auto"
          aria-label="Financial Calculator"
          title="Financial Calculator"
        >
          <CalculatorIcon className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}


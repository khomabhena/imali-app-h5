/**
 * AppLayout Component
 * Main layout wrapper for authenticated pages with bottom navigation
 */
import BottomNav from './BottomNav';
import FloatingActionButton from './FloatingActionButton';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {children}
      <BottomNav />
      <FloatingActionButton />
    </div>
  );
}


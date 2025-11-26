/**
 * BottomNav Component
 * Mobile bottom navigation bar
 */
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ListBulletIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  CalendarIcon as CalendarIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from '@heroicons/react/24/solid';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { path: '/transactions', label: 'Transactions', icon: ListBulletIcon, iconSolid: ListBulletIconSolid },
  { path: '/expenses', label: 'Expenses', icon: CalendarIcon, iconSolid: CalendarIconSolid },
  { path: '/wishlist', label: 'Wishlist', icon: ShoppingBagIcon, iconSolid: ShoppingBagIconSolid },
  { path: '/analytics', label: 'Analytics', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/') ||
              (item.path === '/wishlist' && location.pathname.startsWith('/wishlist')) ||
              (item.path === '/expenses' && location.pathname.startsWith('/expenses'));
            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg transition-colors min-h-[60px] min-w-[60px] ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-7 h-7" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


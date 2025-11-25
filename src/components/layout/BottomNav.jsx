/**
 * BottomNav Component
 * Mobile bottom navigation bar
 */
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ListBulletIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ListBulletIcon as ListBulletIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon, iconSolid: HomeIconSolid },
  { path: '/transactions', label: 'Transactions', icon: ListBulletIcon, iconSolid: ListBulletIconSolid },
  { path: '/expenses', label: 'Expenses', icon: CalendarIcon, iconSolid: CalendarIconSolid },
  { path: '/analytics', label: 'Analytics', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
  { path: '/settings', label: 'Settings', icon: Cog6ToothIcon, iconSolid: Cog6ToothIconSolid },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/dashboard' && location.pathname === '/');
            const Icon = isActive ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}


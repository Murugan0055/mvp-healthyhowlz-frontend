import clsx from 'clsx';
import { Dumbbell, Home, User, Utensils } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    // { path: '/', icon: Home, label: 'Home' },
    { path: '/diet', icon: Utensils, label: 'Diet' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary">Healthyhowlz</h1>
      </header>

      <main className="flex-1 p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-5 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? location.pathname === item.path : location.pathname?.includes(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-col items-center gap-1 text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

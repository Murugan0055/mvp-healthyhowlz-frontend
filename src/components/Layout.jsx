import clsx from 'clsx';
import { Dumbbell, Home, User, Utensils, Calendar } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/diet', icon: Utensils, label: 'Diet' },
    { path: '/sessions', icon: Calendar, label: 'Sessions' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-primary">Healthyhowlz</h1>
      </header>

      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-around p-3 pb-6 safe-area-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/' ? location.pathname === item.path : location.pathname?.includes(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-tighter transition-all duration-300 min-w-[64px]",
                isActive ? "text-primary scale-110" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon size={22} className={clsx("transition-transform", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              <span className="opacity-80">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;

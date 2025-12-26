import clsx from 'clsx';
import { Book, Home, Users, User } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const TrainerLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/trainer', icon: Home, label: 'Dashboard', exact: true },
    { path: '/trainer/clients', icon: Users, label: 'Clients' },
    { path: '/trainer/library', icon: Book, label: 'Library' },
    { path: '/trainer/profile', icon: User, label: 'Profile' },
  ];
  const header = <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
    <h1 className="text-xl font-bold text-indigo-600">Trainer App</h1>
  </header>;
  const isHeaderNeeded = location.pathname === '/trainer/clients' || location.pathname === '/trainer/library' || location.pathname === '/trainer/profile' || location.pathname === '/trainer';
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {
        isHeaderNeeded && header
      }

      <main className="flex-1 p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-5 safe-area-bottom z-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex flex-col items-center gap-1 text-sm font-medium transition-colors",
                isActive ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
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

export default TrainerLayout;

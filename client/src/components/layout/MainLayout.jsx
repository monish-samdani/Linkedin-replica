import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/feed', icon: '🏠', label: 'Home', hideOnXs: false },
  { to: '/mynetwork', icon: '👥', label: 'My Network', hideOnXs: false },
  { to: '/jobs', icon: '💼', label: 'Jobs', hideOnXs: false },
  { to: '/messaging', icon: '💬', label: 'Messaging', hideOnXs: true },
  { to: '/notifications', icon: '🔔', label: 'Notifications', hideOnXs: false },
];

function LogoMark({ className = '' }) {
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white ${className}`}>
      in
    </div>
  );
}

export default function MainLayout({ children }) {
  const location = useLocation();
  const { user } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-surface-1">
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
          <Link to="/feed" className="shrink-0">
            <LogoMark />
          </Link>

          <div className="mx-4 hidden max-w-md flex-1 md:block">
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              readOnly
            />
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center px-2 py-1 text-xs transition sm:px-3 ${
                    item.hideOnXs ? 'hidden sm:flex' : 'flex'
                  } ${isActive ? 'text-brand-500' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && <span className="mt-0.5 hidden h-0.5 w-full rounded bg-brand-500 sm:block" />}
                </Link>
              );
            })}

            <Link
              to="/in/me"
              className={`ml-1 flex flex-col items-center px-2 py-1 text-xs sm:px-3 ${
                location.pathname.startsWith('/in/') ? 'text-brand-500' : 'text-gray-600'
              }`}
            >
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="" className="avatar h-6 w-6" />
              ) : (
                <div className="avatar flex h-6 w-6 items-center justify-center bg-brand-500 text-[10px] font-bold text-white">
                  {initials}
                </div>
              )}
              <span className="hidden sm:inline">Me</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-14">{children}</main>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

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

            <div className="relative ml-1" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex flex-col items-center px-2 py-1 text-xs sm:px-3 ${
                  location.pathname.startsWith('/in/') ? 'text-brand-500' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="" className="avatar h-6 w-6" />
                ) : (
                  <div className="avatar flex h-6 w-6 items-center justify-center bg-brand-500 text-[10px] font-bold text-white">
                    {initials}
                  </div>
                )}
                <span className="hidden sm:inline">Me ▾</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="card absolute right-0 top-full mt-2 w-44 overflow-hidden py-1 text-sm"
                >
                  <Link
                    to="/in/me"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-gray-700 transition hover:bg-gray-100"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left font-medium text-red-600 transition hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-14">{children}</main>
    </div>
  );
}

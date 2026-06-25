import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { ENDPOINTS } from '../../api/endpoints';
import * as notificationsApi from '../../api/notifications';
import * as messagesApi from '../../api/messages';
import ConnectButton from '../../features/connections/components/ConnectButton';

const UNREAD_POLL_MS = 30000;

const navItems = [
  { to: '/feed', icon: '🏠', label: 'Home', hideOnXs: false },
  { to: '/mynetwork', icon: '👥', label: 'My Network', hideOnXs: false },
  { to: '/jobs', icon: '💼', label: 'Jobs', hideOnXs: false },
  { to: '/messages', icon: '💬', label: 'Messages', hideOnXs: true },
  { to: '/notifications', icon: '🔔', label: 'Notifications', hideOnXs: false },
];

function getInitials(name) {
  return (
    name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  );
}

function LogoMark({ className = '' }) {
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded bg-brand-500 text-sm font-bold text-white ${className}`}>
      in
    </div>
  );
}

function SearchBar() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const { data } = await api.get(ENDPOINTS.USERS.SEARCH_USERS, { params: { q: term } });
        setResults(data.data.users || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (userId) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate(`/in/${userId}`);
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="search"
        placeholder="Search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
      />

      {showDropdown && (
        <div className="card absolute left-0 top-full mt-2 max-h-96 w-full overflow-y-auto py-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-gray-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
              Searching...
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-500">No user found with that name or email.</p>
          ) : (
            results.map((u) => (
              <div
                key={u._id}
                className="flex w-full items-center gap-3 px-4 py-2 transition hover:bg-gray-100"
              >
                <button
                  type="button"
                  onClick={() => handleSelect(u._id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  {u.profilePhoto ? (
                    <img src={u.profilePhoto} alt="" className="avatar h-9 w-9" />
                  ) : (
                    <div className="avatar flex h-9 w-9 items-center justify-center bg-brand-500 text-xs font-bold text-white">
                      {getInitials(u.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
                    {u.headline && <p className="truncate text-xs text-gray-500">{u.headline}</p>}
                  </div>
                </button>
                <div className="shrink-0">
                  <ConnectButton
                    userId={u._id}
                    initialStatus={u.connectionStatus || 'none'}
                    connectionId={u.connectionId || null}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messagesUnread, setMessagesUnread] = useState(0);
  const menuRef = useRef(null);

  const initials = getInitials(user?.name);

  useEffect(() => {
    if (!user) return undefined;

    let active = true;
    const fetchUnread = async () => {
      try {
        const [{ notifications }, { conversations }] = await Promise.all([
          notificationsApi.getNotifications(),
          messagesApi.getConversations(),
        ]);
        if (!active) return;
        setUnreadCount((notifications || []).filter((n) => !n.read).length);
        setMessagesUnread((conversations || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0));
      } catch {
        // Silently ignore polling errors.
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, UNREAD_POLL_MS);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user, location.pathname]);

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
            <SearchBar />
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              const badge =
                item.to === '/notifications' ? unreadCount : item.to === '/messages' ? messagesUnread : 0;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center px-2 py-1 text-xs transition sm:px-3 ${
                    item.hideOnXs ? 'hidden sm:flex' : 'flex'
                  } ${isActive ? 'text-brand-500' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <span className="relative text-lg">
                    {item.icon}
                    {badge > 0 && (
                      <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </span>
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../features/connections/hooks/useConnections';
import ConnectButton from '../features/connections/components/ConnectButton';
import ConnectionRequests from '../features/connections/components/ConnectionRequests';

function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ user, size = 'md' }) {
  const sizes = { md: 'h-12 w-12 text-sm', sm: 'h-10 w-10 text-xs' };
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt="" className={`avatar ${sizes[size]}`} />;
  }
  return (
    <div className={`avatar flex items-center justify-center bg-brand-500 font-bold text-white ${sizes[size]}`}>
      {getInitials(user?.name) || '?'}
    </div>
  );
}

export default function NetworkPage() {
  const { user: authUser } = useAuth();
  const {
    connections,
    sentRequests,
    receivedRequests,
    loading,
    handleSend,
    handleAccept,
    handleReject,
    handleWithdraw,
  } = useConnections();
  const handlers = { handleSend, handleAccept, handleReject, handleWithdraw };

  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get(ENDPOINTS.USERS.ALL);
        if (active) setAllUsers(data.data.users || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load people');
      } finally {
        if (active) setUsersLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const authId = authUser?._id;

  const deriveStatus = (userId) => {
    const received = receivedRequests.find((r) => r.sender?._id === userId);
    if (received) return { status: 'pending_received', connectionId: received._id };

    const sent = sentRequests.find((r) => r.recipient?._id === userId);
    if (sent) return { status: 'pending_sent', connectionId: sent._id };

    const connected = connections.find((c) => {
      const otherId = c.sender?._id === authId ? c.recipient?._id : c.sender?._id;
      return otherId === userId;
    });
    if (connected) return { status: 'connected', connectionId: connected._id };

    return { status: 'none', connectionId: null };
  };

  const suggestions = allUsers.filter(
    (u) => u._id !== authId && deriveStatus(u._id).status === 'none'
  );

  const acceptedUsers = connections.map((c) => {
    const other = c.sender?._id === authId ? c.recipient : c.sender;
    return { connectionId: c._id, user: other };
  });

  return (
    <MainLayout>
      <div className="grid gap-4 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Invitations */}
          <section className="card">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Invitations {receivedRequests.length > 0 && `(${receivedRequests.length})`}
              </h2>
            </div>
            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-500">Loading invitations…</p>
            ) : (
              <ConnectionRequests
                requests={receivedRequests}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            )}
          </section>

          {/* People You May Know */}
          <section className="card">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-gray-900">People you may know</h2>
            </div>
            {usersLoading || loading ? (
              <p className="px-4 py-6 text-sm text-gray-500">Loading suggestions…</p>
            ) : suggestions.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">No suggestions right now.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                {suggestions.map((u) => (
                  <div
                    key={u._id}
                    className="flex flex-col items-center rounded-lg border border-gray-200 p-4 text-center"
                  >
                    <Link to={`/in/${u._id}`}>
                      <Avatar user={u} />
                    </Link>
                    <Link
                      to={`/in/${u._id}`}
                      className="mt-2 font-semibold text-gray-900 hover:text-brand-500 hover:underline"
                    >
                      {u.name}
                    </Link>
                    {u.headline && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-500">{u.headline}</p>
                    )}
                    <div className="mt-3">
                      <ConnectButton
                        targetUserId={u._id}
                        connectionStatus="none"
                        connectionId={null}
                        handlers={handlers}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Your Connections */}
        <aside className="space-y-4">
          <section className="card">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Your connections {acceptedUsers.length > 0 && `(${acceptedUsers.length})`}
              </h2>
            </div>
            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-500">Loading connections…</p>
            ) : acceptedUsers.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">You have no connections yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {acceptedUsers.map(({ connectionId, user }) => (
                  <li key={connectionId} className="flex items-center gap-3 px-4 py-3">
                    <Link to={`/in/${user?._id}`} className="shrink-0">
                      <Avatar user={user} size="sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/in/${user?._id}`}
                        className="block truncate font-semibold text-gray-900 hover:text-brand-500 hover:underline"
                      >
                        {user?.name}
                      </Link>
                      {user?.headline && (
                        <p className="truncate text-xs text-gray-500">{user.headline}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </MainLayout>
  );
}

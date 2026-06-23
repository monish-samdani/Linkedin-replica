import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';
import { ENDPOINTS } from '../api/endpoints';
import * as connectionsApi from '../api/connections';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useConnections } from '../features/connections/hooks/useConnections';
import ConnectButton from '../features/connections/components/ConnectButton';

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

function MutualCount({ userId }) {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { mutual } = await connectionsApi.getMutual(userId);
        if (active) setCount(mutual?.length || 0);
      } catch {
        if (active) setCount(0);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  if (!count) return null;
  return (
    <p className="mt-1 text-xs text-gray-500">
      {count} mutual connection{count > 1 ? 's' : ''}
    </p>
  );
}

export default function NetworkPage() {
  const { user: authUser } = useAuth();
  const { connections, pendingRequests, loading, refetch } = useConnections();

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

  const connectedIds = new Set(
    connections.map((c) => (c.sender?._id === authId ? c.recipient?._id : c.sender?._id))
  );
  const incomingSenderIds = new Set(pendingRequests.map((r) => r.sender?._id));

  const suggestions = allUsers
    .filter((u) => u._id !== authId && !connectedIds.has(u._id) && !incomingSenderIds.has(u._id))
    .slice(0, 12);

  const acceptedUsers = connections.map((c) => {
    const other = c.sender?._id === authId ? c.recipient : c.sender;
    return { connectionId: c._id, user: other };
  });

  return (
    <MainLayout>
      <div className="grid gap-4 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* Pending requests */}
          <section className="card">
            <div className="border-b border-gray-200 px-4 py-3">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Pending requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
              </h2>
            </div>
            {loading ? (
              <p className="px-4 py-6 text-sm text-gray-500">Loading invitations…</p>
            ) : pendingRequests.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-500">No pending invitations.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pendingRequests.map((req) => (
                  <li key={req._id} className="flex items-center gap-3 px-4 py-3">
                    <Link to={`/in/${req.sender?._id}`} className="shrink-0">
                      <Avatar user={req.sender} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/in/${req.sender?._id}`}
                        className="block truncate font-semibold text-gray-900 hover:text-brand-500 hover:underline"
                      >
                        {req.sender?.name}
                      </Link>
                      {req.sender?.headline && (
                        <p className="truncate text-xs text-gray-500">{req.sender.headline}</p>
                      )}
                      <MutualCount userId={req.sender?._id} />
                    </div>
                    <div className="shrink-0">
                      <ConnectButton
                        userId={req.sender?._id}
                        initialStatus="pending_received"
                        connectionId={req._id}
                        onChange={refetch}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* People you may know */}
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
                    <MutualCount userId={u._id} />
                    <div className="mt-3">
                      <ConnectButton userId={u._id} initialStatus="none" connectionId={null} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Your connections */}
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

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import * as messagesApi from '../../api/messages';

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

function Avatar({ user }) {
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt="" className="avatar h-12 w-12" />;
  }
  return (
    <div className="avatar flex h-12 w-12 items-center justify-center bg-brand-500 text-sm font-bold text-white">
      {getInitials(user?.name)}
    </div>
  );
}

export default function BlockedUsersPage() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState(null);

  const fetchBlocked = useCallback(async () => {
    try {
      const { blockedUsers } = await messagesApi.getBlockedUsers();
      setBlocked(blockedUsers || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const handleUnblock = async (userId) => {
    setUnblockingId(userId);
    try {
      await messagesApi.unblockUser(userId);
      setBlocked((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User unblocked');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unblock user');
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-6">
        <section className="card">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h1 className="font-display text-lg font-semibold text-gray-900">Blocked users</h1>
            <Link to="/messages" className="text-sm font-semibold text-brand-500 hover:underline">
              Back to Messages
            </Link>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Loading…</p>
          ) : blocked.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500">You haven&apos;t blocked anyone.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {blocked.map((u) => (
                <li key={u._id} className="flex items-center gap-3 px-4 py-3">
                  <Avatar user={u} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
                    {u.headline && <p className="truncate text-xs text-gray-500">{u.headline}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnblock(u._id)}
                    disabled={unblockingId === u._id}
                    className="btn-secondary shrink-0 text-sm disabled:opacity-60"
                  >
                    {unblockingId === u._id ? 'Unblocking…' : 'Unblock'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

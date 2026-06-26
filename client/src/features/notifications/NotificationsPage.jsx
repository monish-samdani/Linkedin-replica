import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import * as notificationsApi from '../../api/notifications';

function getInitials(name) {
  return name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function Avatar({ user }) {
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt="" className="avatar h-12 w-12" />;
  }
  return (
    <div className="avatar flex h-12 w-12 items-center justify-center bg-brand-500 text-sm font-bold text-white">
      {getInitials(user?.name) || '?'}
    </div>
  );
}

function getMessage(notification) {
  const name = notification.sender?.name || 'Someone';
  if (notification.type === 'connection_request') return `${name} sent you a connection request`;
  if (notification.type === 'connection_accepted') return `${name} accepted your connection request`;
  if (notification.type === 'job_application') return `${name} applied to your job posting`;
  if (notification.type === 'application_status') return `${name} updated your job application status`;
  return name;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { notifications: list } = await notificationsApi.getNotifications();
      setNotifications(list || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAll = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationsApi.markOneRead(notification._id);
      } catch {
        // Navigation should still proceed even if marking fails.
      }
    }
    // Job notifications deep-link to the job; everything else opens the sender's profile.
    if (notification.jobId) navigate(`/jobs/${notification.jobId}`);
    else if (notification.sender?._id) navigate(`/in/${notification.sender._id}`);
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl py-6">
        <section className="card">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h1 className="font-display text-lg font-semibold text-gray-900">Notifications</h1>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-sm font-semibold text-brand-500 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-gray-500">Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-500">You have no notifications yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <li key={n._id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-100 ${
                      n.read ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <Avatar user={n.sender} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">{getMessage(n)}</p>
                    </div>
                    {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
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

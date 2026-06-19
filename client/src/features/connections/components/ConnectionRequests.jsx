import { Link } from 'react-router-dom';

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

export default function ConnectionRequests({ requests, onAccept, onReject }) {
  if (!requests.length) {
    return <p className="px-4 py-6 text-sm text-gray-500">No pending invitations.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {requests.map((req) => (
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
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => onAccept(req._id)} className="btn-primary text-sm">
              Accept
            </button>
            <button type="button" onClick={() => onReject(req._id)} className="btn-secondary text-sm">
              Ignore
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

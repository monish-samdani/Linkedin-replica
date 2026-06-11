import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ProfileCard() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="card overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-brand-500 to-brand-600" />
      <div className="px-4 pb-4">
        <div className="-mt-8">
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt="" className="avatar h-16 w-16 border-2 border-white" />
          ) : (
            <div className="avatar flex h-16 w-16 items-center justify-center border-2 border-white bg-brand-500 text-lg font-bold text-white">
              {initials}
            </div>
          )}
        </div>
        <Link to="/in/me" className="mt-2 block font-semibold text-gray-900 hover:text-brand-500 hover:underline">
          {user.name}
        </Link>
        {user.headline && <p className="mt-1 text-xs text-gray-600 line-clamp-2">{user.headline}</p>}
        <p className="mt-2 text-xs text-gray-500">
          {user.connections?.length || 0} connections
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import * as messagesApi from '../../../api/messages';

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

export default function NewMessageModal({ onClose, onCreated }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState(null);

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

  const handleStart = async (userId) => {
    setStartingId(userId);
    try {
      const { conversation } = await messagesApi.startConversation(userId);
      onCreated(conversation);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not start conversation');
      setStartingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="card w-full max-w-md p-6" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">New message</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="input mt-4"
        />

        <div className="mt-3 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="px-1 py-4 text-sm text-gray-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-1 py-4 text-sm text-gray-500">
              {query.trim() ? 'No users found.' : 'Start typing to find people.'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {results.map((u) => {
                const connected = u.connectionStatus === 'connected';
                return (
                  <li key={u._id}>
                    <button
                      type="button"
                      onClick={() => handleStart(u._id)}
                      disabled={startingId === u._id}
                      className="flex w-full items-center gap-3 px-1 py-2 text-left transition hover:bg-gray-50 disabled:opacity-60"
                    >
                      {u.profilePhoto ? (
                        <img src={u.profilePhoto} alt="" className="avatar h-10 w-10" />
                      ) : (
                        <div className="avatar flex h-10 w-10 items-center justify-center bg-brand-500 text-xs font-bold text-white">
                          {getInitials(u.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{u.name}</p>
                        {u.headline && <p className="truncate text-xs text-gray-500">{u.headline}</p>}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {connected ? 'Connected' : 'Not connected'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

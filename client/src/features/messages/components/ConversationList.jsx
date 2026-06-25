import { useMemo, useState } from 'react';
import { formatRelativeTime, resolvePresence } from '../utils';

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

function Avatar({ user, online }) {
  return (
    <div className="relative shrink-0">
      {user?.profilePhoto ? (
        <img src={user.profilePhoto} alt="" className="avatar h-12 w-12" />
      ) : (
        <div className="avatar flex h-12 w-12 items-center justify-center bg-brand-500 text-sm font-bold text-white">
          {getInitials(user?.name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}

function truncate(text, max = 40) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function ConversationRow({ conversation, isActive, onSelect, onlineUserIds, lastSeenById }) {
  const other = conversation.otherParticipant || {};
  const unread = conversation.unreadCount || 0;
  const hasUnread = unread > 0;
  const preview = conversation.lastMessage?.content;
  const { online } = resolvePresence(other, onlineUserIds, lastSeenById);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation._id)}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-100 ${
        isActive ? 'bg-blue-50' : ''
      }`}
    >
      <Avatar user={other} online={online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-sm ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
            {other.name || 'Unknown'}
          </p>
          <span className="shrink-0 text-xs text-gray-400">
            {formatRelativeTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>
        {other.headline && <p className="truncate text-xs text-gray-500">{other.headline}</p>}
        <p className={`truncate text-xs ${hasUnread ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
          {preview ? truncate(preview) : 'No messages yet'}
        </p>
      </div>
      {hasUnread && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold leading-none text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  );
}

export default function ConversationList({
  conversations,
  archived,
  activeId,
  onSelect,
  onCompose,
  loading,
  archivedLoading,
  onLoadArchived,
  onlineUserIds,
  lastSeenById,
}) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const handleTab = (next) => {
    setTab(next);
    if (next === 'archived') onLoadArchived?.();
  };

  const source = tab === 'all' ? conversations : archived;
  const isLoading = tab === 'all' ? loading : archivedLoading;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return source;
    return source.filter((c) => c.otherParticipant?.name?.toLowerCase().includes(term));
  }, [source, search]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="font-display text-lg font-semibold text-gray-900">Messages</h1>
        <button
          type="button"
          onClick={onCompose}
          title="New message"
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-brand-500"
        >
          ✏️
        </button>
      </div>

      <div className="border-b border-gray-200 px-4 py-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages"
          className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <div className="mt-2 flex gap-2">
          {['all', 'archived'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTab(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                tab === key ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {key === 'all' ? 'All' : 'Archived'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="px-4 py-6 text-sm text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            {tab === 'all' ? 'No conversations yet.' : 'No archived conversations.'}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <li key={c._id}>
                <ConversationRow
                  conversation={c}
                  isActive={c._id === activeId}
                  onSelect={onSelect}
                  onlineUserIds={onlineUserIds}
                  lastSeenById={lastSeenById}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

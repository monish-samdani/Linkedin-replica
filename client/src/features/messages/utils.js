// Compact relative time for conversation list rows: "now", "5m", "3h", "Mon", "12 Jun".
export function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: 'short' });

  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

// Date-group label for chat message separators: "Today" / "Yesterday" / "12 Jun 2025".
export function formatDateGroup(value) {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

// Exact time shown on hover / under bubbles: "9:42 AM".
export function formatTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// "Active now" / "Active 5m ago" / "Active 2h ago" status line from a lastSeen timestamp.
export function formatLastSeen(value) {
  if (!value) return 'Active recently';
  const diffMin = Math.floor((Date.now() - new Date(value)) / 60000);
  if (diffMin < 1) return 'Active now';
  if (diffMin < 60) return `Active ${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Active ${diffHr}h ago`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `Active ${diffDays}d ago`;

  return `Active ${new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}`;
}

// Resolves a participant's presence by layering realtime socket state over the DB snapshot:
// a live "online" set wins; otherwise a recorded "offline" timestamp wins; else fall back to isOnline.
export function resolvePresence(participant, onlineUserIds, lastSeenById = {}) {
  const id = String(participant?._id || '');
  const overriddenLastSeen = lastSeenById[id];
  let online;
  if (onlineUserIds?.has?.(id)) online = true;
  else if (overriddenLastSeen) online = false;
  else online = Boolean(participant?.isOnline);

  return { online, lastSeen: overriddenLastSeen || participant?.lastSeen || null };
}

// Groups an ordered (oldest→newest) message array into [{ label, messages }] by calendar day.
export function groupMessagesByDate(messages) {
  const groups = [];
  let current = null;

  messages.forEach((message) => {
    const label = formatDateGroup(message.createdAt);
    if (!current || current.label !== label) {
      current = { label, messages: [message] };
      groups.push(current);
    } else {
      current.messages.push(message);
    }
  });

  return groups;
}

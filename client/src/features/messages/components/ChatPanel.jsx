import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import * as messagesApi from '../../../api/messages';
import * as connectionsApi from '../../../api/connections';
import { useChat } from '../hooks/useChat';
import { formatLastSeen, formatTime, groupMessagesByDate, resolvePresence } from '../utils';

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

function Avatar({ user, size = 'h-10 w-10', online = false }) {
  return (
    <div className="relative shrink-0">
      {user?.profilePhoto ? (
        <img src={user.profilePhoto} alt="" className={`avatar ${size}`} />
      ) : (
        <div className={`avatar flex ${size} items-center justify-center bg-brand-500 text-xs font-bold text-white`}>
          {getInitials(user?.name)}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  );
}

const dismissKey = (id) => `unlinked:msg-banner-dismissed:${id}`;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function StatusTicks({ status }) {
  if (status === 'sent') {
    return <span className="text-white/70" title="Sent">✓</span>;
  }
  const isRead = status === 'read';
  return (
    <span className={isRead ? 'text-sky-300' : 'text-white/70'} title={isRead ? 'Read' : 'Delivered'}>
      ✓✓
    </span>
  );
}

export default function ChatPanel({ conversationId, onBack, onConversationChanged, onlineUserIds, lastSeenById }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { messages, conversation, loading, sending, isOtherUserTyping, send, notifyTyping, reload } =
    useChat(conversationId);

  const [input, setInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const bottomRef = useRef(null);
  const menuRef = useRef(null);

  const other = conversation?.otherParticipant || null;
  const otherId = other?._id;
  const { online: otherOnline, lastSeen: otherLastSeen } = resolvePresence(other, onlineUserIds, lastSeenById);

  useEffect(() => {
    setBannerDismissed(sessionStorage.getItem(dismissKey(conversationId)) === '1');
    setInput('');
    setMenuOpen(false);
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const grouped = useMemo(() => groupMessagesByDate(messages), [messages]);

  const isBlocked = conversation?.isBlocked;
  const iAmBlocker = isBlocked && String(conversation?.blockedBy) === String(currentUser?._id);
  const showStrangerBanner =
    conversation?.isStrangerConversation &&
    !conversation?.connectionRequestSent &&
    !isBlocked &&
    !bannerDismissed;

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    try {
      await send(text);
      onConversationChanged?.();
    } catch {
      setInput(text); // restore on failure so the user doesn't lose their message
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConnect = async () => {
    if (!otherId) return;
    setConnecting(true);
    try {
      await connectionsApi.sendRequest(otherId);
      await messagesApi.markConnectionRequestSent(conversationId);
      toast.success('Connection request sent');
      reload({ silent: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setConnecting(false);
    }
  };

  const handleDismissBanner = () => {
    sessionStorage.setItem(dismissKey(conversationId), '1');
    setBannerDismissed(true);
  };

  const runAction = async (fn, successMsg, { goBack = false } = {}) => {
    setMenuOpen(false);
    try {
      await fn();
      toast.success(successMsg);
      onConversationChanged?.();
      if (goBack) onBack?.();
      else reload({ silent: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  if (loading && !conversation) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading…</div>;
  }

  if (!conversation) {
    return <div className="flex h-full items-center justify-center text-sm text-gray-500">Conversation not found.</div>;
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <button type="button" onClick={onBack} className="text-gray-500 hover:text-gray-800 md:hidden">
          ←
        </button>
        <button type="button" onClick={() => otherId && navigate(`/in/${otherId}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <Avatar user={other} online={otherOnline} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-gray-900">{other?.name || 'Unknown'}</p>
            {isOtherUserTyping ? (
              <p className="truncate text-xs font-medium text-brand-500">typing…</p>
            ) : otherOnline ? (
              <p className="truncate text-xs text-green-600">Active now</p>
            ) : (
              <p className="truncate text-xs text-gray-500">{formatLastSeen(otherLastSeen)}</p>
            )}
          </div>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full px-2 py-1 text-lg text-gray-500 hover:bg-gray-100"
          >
            ⋯
          </button>
          {menuOpen && (
            <div role="menu" className="card absolute right-0 top-full z-10 mt-2 w-44 overflow-hidden py-1 text-sm">
              <button
                type="button"
                onClick={() => runAction(() => messagesApi.toggleArchive(conversationId), 'Conversation archived', { goBack: true })}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={() => runAction(() => messagesApi.deleteConversation(conversationId), 'Conversation deleted', { goBack: true })}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              >
                Delete conversation
              </button>
              {otherId && (
                <button
                  type="button"
                  onClick={() => navigate(`/in/${otherId}`)}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  View profile
                </button>
              )}
              {!iAmBlocker && (
                <button
                  type="button"
                  onClick={() => runAction(() => messagesApi.blockUser(otherId), 'User blocked')}
                  className="block w-full px-4 py-2 text-left font-medium text-red-600 hover:bg-gray-100"
                >
                  Block
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stranger banner */}
      {showStrangerBanner && (
        <div className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <span className="min-w-0 truncate">
            <strong>{other?.name}</strong> is not in your network. Connect?
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              {connecting ? 'Sending…' : 'Connect'}
            </button>
            <button
              type="button"
              onClick={handleDismissBanner}
              className="rounded-full px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">Say hello 👋</div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="flex justify-center">
                <span className="rounded-full bg-gray-200 px-3 py-0.5 text-xs text-gray-600">{group.label}</span>
              </div>
              {group.messages.map((message) => {
                const isMine = String(message.sender) === String(currentUser?._id);
                return (
                  <div key={message._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      title={formatTime(message.createdAt)}
                      className={`group max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        isMine ? 'bg-brand-500 text-white' : 'bg-[#F3F2EF] text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <span className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${isMine ? 'text-white/80' : 'text-gray-500'}`}>
                        <span className="opacity-0 transition group-hover:opacity-100">{formatTime(message.createdAt)}</span>
                        {isMine && <StatusTicks status={message.status} />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        {isOtherUserTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TypingDots />
            <span>{other?.name?.split(' ')[0] || 'They'} is typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer: blocked states or input */}
      {isBlocked ? (
        <div className="border-t border-gray-200 bg-gray-100 px-4 py-4 text-center text-sm text-gray-600">
          {iAmBlocker ? (
            <div className="flex flex-col items-center gap-2">
              <span>You blocked {other?.name}.</span>
              <button
                type="button"
                onClick={() => runAction(() => messagesApi.unblockUser(otherId), 'User unblocked')}
                className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Unblock
              </button>
            </div>
          ) : (
            <span>You can&apos;t reply to this conversation.</span>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                notifyTyping();
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              maxLength={2000}
              placeholder="Write a message…"
              className="max-h-32 flex-1 resize-none rounded-2xl bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="btn-primary shrink-0 text-sm disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
          {input.length > 1800 && (
            <p className="mt-1 text-right text-xs text-gray-400">{input.length}/2000</p>
          )}
        </div>
      )}
    </div>
  );
}

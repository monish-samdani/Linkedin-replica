import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as messagesApi from '../../../api/messages';
import socket from '../../../socket/socket';

const POLL_MS = 30000;

export function useMessages() {
  const [conversations, setConversations] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set());
  const [lastSeenById, setLastSeenById] = useState({});

  const refetch = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await messagesApi.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      if (!silent) toast.error(error.response?.data?.message || 'Failed to load conversations');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const refetchArchived = useCallback(async () => {
    setArchivedLoading(true);
    try {
      const data = await messagesApi.getArchivedConversations();
      setArchived(data.conversations || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load archived conversations');
    } finally {
      setArchivedLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    const interval = setInterval(() => refetch({ silent: true }), POLL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  // Realtime presence + list freshness via socket (additive on top of the 30s poll).
  useEffect(() => {
    const handleOnline = ({ userId }) =>
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.add(String(userId));
        return next;
      });

    const handleOffline = ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(String(userId));
        return next;
      });
      setLastSeenById((prev) => ({ ...prev, [String(userId)]: Date.now() }));
    };

    const handleNewMessage = () => refetch({ silent: true });

    socket.on('user:online', handleOnline);
    socket.on('user:offline', handleOffline);
    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('user:online', handleOnline);
      socket.off('user:offline', handleOffline);
      socket.off('message:new', handleNewMessage);
    };
  }, [refetch]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return {
    conversations,
    archived,
    loading,
    archivedLoading,
    totalUnread,
    onlineUserIds,
    lastSeenById,
    refetch,
    refetchArchived,
  };
}

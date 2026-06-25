import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as messagesApi from '../../../api/messages';
import socket from '../../../socket/socket';

const POLL_MS = 5000;
const TYPING_DEBOUNCE_MS = 2000;
const TYPING_SAFETY_MS = 3000;

export function useChat(conversationId) {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const conversationRef = useRef(conversationId);
  const typingDebounceRef = useRef(null);
  const typingSafetyRef = useRef(null);

  conversationRef.current = conversationId;

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const id = conversationRef.current;
      if (!id) return;
      if (!silent) setLoading(true);
      try {
        const data = await messagesApi.getMessages(id);
        // Guard against an out-of-order response after the user switched chats.
        if (conversationRef.current !== id) return;
        setMessages(data.messages || []);
        setConversation(data.conversation || null);
      } catch (error) {
        if (!silent) toast.error(error.response?.data?.message || 'Failed to load messages');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setMessages([]);
    setConversation(null);
    setIsOtherUserTyping(false);
    if (!conversationId) return undefined;

    load();
    const interval = setInterval(() => load({ silent: true }), POLL_MS);
    return () => clearInterval(interval);
  }, [conversationId, load]);

  // Realtime: incoming messages / read-receipts refresh this chat; typing toggles the indicator.
  useEffect(() => {
    if (!conversationId) return undefined;

    const matchesActive = (cid) => String(cid) === String(conversationRef.current);

    const handleNewMessage = (message) => {
      if (matchesActive(message?.conversationId)) load({ silent: true });
    };
    const handleStatus = ({ conversationId: cid }) => {
      if (matchesActive(cid)) load({ silent: true });
    };
    const handleTypingStart = ({ conversationId: cid }) => {
      if (!matchesActive(cid)) return;
      setIsOtherUserTyping(true);
      if (typingSafetyRef.current) clearTimeout(typingSafetyRef.current);
      // Safety fallback in case a 'typing:stop' is dropped.
      typingSafetyRef.current = setTimeout(() => setIsOtherUserTyping(false), TYPING_SAFETY_MS);
    };
    const handleTypingStop = ({ conversationId: cid }) => {
      if (matchesActive(cid)) setIsOtherUserTyping(false);
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:status', handleStatus);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:status', handleStatus);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [conversationId, load]);

  const emitTypingStop = useCallback(() => {
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    if (conversationRef.current) socket.emit('typing:stop', { conversationId: conversationRef.current });
  }, []);

  // Called on every keystroke: announce typing, then debounce a stop after 2s of silence.
  const notifyTyping = useCallback(() => {
    const id = conversationRef.current;
    if (!id) return;
    socket.emit('typing:start', { conversationId: id });
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
    typingDebounceRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: id });
      typingDebounceRef.current = null;
    }, TYPING_DEBOUNCE_MS);
  }, []);

  const send = useCallback(
    async (content) => {
      const trimmed = content.trim();
      if (!trimmed) return;
      emitTypingStop();
      setSending(true);
      try {
        await messagesApi.sendMessage(conversationRef.current, trimmed);
        await load({ silent: true });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send message');
        throw error;
      } finally {
        setSending(false);
      }
    },
    [load, emitTypingStop]
  );

  return {
    messages,
    conversation,
    loading,
    sending,
    isOtherUserTyping,
    send,
    notifyTyping,
    reload: load,
    setConversation,
  };
}

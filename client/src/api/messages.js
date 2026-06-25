import api from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const getConversations = async () => {
  const { data } = await api.get(ENDPOINTS.MESSAGES.CONVERSATIONS);
  return data.data;
};

export const getArchivedConversations = async () => {
  const { data } = await api.get(ENDPOINTS.MESSAGES.ARCHIVED);
  return data.data;
};

export const startConversation = async (recipientId) => {
  const { data } = await api.post(ENDPOINTS.MESSAGES.CONVERSATIONS, { recipientId });
  return data.data;
};

export const getMessages = async (conversationId, { page = 1, limit = 30 } = {}) => {
  const { data } = await api.get(ENDPOINTS.MESSAGES.CONVERSATION(conversationId), {
    params: { page, limit },
  });
  return data.data;
};

export const sendMessage = async (conversationId, content) => {
  const { data } = await api.post(ENDPOINTS.MESSAGES.SEND_MESSAGE(conversationId), { content });
  return data.data;
};

export const markAsRead = async (conversationId) => {
  const { data } = await api.patch(ENDPOINTS.MESSAGES.READ(conversationId));
  return data.data;
};

export const toggleArchive = async (conversationId) => {
  const { data } = await api.patch(ENDPOINTS.MESSAGES.ARCHIVE(conversationId));
  return data.data;
};

export const deleteConversation = async (conversationId) => {
  const { data } = await api.delete(ENDPOINTS.MESSAGES.CONVERSATION(conversationId));
  return data.data;
};

export const markConnectionRequestSent = async (conversationId) => {
  const { data } = await api.patch(ENDPOINTS.MESSAGES.CONNECTION_REQUEST(conversationId));
  return data.data;
};

export const blockUser = async (userId) => {
  const { data } = await api.patch(ENDPOINTS.MESSAGES.BLOCK(userId));
  return data.data;
};

export const unblockUser = async (userId) => {
  const { data } = await api.patch(ENDPOINTS.MESSAGES.UNBLOCK(userId));
  return data.data;
};

export const getBlockedUsers = async () => {
  const { data } = await api.get(ENDPOINTS.MESSAGES.BLOCKED);
  return data.data;
};

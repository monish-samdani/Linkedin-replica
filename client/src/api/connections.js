import api from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const sendRequest = async (recipientId) => {
  const { data } = await api.post(ENDPOINTS.CONNECTIONS.REQUEST(recipientId));
  return data.data;
};

export const acceptRequest = async (requestId) => {
  const { data } = await api.patch(ENDPOINTS.CONNECTIONS.ACCEPT(requestId));
  return data.data;
};

export const rejectRequest = async (requestId) => {
  const { data } = await api.patch(ENDPOINTS.CONNECTIONS.REJECT(requestId));
  return data.data;
};

export const removeConnection = async (connectionId) => {
  const { data } = await api.delete(ENDPOINTS.CONNECTIONS.REMOVE(connectionId));
  return data.data;
};

export const getStatus = async (otherUserId) => {
  const { data } = await api.get(ENDPOINTS.CONNECTIONS.STATUS(otherUserId));
  return data.data;
};

export const getMyConnections = async () => {
  const { data } = await api.get(ENDPOINTS.CONNECTIONS.MY);
  return data.data;
};

export const getPendingRequests = async () => {
  const { data } = await api.get(ENDPOINTS.CONNECTIONS.REQUESTS);
  return data.data;
};

export const getMutual = async (otherUserId) => {
  const { data } = await api.get(ENDPOINTS.CONNECTIONS.MUTUAL(otherUserId));
  return data.data;
};

import api from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const sendRequest = async (userId) => {
  const { data } = await api.post(ENDPOINTS.CONNECTIONS.REQUEST(userId));
  return data.data;
};

export const acceptRequest = async (connectionId) => {
  const { data } = await api.put(ENDPOINTS.CONNECTIONS.ACCEPT(connectionId));
  return data.data;
};

export const rejectRequest = async (connectionId) => {
  const { data } = await api.put(ENDPOINTS.CONNECTIONS.REJECT(connectionId));
  return data.data;
};

export const withdrawRequest = async (connectionId) => {
  const { data } = await api.delete(ENDPOINTS.CONNECTIONS.WITHDRAW(connectionId));
  return data.data;
};

export const getConnections = async () => {
  const { data } = await api.get(ENDPOINTS.CONNECTIONS.BASE);
  return data.data;
};

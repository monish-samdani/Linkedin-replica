import api from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const getNotifications = async () => {
  const { data } = await api.get(ENDPOINTS.NOTIFICATIONS.BASE);
  return data.data;
};

export const markAllRead = async () => {
  const { data } = await api.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL);
  return data.data;
};

export const markOneRead = async (id) => {
  const { data } = await api.patch(ENDPOINTS.NOTIFICATIONS.READ_ONE(id));
  return data.data;
};

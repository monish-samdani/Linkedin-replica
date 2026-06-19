import api from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export const forgotPassword = async (email) => {
  const { data } = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  return data;
};

export const resetPassword = async (token, password) => {
  const { data } = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD(token), { password });
  return data;
};

export const validateResetToken = async (token) => {
  const { data } = await api.get(ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN(token));
  return data.data;
};

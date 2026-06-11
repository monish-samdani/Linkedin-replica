import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';
import { useAuth } from '../../../context/AuthContext';

export function useUpdateProfile() {
  const { updateUser } = useAuth();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.put(ENDPOINTS.AUTH.UPDATE_PROFILE, payload);
      return data.data.user;
    },
    onSuccess: (user) => {
      updateUser(user);
      toast.success('Profile updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}

import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axiosInstance';
import { ENDPOINTS } from '../../../api/endpoints';

export function useProfile(userId) {
  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await api.get(ENDPOINTS.USERS.BY_ID(userId));
      return data.data.user;
    },
    enabled: !!userId && userId !== 'me',
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

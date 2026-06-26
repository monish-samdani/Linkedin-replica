import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as jobsApi from '../../../api/jobs';

export function useMyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const list = await jobsApi.getMyApplications();
      setApplications(list || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { applications, loading, refetch };
}

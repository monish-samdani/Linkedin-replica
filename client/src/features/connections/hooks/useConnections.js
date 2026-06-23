import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as connectionsApi from '../../../api/connections';

export function useConnections() {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const [my, requests] = await Promise.all([
        connectionsApi.getMyConnections(),
        connectionsApi.getPendingRequests(),
      ]);
      setConnections(my.connections || []);
      setPendingRequests(requests.requests || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { connections, pendingRequests, loading, refetch };
}

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as connectionsApi from '../../../api/connections';

export function useConnections() {
  const [connections, setConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    try {
      const { accepted, sent, received } = await connectionsApi.getConnections();
      setConnections(accepted || []);
      setSentRequests(sent || []);
      setReceivedRequests(received || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSend = useCallback(
    async (userId) => {
      try {
        await connectionsApi.sendRequest(userId);
        toast.success('Connection request sent');
        await fetchConnections();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send request');
      }
    },
    [fetchConnections]
  );

  const handleAccept = useCallback(
    async (connectionId) => {
      try {
        await connectionsApi.acceptRequest(connectionId);
        toast.success('Connection accepted');
        await fetchConnections();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to accept request');
      }
    },
    [fetchConnections]
  );

  const handleReject = useCallback(
    async (connectionId) => {
      try {
        await connectionsApi.rejectRequest(connectionId);
        toast.success('Invitation ignored');
        await fetchConnections();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to reject request');
      }
    },
    [fetchConnections]
  );

  const handleWithdraw = useCallback(
    async (connectionId) => {
      try {
        await connectionsApi.withdrawRequest(connectionId);
        toast.success('Request withdrawn');
        await fetchConnections();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to withdraw request');
      }
    },
    [fetchConnections]
  );

  return {
    connections,
    sentRequests,
    receivedRequests,
    loading,
    handleSend,
    handleAccept,
    handleReject,
    handleWithdraw,
  };
}

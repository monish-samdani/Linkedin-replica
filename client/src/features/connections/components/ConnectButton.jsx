import { useState } from 'react';
import toast from 'react-hot-toast';
import * as connectionsApi from '../../../api/connections';

function Spinner() {
  return <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export default function ConnectButton({ userId, initialStatus = 'none', connectionId = null, onChange }) {
  const [status, setStatus] = useState(initialStatus);
  const [connId, setConnId] = useState(connectionId);
  const [loading, setLoading] = useState(false);

  const notifyChange = (nextStatus) => {
    if (onChange) onChange(nextStatus);
  };

  const handleConnect = async () => {
    setLoading(true);
    const previous = status;
    setStatus('pending_sent'); // optimistic
    try {
      const { connection } = await connectionsApi.sendRequest(userId);
      setConnId(connection?._id || null);
      toast.success('Connection request sent');
      notifyChange('pending_sent');
    } catch (error) {
      setStatus(previous);
      toast.error(error.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!connId) return;
    setLoading(true);
    try {
      await connectionsApi.removeConnection(connId);
      setStatus('none');
      setConnId(null);
      toast.success('Request withdrawn');
      notifyChange('none');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to withdraw request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!connId) return;
    setLoading(true);
    try {
      await connectionsApi.acceptRequest(connId);
      setStatus('connected');
      toast.success('Connection accepted');
      notifyChange('connected');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!connId) return;
    setLoading(true);
    try {
      await connectionsApi.rejectRequest(connId);
      setStatus('none');
      setConnId(null);
      toast.success('Invitation ignored');
      notifyChange('none');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!connId) return;
    setLoading(true);
    try {
      await connectionsApi.removeConnection(connId);
      setStatus('none');
      setConnId(null);
      toast.success('Connection removed');
      notifyChange('none');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove connection');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'connected') {
    return (
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading}
        className="btn-secondary text-sm disabled:opacity-60"
        title="Remove connection"
      >
        {loading ? <Spinner /> : 'Connected ✓'}
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={loading}
          className="btn-secondary cursor-pointer text-sm opacity-70 disabled:opacity-50"
          title="Withdraw request"
        >
          {loading ? <Spinner /> : 'Pending'}
        </button>
      </div>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="btn-primary text-sm disabled:opacity-60"
        >
          {loading ? <Spinner /> : 'Accept'}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={loading}
          className="btn-secondary text-sm disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={loading}
      className="btn-primary text-sm disabled:opacity-60"
    >
      {loading ? <Spinner /> : 'Connect +'}
    </button>
  );
}

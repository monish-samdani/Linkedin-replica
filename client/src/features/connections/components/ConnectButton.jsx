export default function ConnectButton({ targetUserId, connectionStatus, connectionId, handlers }) {
  const { handleSend, handleAccept, handleReject, handleWithdraw } = handlers;

  if (connectionStatus === 'connected') {
    return (
      <button type="button" disabled className="btn-ghost cursor-default text-sm text-gray-500">
        Connected
      </button>
    );
  }

  if (connectionStatus === 'pending_sent') {
    return (
      <div className="flex items-center gap-2">
        <button type="button" disabled className="btn-secondary cursor-not-allowed text-sm opacity-60">
          Pending
        </button>
        <button
          type="button"
          onClick={() => handleWithdraw(connectionId)}
          className="text-xs font-semibold text-gray-500 hover:text-brand-500 hover:underline"
        >
          Withdraw
        </button>
      </div>
    );
  }

  if (connectionStatus === 'pending_received') {
    return (
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => handleAccept(connectionId)} className="btn-primary text-sm">
          Accept
        </button>
        <button type="button" onClick={() => handleReject(connectionId)} className="btn-secondary text-sm">
          Ignore
        </button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => handleSend(targetUserId)} className="btn-primary text-sm">
      Connect
    </button>
  );
}

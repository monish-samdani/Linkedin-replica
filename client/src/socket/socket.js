import { io } from 'socket.io-client';

// VITE_SOCKET_URL is the backend ORIGIN (e.g. http://localhost:5000). We can't reuse
// VITE_API_URL here because that includes the "/api/v1" path, which would break the WS handshake.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// AuthContext hands us an async function that fetches a fresh short-lived socket token.
// We keep a reference here so the auth callback below can re-fetch on every reconnection.
let tokenProvider = null;

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  // `auth` as a function is invoked by socket.io-client before EVERY (re)connection attempt.
  // Socket tokens expire after 1 minute, so caching a single token breaks reconnection after
  // long network drops. Fetching fresh here keeps realtime alive across reconnects.
  auth: (cb) => {
    if (!tokenProvider) return cb({ token: null });
    Promise.resolve(tokenProvider())
      .then((token) => cb({ token: token || null }))
      .catch(() => cb({ token: null }));
  },
});

export const connectSocket = (getToken) => {
  if (typeof getToken !== 'function') return;
  tokenProvider = getToken;
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  tokenProvider = null;
  if (socket.connected) socket.disconnect();
};

export default socket;

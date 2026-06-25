import { io } from 'socket.io-client';

// VITE_SOCKET_URL is the backend ORIGIN (e.g. http://localhost:5000). We can't reuse
// VITE_API_URL here because that includes the "/api/v1" path, which would break the WS handshake.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  auth: { token: null },
});

export const connectSocket = (token) => {
  if (!token) return;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

export default socket;

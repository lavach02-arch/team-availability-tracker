import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5001'
        : '/');

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { autoConnect: true });
  }
  return socketInstance;
}

export function useSocketEvent(event, callback) {
  const socket = getSocket();
  useEffect(() => {
    socket.on(event, callback);
    return () => socket.off(event, callback);
  }, [event, callback]);
}

export function useEmit() {
  const socket = getSocket();
  return useCallback((event, data) => socket.emit(event, data), [socket]);
}

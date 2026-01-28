import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Adjust as needed
// Note: Socket.io client usually parses URL automatically if not provided, but explicit is better.
// Vite env vars need valid URL. If API_URL includes /api, we might need to strip it or socket automatically handles base.

let socket;

export const initSocket = (token) => {
    if (socket) return socket;

    // Strip '/api' if present in VITE_API_URL for socket connection base
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');

    socket = io(baseUrl, {
        auth: { token },
        transports: ['websocket'] // Force websocket for performance
    });

    socket.on('connect', () => {
        console.log('✅ Socket Context Connected');
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Socket Connection Error:', err.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

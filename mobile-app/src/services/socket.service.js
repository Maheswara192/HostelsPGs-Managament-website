import io from 'socket.io-client';
import Toast from 'react-native-toast-message';
import { SOCKET_BASE_URL } from './api';

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;
  socket = io(SOCKET_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  
  socket.on('connect', () => console.log('✅ Socket Connected'));
  socket.on('connect_error', (err) => console.error('❌ Socket Error:', err.message));

  // Payment Debit/Credit Listeners
  socket.on('PAYMENT_SUCCESS_DEBIT', (data) => {
    Toast.show({
      type: 'success',
      text1: '💳 Payment Successful',
      text2: data.message,
      visibilityTime: 6000,
    });
  });

  socket.on('PAYMENT_SUCCESS_CREDIT', (data) => {
    Toast.show({
      type: 'success',
      text1: '💰 Payment Received',
      text2: data.message,
      visibilityTime: 6000,
    });
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

import React, { useEffect, useState } from 'react';
import { getSocket } from '../../services/socket.service';

const SocketTest = () => {
    const [status, setStatus] = useState('Disconnected');

    useEffect(() => {
        const socket = getSocket();

        if (!socket) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus('Not Initialized (Login Required)');
            return;
        }

        if (socket.connected) {
            setStatus('Connected 🟢');
        }

        socket.on('connect', () => setStatus('Connected 🟢'));
        socket.on('disconnect', () => setStatus('Disconnected 🔴'));

        return () => {
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-1 rounded-full text-xs opacity-75 hover:opacity-100 z-50">
            Socket: {status}
        </div>
    );
};

export default SocketTest;

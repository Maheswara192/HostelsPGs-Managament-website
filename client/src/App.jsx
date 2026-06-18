import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import SplashScreen from './components/common/SplashScreen';

function AppContent() {
    const { loading } = useAuth();

    if (loading) {
        return <SplashScreen />;
    }

    return (
        <>
            <AppRoutes />
            <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;

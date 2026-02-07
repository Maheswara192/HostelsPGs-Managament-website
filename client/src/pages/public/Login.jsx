import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Building2, User, KeyRound, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [activeTab, setActiveTab] = useState('owner');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                const userRole = result.role;
                switch (userRole) {
                    case 'admin': navigate('/admin'); break;
                    case 'owner': navigate('/owner'); break;
                    case 'tenant': navigate('/tenant'); break;
                    default: navigate('/');
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative sm:mx-auto sm:w-full sm:max-w-md text-center z-10"
            >
                <div className="bg-white p-2 rounded-xl inline-block mb-4 shadow-lg">
                    <img src="/logo.svg" alt="StayManager" className="h-12 w-auto" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign in to your account</h2>
                <p className="mt-2 text-slate-200">Welcome back! Please enter your details.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/20">

                    {/* Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
                        {['owner', 'tenant', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setActiveTab(role)}
                                className={`flex-1 py-2 text-sm font-semibold capitalize rounded-md transition-all ${activeTab === role
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <Input
                            id="email"
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            icon={Mail}
                        />

                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            icon={KeyRound}
                        />

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="font-medium text-primary-600 hover:text-primary-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full justify-center" isLoading={isLoading}>
                            Sign In as {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </Button>
                    </form>

                    {activeTab === 'owner' && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-600">
                                New to StayManager? <span className="font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer" onClick={() => navigate('/register')}>Register your PG</span>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

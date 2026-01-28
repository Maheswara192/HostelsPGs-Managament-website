import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Building2, User, KeyRound } from 'lucide-react';

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
            // Logic from previous implementation
            const result = await login(email, password);

            if (result.success) {
                const userRole = result.role; // Access role directly from response
                if (userRole !== activeTab && activeTab !== 'admin') {
                    // Optional: strict role check matching tab
                }

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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <img src="/logo.png" alt="StayManager Logo" className="mx-auto h-16 w-auto" />
                <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-6">
                        {['owner', 'tenant', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setActiveTab(role)}
                                className={`flex-1 pb-4 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === role
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
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
                        />

                        <Input
                            id="password"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
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
            </div>
        </div>
    );
};

export default Login;

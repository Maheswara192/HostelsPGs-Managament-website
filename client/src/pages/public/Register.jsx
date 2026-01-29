import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Building2, User, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        pgName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { registerOwner } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await registerOwner(formData.name, formData.email, formData.password, formData.pgName);
            if (result.success) {
                navigate('/owner');
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred during registration.');
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
                    <img src="/logo.png" alt="StayManager" className="h-12 w-auto" />
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
                <p className="mt-2 text-slate-200">Start managing your PG like a pro today.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
            >
                <div className="bg-white py-8 px-4 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            icon={User}
                            placeholder="John Doe"
                        />

                        <Input
                            label="PG / Hostel Name"
                            name="pgName"
                            value={formData.pgName}
                            onChange={handleChange}
                            required
                            icon={Building2}
                            placeholder="Sunshine PG"
                        />

                        <Input
                            label="Email address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            icon={Mail}
                            placeholder="you@example.com"
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            icon={Lock}
                            placeholder="••••••••"
                        />

                        <Button type="submit" variant="primary" className="w-full justify-center" isLoading={isLoading}>
                            Register as Owner
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account? <span className="font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

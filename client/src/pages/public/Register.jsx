import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Building2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        pgName: ''
    });
    const [error, setError] = useState('');

    const { registerOwner } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await registerOwner(formData.name, formData.email, formData.password, formData.pgName);
        if (result.success) {
            navigate('/owner');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <Building2 className="mx-auto h-12 w-12 text-primary" />
                <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Register your PG</h2>
                <p className="mt-2 text-sm text-slate-600">Start managing your property in minutes</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="PG / Hostel Name"
                            name="pgName"
                            value={formData.pgName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Button type="submit" className="w-full">
                            Register as Owner
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account? <span className="text-primary hover:underline cursor-pointer" onClick={() => navigate('/login')}>Sign in</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

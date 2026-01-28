import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, Users, CreditCard } from 'lucide-react';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white pt-16 pb-20 md:pt-24 md:pb-32 px-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                            Manage your PG & Hostels <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-blue-400">like a Pro.</span>
                        </h1>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                            The all-in-one platform to streamline tenants, rent collection, and complaints. Built for owners who care about efficiency.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="lg" onClick={() => navigate('/register')}>Start Free Trial</Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/features" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white border border-slate-600 rounded-lg hover:bg-white/10 transition-colors">
                                    Explore Features
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-12 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to run your PG</h2>
                        <p className="text-lg text-slate-600">Powerful tools to automate your daily operations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-primary" />}
                            title="Tenant Management"
                            description="Digital onboarding, document storage, and profile management for all your residents."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-8 h-8 text-green-500" />}
                            title="Automated Rent"
                            description="Payment reminders, online collections, and instant receipts. Never chase payments again."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-blue-500" />}
                            title="Smart Complaints"
                            description="Track and resolve maintenance issues efficiently. Keep your tenants happy and retained."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
        <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-6">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

export default Home;

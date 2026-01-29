import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, CreditCard, Shield, Zap, TrendingUp, Smartphone } from 'lucide-react';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white min-h-[90vh] flex items-center relative">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
                        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px]"
                    />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 w-full pt-16">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 text-center lg:text-left"
                        >
                            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-slate-800 border border-slate-700 text-primary-400 text-sm font-semibold tracking-wide uppercase">
                                New Generation Hostel Management
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
                                Manage your properties <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">
                                    with confidence.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                Streamline tenant onboarding, automate rent collection, and resolve complaints faster. The all-in-one platform for modern PG owners.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 shadow-primary-500/25 shadow-lg" onClick={() => navigate('/register')}>
                                        Get Started Free
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white hover:border-slate-500 backdrop-blur-sm" onClick={() => navigate('/features')}>
                                        View Demo
                                    </Button>
                                </motion.div>
                            </div>

                            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-slate-400 text-sm font-medium">
                                <div className="flex items-center gap-2"><Shield size={18} className="text-emerald-400" /> Secure Data</div>
                                <div className="flex items-center gap-2"><Users size={18} className="text-blue-400" /> Unlimited Tenants</div>
                                <div className="flex items-center gap-2"><Zap size={18} className="text-amber-400" /> Instant Setup</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50, rotate: 5 }}
                            animate={{ opacity: 1, x: 0, rotate: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="lg:w-1/2 hidden lg:block relative"
                        >
                            {/* Abstract Illustration Representation */}
                            <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="ml-auto w-32 h-2 bg-slate-700 rounded-full" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-32 bg-slate-700/30 rounded-lg animate-pulse" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-24 bg-slate-700/30 rounded-lg" />
                                        <div className="h-24 bg-slate-700/30 rounded-lg" />
                                    </div>
                                    <div className="h-12 bg-primary-500/20 rounded-lg w-2/3" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-blue-500/10 rounded-2xl -z-10 translate-x-4 translate-y-4" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything you need to run your PG</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">Powerful tools designed to automate your daily operations and improve tenant satisfaction.</p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        <FeatureCard
                            icon={<Users className="w-6 h-6 text-white" />}
                            color="bg-blue-500"
                            title="Tenant Onboarding"
                            description="Digital onboarding workflows, document storage, and profile management for all your residents."
                        />
                        <FeatureCard
                            icon={<CreditCard className="w-6 h-6 text-white" />}
                            color="bg-emerald-500"
                            title="Automated Rent"
                            description="Automated payment reminders, online collections, and instant digital receipts."
                        />
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-white" />}
                            color="bg-indigo-500"
                            title="Smart Complaints"
                            description="Track and resolve maintenance issues efficiently. Keep your tenants happy."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-6 h-6 text-white" />}
                            color="bg-amber-500"
                            title="Financial Insights"
                            description="Real-time revenue tracking, expense management, and profit analytics."
                        />
                        <FeatureCard
                            icon={<Smartphone className="w-6 h-6 text-white" />}
                            color="bg-purple-500"
                            title="Mobile First"
                            description="Fully responsive dashboard that works perfectly on your phone or tablet."
                        />
                        <FeatureCard
                            icon={<Zap className="w-6 h-6 text-white" />}
                            color="bg-pink-500"
                            title="Instant Alerts"
                            description="Real-time notifications for payments, complaints, and important updates."
                        />
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

// Motion Feature Card
const FeatureCard = ({ icon, color, title, description }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        }}
        whileHover={{ y: -5 }}
        className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md mb-6 rotate-3 hover:rotate-6 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed mb-4">{description}</p>
        <a href="#" className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center">
            Learn more &rarr;
        </a>
    </motion.div>
);

export default Home;

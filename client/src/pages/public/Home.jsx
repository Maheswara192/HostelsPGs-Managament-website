import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, CreditCard, Shield, Zap, TrendingUp, Smartphone, Building2, LayoutDashboard, Home as HomeIcon } from 'lucide-react';
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
        <div className="overflow-hidden font-sans">
            {/* Hero Section */}
            <section className="bg-slate-900 text-white min-h-[95vh] flex flex-col justify-center relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen" />
                </div>

                <div className="max-w-7xl mx-auto px-4 w-full pt-20 pb-16 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:w-[45%] text-center lg:text-left"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 backdrop-blur-sm text-indigo-400 text-xs font-bold tracking-wider uppercase mb-8 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                v1.0 Now Live
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight drop-shadow-2xl">
                                <span className="text-white">Manage Hostels</span> <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-cyan-300 animate-gradient-x brightness-110">
                                    Without Chaos.
                                </span>
                            </h1>

                            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                                The smartest way to manage tenants, collect rent, and handle complaints. Upgrade your property management experience today.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        size="lg"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 text-lg shadow-lg shadow-indigo-500/30 transition-all"
                                        onClick={() => navigate('/register')}
                                    >
                                        Start Free Trial
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 text-lg backdrop-blur-md"
                                        onClick={() => navigate('/features')}
                                    >
                                        See How It Works
                                    </Button>
                                </motion.div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
                                <span>Trusted by modern owners:</span>
                                <div className="flex gap-6 opacity-60 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                                    <div className="flex items-center gap-2"><Building2 size={18} /> <span>UrbanStay</span></div>
                                    <div className="flex items-center gap-2"><HomeIcon size={18} /> <span>CoLive</span></div>
                                    <div className="flex items-center gap-2"><LayoutDashboard size={18} /> <span>PgPro</span></div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 3D Dashboard Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: -15, rotateX: 5 }}
                            animate={{ opacity: 1, scale: 1, rotateY: -12, rotateX: 5 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="lg:w-[55%] hidden lg:block perspective-1000 group"
                            style={{ perspective: '1000px' }}
                        >
                            <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden transform transition-all duration-700 ease-out group-hover:rotate-y-0 group-hover:rotate-x-0 group-hover:scale-[1.02] shadow-black/50" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-12deg) rotateX(5deg)' }}>
                                {/* Browser Bar */}
                                <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                    <div className="ml-4 px-3 py-0.5 bg-slate-900/50 rounded text-[10px] text-slate-500 font-mono w-48 text-center border border-slate-700/50">
                                        app.staymanager.com/dashboard
                                    </div>
                                </div>

                                {/* App Interface */}
                                <div className="flex h-full">
                                    {/* Sidebar */}
                                    <div className="w-16 bg-slate-800/50 border-r border-slate-700/50 flex flex-col items-center py-4 gap-6">
                                        <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20" />
                                        <div className="w-6 h-6 rounded bg-slate-700/50" />
                                        <div className="w-6 h-6 rounded bg-slate-700/50" />
                                        <div className="w-6 h-6 rounded bg-slate-700/50" />
                                        <div className="mt-auto w-6 h-6 rounded-full bg-slate-600" />
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 bg-slate-900 p-6">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <div className="h-4 w-32 bg-slate-700 rounded mb-2" />
                                                <div className="h-2 w-48 bg-slate-800 rounded" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700" />
                                                <div className="h-8 w-24 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20" />
                                            </div>
                                        </div>

                                        {/* Mock Stats */}
                                        <div className="grid grid-cols-3 gap-4 mb-8">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                                    <div className="h-8 w-8 rounded bg-slate-700/30 mb-3" />
                                                    <div className="h-5 w-16 bg-slate-700/50 rounded mb-1" />
                                                    <div className="h-3 w-10 bg-slate-800 rounded" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Mock Chart */}
                                        <div className="h-40 bg-slate-800/30 rounded-lg border border-slate-700/30 flex items-end justify-between px-6 pb-0 pt-8 gap-4 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent pointer-events-none" />
                                            {[40, 70, 50, 90, 60, 80, 50, 75].map((h, i) => (
                                                <div key={i} className="w-full bg-indigo-500/40 rounded-t-sm hover:bg-indigo-500/60 transition-colors" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Glass Reflection Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-50 relative">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-4xl font-heading font-bold text-slate-900 mb-4 tracking-tight">Everything you need to run your PG</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">Powerful tools designed to automate your daily operations and improve tenant satisfaction.</p>
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
        className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg shadow-${color.replace('bg-', '')}/30 mb-6 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <h3 className="text-xl font-heading font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed mb-4">{description}</p>
        <a href="#" className="text-primary-600 font-semibold text-sm hover:underline inline-flex items-center group-hover:translate-x-1 transition-transform">
            Learn more &rarr;
        </a>
    </motion.div>
);

export default Home;

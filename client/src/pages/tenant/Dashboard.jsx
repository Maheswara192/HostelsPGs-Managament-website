import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { CreditCard, AlertCircle, Home, Megaphone, LogOut, History, User } from 'lucide-react';
import tenantService from '../../services/tenant.service';
import StatsCard from '../../components/common/StatsCard';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useSocketListener } from '../../hooks/useSocketListener';
import toast from 'react-hot-toast';

const TenantDashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Exit Request State
    const [showExitModal, setShowExitModal] = useState(false);
    const [exitReason, setExitReason] = useState('');
    const [exitDate, setExitDate] = useState('');
    const [submittingExit, setSubmittingExit] = useState(false);


    const fetchDashboard = async () => {
        try {
            const [dashRes, noticesRes] = await Promise.all([
                tenantService.getDashboard(),
                tenantService.getNotices()
            ]);

            if (dashRes.success) setDashboardData(dashRes.data);
            if (noticesRes.success) setNotices(noticesRes?.data || []);

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    // Real-time Listeners
    useSocketListener('notice:new', (notice) => {
        toast(() => (
            <span>
                <b>New Notice:</b> {notice.title}
            </span>
        ), { icon: '📢', duration: 5000 });
        fetchDashboard();
    });

    useSocketListener('rent:updated', () => {
        toast.success("Rent status updated!");
        fetchDashboard();
    });

    const { room, pg, recentPayments, tenant } = dashboardData || {};

    const handleRequestExit = async (e) => {
        e.preventDefault();
        setSubmittingExit(true);
        try {
            const res = await tenantService.requestExit({ reason: exitReason, date: exitDate });
            if (res.success) {
                setDashboardData(prev => ({ ...prev, tenant: res.data }));
                setShowExitModal(false);
                alert('Exit request submitted successfully');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to submit exit request');
        } finally {
            setSubmittingExit(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];


    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-bold text-slate-900">Welcome, {user?.name}</h1>
                        <p className="text-slate-500 flex items-center gap-2">
                            <Home size={14} />
                            {pg?.name} • {pg?.address}
                        </p>
                    </div>
                </div>

                {tenant?.exit_request?.status === 'PENDING' ? (
                    <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium flex items-center gap-2">
                        <History size={16} /> Exit Request Pending
                    </div>
                ) : tenant?.status === 'on_notice' ? (
                    <div className="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium">
                        On Notice (Ends: {new Date(tenant?.exit_date).toLocaleDateString()})
                    </div>
                ) : (
                    <Button
                        variant="danger"
                        onClick={() => setShowExitModal(true)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    >
                        <LogOut size={18} className="mr-2" />
                        Request Exit
                    </Button>
                )}
            </header>


            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="My Room"
                    value={room?.number || 'Not Assigned'}
                    icon={<Home size={24} />}
                    color="bg-blue-50 text-blue-600"
                    trend={0} // Placeholder layout
                />
                <StatsCard
                    title="Rent Due"
                    value={`₹${dashboardData?.tenant?.rentAmount || 0}`}
                    icon={<CreditCard size={24} />}
                    color="bg-emerald-50 text-emerald-600"
                />

                {/* Notices as a Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Megaphone size={20} />
                        </div>
                        <h3 className="font-semibold text-slate-700">Latest Notice</h3>
                    </div>
                    {notices && notices.length > 0 ? (
                        <div>
                            <p className="font-heading font-medium text-slate-900 truncate" title={notices[0].title}>{notices[0].title}</p>
                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{notices[0].message}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No new notices from management.</p>
                    )}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Payments */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-heading font-semibold text-slate-900">Recent Payments</h3>
                        <Link to="/tenant/payments" className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-slate-400 text-sm">Loading payments...</p>
                        ) : recentPayments?.length > 0 ? (
                            recentPayments.map(pay => (
                                <div key={pay._id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            ₹
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Rent Payment</p>
                                            <p className="text-xs text-slate-500">{new Date(pay.transaction_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-heading font-bold text-slate-700">₹{pay.amount}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="text-sm text-slate-500">No payment history found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Help */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-heading font-bold mb-1">Need Help?</h3>
                                <p className="text-slate-300 text-sm mb-4">Facing issues with your room or amenities?</p>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <AlertCircle size={24} />
                            </div>
                        </div>
                        <Link to="/tenant/complaints">
                            <Button variant="secondary" className="w-full justify-center bg-white text-slate-900 border-none hover:bg-slate-100">
                                Report an Issue
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Manager Contact</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                {pg?.name?.charAt(0) || 'M'}
                            </div>
                            <div>
                                <p className="text-slate-900 font-medium">{pg?.name || 'Property Manager'}</p>
                                <p className="text-slate-500 text-sm">{pg?.contact || 'No contact info'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exit Request Modal */}
            {showExitModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-100">
                        <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">Request Exit</h2>
                        <p className="text-sm text-slate-500 mb-6">We&apos;re sorry to see you go. Please let us know when and why.</p>

                        <form onSubmit={handleRequestExit} className="space-y-4">
                            <Input
                                label="Exit Date"
                                type="date"
                                required
                                min={today}
                                value={exitDate}
                                onChange={(e) => setExitDate(e.target.value)}
                            />
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Leaving</label>
                                <textarea
                                    required
                                    className="input-field min-h-[100px] resize-none"
                                    placeholder="e.g., Relocating, Job Change..."
                                    value={exitReason}
                                    onChange={(e) => setExitReason(e.target.value)}
                                />
                            </div>

                            <div className="flex space-x-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1"
                                    onClick={() => setShowExitModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    isLoading={submittingExit}
                                >
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantDashboard;

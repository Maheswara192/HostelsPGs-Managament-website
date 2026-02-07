import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import messService from '../../services/mess.service';
import Card from '../../components/common/Card';
import { toast } from 'react-hot-toast';
import { Calendar, Save, ChevronLeft, ChevronRight, Loader, Settings } from 'lucide-react';

const MessManagement = () => {
    // Helper to get start of week (Monday)
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
    const [weeklyMenu, setWeeklyMenu] = useState({}); // { 'YYYY-MM-DD': { breakfast: '', ... } }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Configurable Cols State
    const [visibleMeals, setVisibleMeals] = useState({
        breakfast: true,
        lunch: true,
        snacks: true,
        dinner: true
    });
    const [showConfig, setShowConfig] = useState(false);

    // Analytics State
    const [analytics, setAnalytics] = useState([]);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    // Days Array for looping
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const allMeals = ['breakfast', 'lunch', 'snacks', 'dinner'];

    useEffect(() => {
        fetchWeeklyData();
    }, [currentWeekStart]);

    // Fetch analytics for Today initially
    useEffect(() => {
        fetchAnalytics(new Date().toISOString().split('T')[0]);
    }, []);

    const fetchAnalytics = async (date) => {
        try {
            setLoadingAnalytics(true);
            const res = await messService.getAnalytics(date);
            if (res && res.stats) {
                setAnalytics(res.stats);
            }
        } catch (error) {
            console.error("Analytics error", error);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const getWeekRange = () => {
        const start = new Date(currentWeekStart);
        const end = new Date(currentWeekStart);
        end.setDate(end.getDate() + 6);
        return { start, end };
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const fetchWeeklyData = async () => {
        try {
            setLoading(true);
            const { start, end } = getWeekRange();
            const startDate = formatDate(start);
            const endDate = formatDate(end);

            const data = await messService.getMenu({ startDate, endDate });

            // Transform array to object keyed by date
            const menuMap = {};
            // Initialize empty week
            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                const dateKey = formatDate(d);
                menuMap[dateKey] = { breakfast: '', lunch: '', snacks: '', dinner: '' };
            }

            // Fill with fetched data
            if (data && Array.isArray(data)) {
                data.forEach(item => {
                    const itemDate = new Date(item.date).toISOString().split('T')[0];
                    if (menuMap[itemDate]) {
                        menuMap[itemDate] = { ...menuMap[itemDate], ...item.meals };
                    }
                });
            }

            setWeeklyMenu(menuMap);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (date, meal, value) => {
        setWeeklyMenu(prev => ({
            ...prev,
            [date]: {
                ...prev[date],
                [meal]: value
            }
        }));
    };

    const navigateWeek = (direction) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(newStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updates = [];

            const dates = Object.keys(weeklyMenu);

            for (const date of dates) {
                const meals = weeklyMenu[date];
                const cleanMeals = {
                    breakfast: meals.breakfast?.trim() || '',
                    lunch: meals.lunch?.trim() || '',
                    snacks: meals.snacks?.trim() || '',
                    dinner: meals.dinner?.trim() || ''
                };

                updates.push(messService.updateMenu(date, cleanMeals));
            }

            await Promise.all(updates);
            toast.success('Weekly menu saved successfully!');
            fetchWeeklyData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save menu');
        } finally {
            setSaving(false);
        }
    };

    const { start, end } = getWeekRange();
    const activeMeals = allMeals.filter(m => visibleMeals[m]);

    return (
        <div className="space-y-6">
            <PageHeader title="Mess Menu Management" subtitle="Plan and manage weekly food menu" />

            {/* Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
                {/* Week Nav */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigateWeek(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Previous Week"
                    >
                        <ChevronLeft size={24} className="text-slate-600" />
                    </button>

                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <Calendar size={20} className="text-primary-600" />
                        <span>{start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        <span className="text-slate-400">-</span>
                        <span>{end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <button
                        onClick={() => navigateWeek(1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        title="Next Week"
                    >
                        <ChevronRight size={24} className="text-slate-600" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 relative">
                    {/* Column Configuration */}
                    <div className="relative">
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors flex items-center gap-2"
                        >
                            <Settings size={16} />
                            <span>Configure Meals</span>
                        </button>

                        {showConfig && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 shadow-lg rounded-lg p-3 z-50 animate-fade-in">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Visible Columns</h4>
                                {allMeals.map(meal => (
                                    <label key={meal} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={visibleMeals[meal]}
                                            onChange={() => setVisibleMeals({ ...visibleMeals, [meal]: !visibleMeals[meal] })}
                                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                                        />
                                        <span className="text-sm capitalize text-slate-700 font-medium">{meal}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {/* Overlay to close config when clicking outside */}
                        {showConfig && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowConfig(false)}></div>
                        )}
                    </div>

                    <button
                        onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors"
                    >
                        Today
                    </button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2"
                    >
                        {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="h-96 flex items-center justify-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                            <Loader className="animate-spin h-8 w-8 text-primary-500" />
                            <p>Loading weekly menu...</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 w-32 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Day</th>
                                    {activeMeals.map(meal => (
                                        <th key={meal} className="px-6 py-4 text-left text-sm font-bold text-slate-700 capitalize w-1/4">
                                            {meal}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Array.from({ length: 7 }).map((_, i) => {
                                    const d = new Date(currentWeekStart);
                                    d.setDate(d.getDate() + i);
                                    const dateStr = formatDate(d);
                                    const dayName = daysOfWeek[d.getDay() === 0 ? 6 : d.getDay() - 1]; // Fix Sunday index
                                    const isToday = formatDate(new Date()) === dateStr;

                                    return (
                                        <tr key={dateStr} className={`group hover:bg-slate-50 transition-colors ${isToday ? 'bg-primary-50/30' : ''}`}>
                                            <td className={`px-6 py-4 sticky left-0 z-10 ${isToday ? 'bg-primary-50/90' : 'bg-white group-hover:bg-slate-50'} shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors`}>
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold ${isToday ? 'text-primary-700' : 'text-slate-700'}`}>{dayName}</span>
                                                    <span className="text-xs text-slate-400">{d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            {activeMeals.map(meal => (
                                                <td key={`${dateStr}-${meal}`} className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={weeklyMenu[dateStr]?.[meal] || ''}
                                                        onChange={(e) => handleInputChange(dateStr, meal, e.target.value)}
                                                        placeholder="-"
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm bg-transparent"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Consumption Forecast (Restored) */}
            <Card title="Today's Consumption Forecast">
                <div className="space-y-6">
                    {loadingAnalytics ? (
                        <div className="p-4 text-center text-slate-500">Loading forecast...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {analytics.map((stat) => (
                                    <div key={stat.meal} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-semibold text-slate-700 capitalize text-lg">{stat.meal}</h3>
                                            <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                Total: {stat.total}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                                                <span className="text-xs text-slate-500">Cook</span>
                                                <span className="font-bold text-green-600">{stat.eating}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-200">
                                                <span className="text-xs text-slate-500">Skipped</span>
                                                <span className="font-bold text-red-500">{stat.skipped}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {analytics.length === 0 && (
                                <p className="text-slate-500 text-center py-4">No forecast data available for today.</p>
                            )}
                        </>
                    )}
                </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                <div className="min-w-fit mt-0.5">ℹ️</div>
                <p>
                    <strong>Tip:</strong> Use "Configure Meals" to hide columns like Snacks if you don't serve them.
                    Changes to the menu are saved for the week.
                </p>
            </div>
        </div>
    );
};

export default MessManagement;

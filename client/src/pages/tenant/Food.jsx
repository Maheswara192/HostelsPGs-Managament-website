import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import messService from '../../services/mess.service';
import { toast } from 'react-hot-toast';
import { Utensils, XCircle, CheckCircle } from 'lucide-react';

const Food = () => {
    const [menu, setMenu] = useState({ breakfast: '', lunch: '', dinner: '', snacks: '' });
    // Keep track of attendance status for today/tomorrow
    // For MVP, we handle today. A better version would handle dates.
    // Let's assume the user wants to see TODAY's menu and mark today's meals.

    // We actually probably need to fetch "My Attendance" status from the API.
    // But the current API doesn't have "getMyAttendance". 
    // We can infer it or we might need to add it. 
    // For now, let's allow marking "Skip" and rely on the confirmation toaster.
    // Ideally we fetch the current status. The `getAnalytics` is for owner.
    // The implementation plan was slightly missing "Get My Attendance" endpoint details.
    // However, I can still implement the UI to send the POST request. 

    // Future improvement: Add GET /mess/attendance/me to see what I marked.

    const [loading, setLoading] = useState(false);
    const date = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const res = await messService.getMenu(date);
            if (res && res.length > 0) {
                setMenu(res[0].meals);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async (meal) => {
        try {
            await messService.markAttendance(date, meal, 'skipped');
            toast.success(`Marked ${meal} as skipped`);
        } catch (error) {
            toast.error('Failed to update attendance');
        }
    };

    const handleEat = async (meal) => {
        try {
            await messService.markAttendance(date, meal, 'eating');
            toast.success(`Marked ${meal} as eating`);
        } catch (error) {
            toast.error('Failed to update attendance');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Today's Menu" subtitle={new Date().toDateString()} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {['breakfast', 'lunch', 'snacks', 'dinner'].map((meal) => (
                    <Card key={meal} className="hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 capitalize flex items-center gap-2">
                                    <Utensils size={18} className="text-primary" />
                                    {meal}
                                </h3>
                                <p className="mt-2 text-slate-600 text-lg">
                                    {menu[meal] || <span className="text-slate-400 italic">No menu set</span>}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => handleEat(meal)}
                                className="flex-1 py-2 px-4 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <CheckCircle size={18} />
                                I'm Eating
                            </button>
                            <button
                                onClick={() => handleSkip(meal)}
                                className="flex-1 py-2 px-4 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <XCircle size={18} />
                                Skip Meal
                            </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Food;

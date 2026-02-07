const mongoose = require('mongoose');
const MessMenu = require('../models/MessMenu');
const MessAttendance = require('../models/MessAttendance');
const Tenant = require('../models/Tenant');

// Get Menu (Weekly or Specific Date)
exports.getMenu = async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        const pg_id = req.user.pg_id;

        let query = { pg_id };

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        } else if (date) {
            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0);
            query.date = queryDate;
        }

        const menus = await MessMenu.find(query).sort({ date: 1 });
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update/Create Menu
exports.updateMenu = async (req, res) => {
    try {
        const { date, meals } = req.body;
        const pg_id = req.user.pg_id;

        const menuDate = new Date(date);
        menuDate.setHours(0, 0, 0, 0);

        const menu = await MessMenu.findOneAndUpdate(
            { pg_id, date: menuDate },
            { meals },
            { new: true, upsert: true }
        );

        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark Attendance (Skip Meal)
exports.markAttendance = async (req, res) => {
    try {
        const { date, meal_type, status } = req.body;
        const pg_id = req.user.pg_id;

        // If user is tenant, use their ID. If Owner marking for tenant, need tenant_id in body
        let tenant_id = req.user.id;
        if (req.user.role === 'owner' && req.body.tenant_id) {
            tenant_id = req.body.tenant_id;
        } else if (req.user.role === 'owner' && !req.body.tenant_id) {
            return res.status(400).json({ message: 'Tenant ID required for owner action' });
        }

        const attendDate = new Date(date);
        attendDate.setHours(0, 0, 0, 0);

        const attendance = await MessAttendance.findOneAndUpdate(
            { pg_id, tenant_id, date: attendDate, meal_type },
            { status, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Analytics (Who is eating today?)
exports.getMessAnalytics = async (req, res) => {
    try {
        const { date } = req.query;
        const pg_id = req.user.pg_id;

        const queryDate = new Date(date || Date.now());
        queryDate.setHours(0, 0, 0, 0);

        // 1. Get Total Active Tenants
        const totalTenants = await Tenant.countDocuments({ pg_id, status: 'active' });

        // 2. Get Skipped Counts for each meal type
        const skipped = await MessAttendance.aggregate([
            {
                $match: {
                    pg_id: new mongoose.Types.ObjectId(pg_id),
                    date: queryDate,
                    status: 'skipped'
                }
            },
            {
                $group: {
                    _id: '$meal_type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const skippedMap = {};
        skipped.forEach(item => {
            skippedMap[item._id] = item.count;
        });

        const meals = ['breakfast', 'lunch', 'dinner'];
        const analytics = meals.map(meal => ({
            meal,
            total: totalTenants,
            skipped: skippedMap[meal] || 0,
            eating: totalTenants - (skippedMap[meal] || 0)
        }));

        res.json({
            date: queryDate,
            stats: analytics
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const PG = require('../models/PG');
const User = require('../models/User');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');

// @desc    Get Platform Stats (for Super Admin)
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOwners = await User.countDocuments({ role: 'owner' });
        const totalTenants = await User.countDocuments({ role: 'tenant' });
        const totalPGs = await PG.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalOwners,
                totalTenants,
                totalPGs
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get All PGs with Search, Sort & Pagination
// @route   GET /api/admin/pgs
// @access  Private (Admin)
exports.getAllPGs = async (req, res) => {
    try {
        const { search, sort = 'name', order = 'asc', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortOrder = order === 'desc' ? -1 : 1;

        // Build Match Query (Search)
        const matchQuery = {};
        if (search) {
            matchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } },
                { 'owner.name': { $regex: search, $options: 'i' } } // Search by Joined Owner Name
            ];
        }

        // Determine Sort Field
        let sortField = { [sort]: sortOrder };
        if (sort === 'name') sortField = { name: sortOrder }; // Case-insensitive handled by collation if needed, or simple sort
        if (sort === 'owner') sortField = { 'owner.name': sortOrder };

        const pipeline = [
            // 1. Join with Users (Owner)
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner_id',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },

            // 2. Filter (Search)
            { $match: matchQuery },

            // 3. Facet for Data + Count
            {
                $facet: {
                    data: [
                        { $sort: sortField },
                        { $skip: skip },
                        { $limit: limitNum },
                        // Project only needed fields
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                address: 1,
                                city: 1,
                                subscription: 1,
                                "owner.name": 1,
                                "owner.email": 1,
                                "owner.mobile": 1
                            }
                        }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await PG.aggregate(pipeline);

        const data = result[0].data;
        const total = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

        res.status(200).json({
            success: true,
            count: data.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Delete PG
// @route   DELETE /api/admin/pgs/:id
// @access  Private (Admin)
exports.deletePG = async (req, res) => {
    try {
        const pg = await PG.findById(req.params.id);

        if (!pg) {
            return res.status(404).json({ success: false, message: 'PG not found' });
        }

        // Cascading Delete
        // 1. Delete all Tenants
        await Tenant.deleteMany({ pg_id: pg._id });

        // 2. Delete all Rooms
        await Room.deleteMany({ pg_id: pg._id });

        // 3. Delete Owner? (Optional: The Owner User account might remain, but without PG)
        await User.findByIdAndUpdate(pg.owner_id, { $unset: { pg_id: 1 } });

        await pg.deleteOne();

        // Audit Log
        const { logAction } = require('../services/audit.service');
        logAction(req, 'DELETE_PG', 'PG', pg._id, { name: pg.name });

        res.status(200).json({ success: true, message: 'PG deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, role } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (role) query.actor_role = role;

        const logs = await require('../models/AuditLog').find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('actor_id', 'name email')
            .populate('pg_id', 'name');

        const total = await require('../models/AuditLog').countDocuments(query);

        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Trigger Manual Backup
// @route   POST /api/admin/backups
// @access  Private (Admin)
exports.triggerBackup = async (req, res) => {
    try {
        const { createBackup } = require('../services/backup.service');
        const zipPath = await createBackup();

        // Audit Log
        const { logAction } = require('../services/audit.service');
        logAction(req, 'BACKUP_CREATED', 'System', null, { path: zipPath });

        res.json({ success: true, message: 'Backup created successfully', path: zipPath });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Backup failed', error: error.message });
    }
};

// @desc    List Backups
// @route   GET /api/admin/backups
// @access  Private (Admin)
exports.getBackups = async (req, res) => {
    try {
        const { listBackups } = require('../services/backup.service');
        const backups = listBackups();
        res.json({ success: true, data: backups });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Download Backup
// @route   GET /api/admin/backups/:filename
// @access  Private (Admin)
exports.downloadBackup = async (req, res) => {
    try {
        const { BACKUP_DIR } = require('../services/backup.service');
        const filepath = require('path').join(BACKUP_DIR, req.params.filename);

        if (require('fs').existsSync(filepath)) {
            res.download(filepath);
        } else {
            res.status(404).json({ success: false, message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    [SUPPORT] Get User Details by Email (Debug)
// @route   GET /api/admin/support/user
// @access  Private (Admin)
exports.getUserDetails = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'Email required' });

        const user = await User.findOne({ email }).select('+password'); // Show hashed password for debug
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Get related data
        let relatedData = {};
        if (user.role === 'owner') {
            relatedData.pg = await PG.findOne({ owner_id: user._id });
        } else if (user.role === 'tenant') {
            relatedData.tenantProfile = await Tenant.findOne({ user_id: user._id }).populate('pg_id', 'name');
        }

        res.json({
            success: true,
            user,
            relatedData,
            meta: {
                createdAt: user.createdAt,
                lastLogin: user.lastLogin || 'Never'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};


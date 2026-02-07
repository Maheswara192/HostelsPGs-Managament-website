const Visitor = require('../models/Visitor');
const GuestRequest = require('../models/GuestRequest');

// --- Visitor Management ---

// Log New Visitor
exports.logVisitorEntry = async (req, res) => {
    try {
        const { name, phone, purpose, details } = req.body;
        const pg_id = req.user.pg_id;

        const visitor = await Visitor.create({
            pg_id,
            name,
            phone,
            purpose,
            details
        });

        res.status(201).json(visitor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get Active Visitors (Inside premises)
exports.getActiveVisitors = async (req, res) => {
    try {
        const pg_id = req.user.pg_id;
        const visitors = await Visitor.find({ pg_id, status: 'INSIDE' }).sort({ entryTime: -1 });
        res.json(visitors);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark Visitor Exit
exports.markVisitorExit = async (req, res) => {
    try {
        const { id } = req.params;
        const visitor = await Visitor.findByIdAndUpdate(
            id,
            { status: 'EXITED', exitTime: Date.now() },
            { new: true }
        );
        res.json(visitor);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Guest Request Management ---

// Tenant: Create Request
exports.createGuestRequest = async (req, res) => {
    try {
        const { guest_name, relation, fromDate, toDate } = req.body;

        // Ensure user is really a tenant
        // In clean architecture, we should get tenant_id from req.user (if populated) or look it up.
        // Assuming req.user.id is linked to a Tenant record, but here we need the Tenant ID, not User ID.
        // Quick fix: look up tenant by user_id.
        const Tenant = require('../models/Tenant');
        const tenant = await Tenant.findOne({ user_id: req.user.id });

        if (!tenant) {
            return res.status(404).json({ message: 'Tenant profile not found' });
        }

        const request = await GuestRequest.create({
            pg_id: tenant.pg_id,
            tenant_id: tenant._id,
            guest_name,
            relation,
            fromDate,
            toDate
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Owner: Get Pending Requests
exports.getPendingGuestRequests = async (req, res) => {
    try {
        const pg_id = req.user.pg_id;
        const requests = await GuestRequest.find({ pg_id, status: 'PENDING' })
            .populate('tenant_id', 'contact_number') // basic info
            .sort({ createdAt: -1 });

        // We might want to populate User name from Tenant -> User
        // But for now let's keep it simple.
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Owner: Update Request Status
exports.updateGuestRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED

        const request = await GuestRequest.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Tenant: Get My Requests
exports.getMyGuestRequests = async (req, res) => {
    try {
        const Tenant = require('../models/Tenant');
        const tenant = await Tenant.findOne({ user_id: req.user.id });

        if (!tenant) return res.status(404).json([]);

        const requests = await GuestRequest.find({ tenant_id: tenant._id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

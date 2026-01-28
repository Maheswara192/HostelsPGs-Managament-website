const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');
const { enforceIsolation } = require('../middlewares/isolation.middleware');
const { getRooms, createRoom, updateRoom, deleteRoom, getTenants, addTenant, updateTenant, getComplaints, updateComplaintStatus, createNotice, getNotices, deleteNotice, addExpense, getExpenses, deleteExpense, getAnalytics, getDashboardStats, getPayments, cleanupOrphanedAccounts } = require('../controllers/owner.controller');

const router = express.Router();

// All routes are protected and restricted to Owner
router.use(protect);
router.use(authorize('owner'));
router.use(enforceIsolation); // GUARDRAIL: Forces pg_id scope

// Middleware to ensure Owner has a PG
router.use((req, res, next) => {
    if (!req.user.pg_id) {
        return res.status(403).json({ success: false, message: 'No PG assigned to this account. Please contact Admin.' });
    }
    next();
});

// --- SUBSCRIPTION PROTECTED ROUTES ---
// Only allow Dashboard Stats & Complaint Views without active subscription (optional)
// For strict enforcement, protect modification routes

router.route('/rooms')
    .get(checkSubscription, getRooms)
    .post(checkSubscription, createRoom);

router.route('/rooms/:id')
    .put(checkSubscription, updateRoom)
    .delete(checkSubscription, deleteRoom);

const upload = require('../middlewares/upload.middleware');

const tenantUpload = upload.fields([
    { name: 'idProofFront', maxCount: 1 },
    { name: 'idProofBack', maxCount: 1 }
]);

router.route('/tenants')
    .get(checkSubscription, getTenants)
    .post(checkSubscription, tenantUpload, addTenant);

router.route('/tenants/:id')
    .put(checkSubscription, tenantUpload, updateTenant)
    .delete(checkSubscription, require('../controllers/owner.controller').deleteTenant);

// Bulk Upload (Must be before :id routes to avoid conflict)
router.route('/tenants/bulk')
    .post(checkSubscription, upload.single('file'), require('../controllers/owner.controller').bulkAddTenants);

router.route('/tenants/:id/resend-credentials')
    .post(checkSubscription, require('../controllers/owner.controller').resendOwnerTenantCredentials);

router.route('/tenants/exit-request')
    .post(checkSubscription, require('../controllers/owner.controller').manageExitRequest);

// Complaints: Allow viewing, protect status updates? Or protect all?
// Let's protect all "Management" actions
router.route('/complaints')
    .get(getComplaints); // Allow viewing complaints even if expired (to see issues)

router.route('/complaints/:id')
    .put(checkSubscription, updateComplaintStatus);

router.route('/notices')
    .get(getNotices)
    .post(checkSubscription, createNotice);

router.route('/notices/:id')
    .delete(checkSubscription, deleteNotice);

router.route('/expenses')
    .get(checkSubscription, getExpenses)
    .post(checkSubscription, addExpense);

router.route('/expenses/:id')
    .delete(checkSubscription, deleteExpense);

router.route('/analytics')
    .get(checkSubscription, getAnalytics);

router.route('/analytics/export')
    .get(checkSubscription, require('../controllers/owner.controller').exportFinancials);

router.route('/payments')
    .get(checkSubscription, getPayments);

// Dashboard stats allowed (so they can see the dashboard)
router.route('/dashboard-stats')
    .get(getDashboardStats);

// Utility route to clean up orphaned accounts
router.route('/cleanup-orphaned-accounts')
    .post(cleanupOrphanedAccounts);

module.exports = router;

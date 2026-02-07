const express = require('express');
const router = express.Router();
const MessController = require('../controllers/MessController');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Owner: Update Menu, View Analytics
router.post('/menu', protect, authorize('owner'), MessController.updateMenu);
router.get('/analytics', protect, authorize('owner'), MessController.getMessAnalytics);

// Public/Tenant: View Menu
router.get('/menu', protect, MessController.getMenu);

// Tenant: Mark Attendance
router.post('/attendance', protect, MessController.markAttendance);

module.exports = router;

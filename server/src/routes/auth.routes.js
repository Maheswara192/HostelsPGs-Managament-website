const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, changePassword, setupAccount } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/setup-account', setupAccount);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;

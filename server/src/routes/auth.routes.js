const express = require('express');
const { register, login, getMe, forgotPassword, resetPassword, changePassword, setupAccount } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/setup-account', setupAccount);
router.put('/change-password', protect, changePassword);
router.get('/me', protect, getMe);

module.exports = router;

const User = require('../models/User');
const PG = require('../models/PG');
const { sendOTP } = require('../services/email.service');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const OnboardingAnalytics = require('../models/OnboardingAnalytics');
const tokenService = require('../services/token.service');

// @desc    Register a new user (Owner or Tenant)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, pgName } = req.body;

        // SECURITY: Prevent creating admin via public route
        if (role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot register as admin' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'tenant',
            accountStatus: 'ACTIVE' // Self-registered users are Active by default
        });

        // If Owner, create PG
        if (role === 'owner' && pgName) {
            const pg = await PG.create({
                name: pgName,
                owner_id: user._id,
                address: 'Please update address', // Placeholder
                city: 'Unknown'
            });

            // Update User with pg_id (Strict Linking)
            user.pg_id = pg._id;
            await user.save();
        }

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                pg_id: user.pg_id,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Check Account Status
        // Check Account Status
        if (user.role === 'tenant' && user.accountStatus === 'PENDING_ACTIVATION') {
            return res.status(403).json({ success: false, message: 'Account not activated. Please check your email for the setup link.' });
        }
        if (user.accountStatus === 'SUSPENDED' || user.accountStatus === 'DEACTIVATED') {
            return res.status(403).json({ success: false, message: 'Account suspended or deactivated. Contact support.' });
        }

        if (await bcrypt.compare(password, user.password)) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    pg_id: user.pg_id,
                    mustChangePassword: user.mustChangePassword,
                    token: generateToken(user._id),
                },
            });

            // Audit Log
            const { logAction } = require('../services/audit.service');
            logAction({ user, ip: req.ip }, 'USER_LOGIN', 'User', user._id, { role: user.role });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to user (valid for 10 mins)
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log('==================================================');
        console.log(`🔐 PASSWORD RESET REQUEST for: ${email}`);
        console.log(`📧 OTP Generated: ${otp}`);
        console.log(`⏰ Valid until: ${new Date(user.resetPasswordExpires).toLocaleString()}`);
        console.log('==================================================');

        // Try to send OTP via Email
        try {
            const sent = await sendOTP(user.email, otp);

            if (sent) {
                console.log(`✅ OTP email sent successfully to ${email}`);
                return res.json({
                    success: true,
                    message: 'OTP sent to your email. Please check your inbox.'
                });
            }
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            console.log(`⚠️ OTP for ${email}: ${otp} (Check server logs)`);
        }

        // If email fails, still return success but with a note
        // The OTP is logged in console for development/testing
        res.json({
            success: true,
            message: 'OTP generated. Please check server logs or contact administrator.',
            devNote: process.env.NODE_ENV !== 'production' ? `OTP: ${otp}` : undefined
        });

    } catch (error) {
        console.error('❌ Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear OTP
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Setup Account (Magic Link)
// @route   POST /api/auth/setup-account
// @access  Public
exports.setupAccount = async (req, res) => {
    try {
        const { token, password } = req.body;

        // 1. Validate Token (AuthToken Table)
        const userId = await tokenService.validateToken(token, 'ACTIVATION');

        if (!userId) {
            return res.status(400).json({ success: false, message: 'Invalid or expired setup link' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Activate
        user.accountStatus = 'ACTIVE';
        user.mustChangePassword = false;
        // Old fields cleanup (optional)
        user.setupToken = undefined;
        user.setupTokenExpires = undefined;

        await user.save();

        // Log Analytics: Activated
        await OnboardingAnalytics.create({
            pg_id: user.pg_id,
            tenant_id: user._id,
            step: 'ACTIVATED',
            meta: { email: user.email }
        });

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                pg_id: user.pg_id,
                token: generateToken(user._id),
            },
            message: 'Account setup successful'
        });
    } catch (error) {
        console.error("Setup Account Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Change Password (Authenticated)
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If strict mode, verify old password (optional for first-time forced change?)
        // Best practice: Always verify old unless it's an admin override.
        // For "Force Change", the user knows the temp password (they logged in with it).

        if (currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Incorrect current password' });
            }
        } else if (!user.mustChangePassword) {
            // If not a forced change, current password IS required
            return res.status(400).json({ success: false, message: 'Current password is required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear flag
        user.mustChangePassword = false;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

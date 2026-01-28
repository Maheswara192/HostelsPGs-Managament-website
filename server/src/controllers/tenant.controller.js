const Tenant = require('../models/Tenant');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Notice = require('../models/Notice');
const paymentService = require('../services/payment.service');
const crypto = require('crypto');

// Initialize Razorpay (Moved inside function to safe-guard against missing keys)
// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// @desc    Get Tenant Dashboard Data
// @route   GET /api/tenant/dashboard
// @access  Private (Tenant)
exports.getDashboard = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user_id: req.user._id })
            .populate('room_id')
            .populate('pg_id', 'name address contact');

        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant record not found' });
        }

        // Get recent payments
        const payments = await Payment.find({ tenant_id: tenant._id })
            .sort({ transaction_date: -1 })
            .limit(5);

        // Get recent complaints
        const complaints = await Complaint.find({ tenant_id: tenant._id })
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                tenant,
                room: tenant.room_id,
                pg: tenant.pg_id,
                recentPayments: payments,
                recentComplaints: complaints
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Initiate Rent Payment
// @route   POST /api/tenant/pay-rent
// @access  Private (Tenant)
exports.initiateRentPayment = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user_id: req.user._id });
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant record not found' });
        }

        const amount = tenant.rentAmount;
        // Create Mock Receipt
        const receiptId = `receipt_rent_${tenant._id}_${Date.now()}`;

        // Use Service
        const order = await paymentService.createOrder(amount * 100, 'INR', receiptId);

        // Create local payment record
        await Payment.create({
            pg_id: tenant.pg_id,
            user_id: req.user._id,
            tenant_id: tenant._id,
            amount: amount,
            type: 'RENT',
            status: 'CREATED',
            gateway_order_id: order.id
        });

        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            key_id: paymentService.key_id // Send Key ID to frontend for Mock Detection
        });

    } catch (error) {
        console.error('Payment Init Error:', error);
        res.status(500).json({ success: false, message: 'Payment initiation failed' });
    }
};

// @desc    Verify Payment
// @route   POST /api/tenant/verify-payment
// @access  Private (Tenant)
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isValid = paymentService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (isValid) {
            await Payment.findOneAndUpdate(
                { gateway_order_id: razorpay_order_id },
                {
                    status: 'SUCCESS',
                    gateway_payment_id: razorpay_payment_id,
                    gateway_signature: razorpay_signature,
                    transaction_date: Date.now()
                }
            );

            // TODO: Update Tenant rent status if needed (e.g., set month as Paid)

            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            await Payment.findOneAndUpdate(
                { gateway_order_id: razorpay_order_id },
                { status: 'FAILED' }
            );
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};


// @desc    Data for Pay Rent Page (History + Due)
// @route   GET /api/tenant/payments
// @access  Private (Tenant)
exports.getPayments = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user_id: req.user._id });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

        const payments = await Payment.find({ tenant_id: tenant._id }).sort({ transaction_date: -1 });

        res.json({
            success: true,
            data: {
                rentAmount: tenant.rentAmount,
                payments
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Raise a Complaint
// @route   POST /api/tenant/complaints
// @access  Private (Tenant)
exports.raiseComplaint = async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        const tenant = await Tenant.findOne({ user_id: req.user._id });

        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant record not found' });
        }

        const complaint = await Complaint.create({
            pg_id: tenant.pg_id,
            tenant_id: tenant._id,
            title,
            description,
            category: category || 'Other',
            priority: priority || 'Medium'
        });

        res.status(201).json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to raise complaint' });
    }
};

// @desc    Get Complaints History
// @route   GET /api/tenant/complaints
// @access  Private (Tenant)
exports.getComplaints = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user_id: req.user._id });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

        const complaints = await Complaint.find({ tenant_id: tenant._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: complaints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get Notices for Tenant
// @route   GET /api/tenant/notices
// @access  Private (Tenant)
exports.getNotices = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ user_id: req.user._id });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

        const notices = await Notice.find({ pg_id: tenant.pg_id })
            .sort({ createdAt: -1 })
            .limit(10); // Limit to last 10 notices

        res.json({ success: true, data: notices });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
// @desc    Request Exit / Notice Period
// @route   POST /api/tenant/request-exit
// @access  Private (Tenant)
exports.requestExit = async (req, res) => {
    try {
        const { reason, date } = req.body;
        const tenant = await Tenant.findOne({ user_id: req.user._id });

        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        if (tenant.exit_request && tenant.exit_request.status === 'PENDING') {
            return res.status(400).json({ success: false, message: 'Exit request already pending' });
        }

        tenant.exit_request = {
            status: 'PENDING',
            reason,
            requested_date: date,
            request_date: Date.now()
        };

        await tenant.save();

        res.json({ success: true, message: 'Exit request submitted successfully', data: tenant });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

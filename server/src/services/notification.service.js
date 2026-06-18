/**
 * MOCK Notification Service
 * Logs messages to console instead of sending real SMS/WhatsApp
 * Replace with Twilio/Meta API in Production
 */

const sendWhatsApp = async (to, message) => {
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    console.log('\x1b[36m%s\x1b[0m', `[WHATSAPP] Sending to: ${to}`);
    console.log('\x1b[36m%s\x1b[0m', `[MESSAGE] ${message}`);
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    return true; // Simulate success
};

const sendSMS = async (to, message) => {
    console.log('\x1b[33m%s\x1b[0m', '..................................................');
    console.log('\x1b[33m%s\x1b[0m', `[SMS] Sending to: ${to}`);
    console.log('\x1b[33m%s\x1b[0m', `[CONTENT] ${message}`);
    console.log('\x1b[33m%s\x1b[0m', '..................................................');
    return true;
};

/**
 * Send Payment Notifications
 * Notifies both the crediter (owner) and debiteer (tenant) via socket, email, and logged sms/whatsapp.
 * @param {string} paymentId - Payment document ID
 */
const sendPaymentNotifications = async (paymentId) => {
    try {
        const Payment = require('../models/Payment');
        const Tenant = require('../models/Tenant');
        const PG = require('../models/PG');
        const User = require('../models/User');
        const { getIO } = require('./socket.service');
        const emailService = require('./email.service');

        const payment = await Payment.findById(paymentId)
            .populate('user_id')
            .populate('tenant_id')
            .populate('pg_id');

        if (!payment) {
            console.error(`[NOTIFICATION ERROR] Payment ${paymentId} not found`);
            return;
        }

        const amount = payment.amount;
        const txId = payment.gateway_payment_id || payment._id.toString();
        const date = payment.transaction_date || new Date();
        const type = payment.type || 'RENT';
        const pgName = payment.pg_id?.name || 'StayManager PG';

        // 1. Get Debiteer (Tenant User)
        const tenantUser = payment.user_id; // populated User object
        const tenantEmail = tenantUser?.email;
        const tenantName = tenantUser?.name || 'Resident';
        const tenantPhone = payment.tenant_id?.contact_number || tenantUser?.phone;

        // 2. Get Crediter (Owner User)
        let ownerUser = null;
        let ownerEmail = null;
        let ownerName = 'PG Owner';
        let ownerPhone = null;

        if (payment.pg_id && payment.pg_id.owner_id) {
            ownerUser = await User.findById(payment.pg_id.owner_id);
            if (ownerUser) {
                ownerEmail = ownerUser.email;
                ownerName = ownerUser.name || 'PG Owner';
                ownerPhone = ownerUser.phone;
            }
        }

        const paymentDetails = {
            amount,
            id: txId,
            date,
            type,
            pgName,
            tenantName
        };

        // --- Trigger Socket.io Notifications (Real-Time In-App) ---
        try {
            const io = getIO();
            // Emit to Debiteer (Tenant)
            if (tenantUser) {
                io.to(`user_${tenantUser._id.toString()}`).emit('PAYMENT_SUCCESS_DEBIT', {
                    message: `Your payment of ₹${amount} for ${pgName} was successful.`,
                    paymentDetails
                });
            }
            // Emit to Crediter (Owner)
            if (ownerUser) {
                io.to(`user_${ownerUser._id.toString()}`).emit('PAYMENT_SUCCESS_CREDIT', {
                    message: `Received ₹${amount} from tenant ${tenantName} for ${pgName}.`,
                    paymentDetails
                });
            }
        } catch (socketErr) {
            console.warn('[NOTIFICATION WARNING] Socket emit failed (server starting/no clients connected):', socketErr.message);
        }

        // --- Trigger Email Notifications ---
        if (tenantEmail && emailService.sendPaymentSuccessEmail) {
            await emailService.sendPaymentSuccessEmail(tenantEmail, paymentDetails, 'tenant');
        }
        if (ownerEmail && emailService.sendPaymentSuccessEmail) {
            await emailService.sendPaymentSuccessEmail(ownerEmail, paymentDetails, 'owner');
        }

        // --- Trigger SMS/WhatsApp Log Notifications ---
        const tenantMsg = `Success! Your payment of Rs.${amount} for ${pgName} was received. Ref: ${txId}.`;
        const ownerMsg = `Payment Received! Rs.${amount} from ${tenantName} for ${pgName}. Ref: ${txId}.`;

        if (tenantPhone) {
            await sendSMS(tenantPhone, tenantMsg);
            await sendWhatsApp(tenantPhone, tenantMsg);
        }
        if (ownerPhone) {
            await sendSMS(ownerPhone, ownerMsg);
            await sendWhatsApp(ownerPhone, ownerMsg);
        }

        console.info(`[NOTIFICATION SUCCESS] Payment notifications sent for transaction ${txId}`);
    } catch (err) {
        console.error('[NOTIFICATION SYSTEM ERROR] Failed to send payment notifications:', err);
    }
};

module.exports = { sendWhatsApp, sendSMS, sendPaymentNotifications };

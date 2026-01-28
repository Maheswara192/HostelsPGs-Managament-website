const cron = require('node-cron');
const Tenant = require('../models/Tenant');
const { sendWhatsApp } = require('./notification.service');
const { checkPendingActivations } = require('./nudge.service');

const PAYMENT_LINK = 'http://localhost:5173/tenant/payments';

const initRentReminders = () => {
    // Schedule: 9am, 1pm, 5pm, 9pm everyday
    // Cron: "0 9,13,17,21 * * *"
    // For DEMO/TESTING: Run every minute "*/1 * * * *"

    console.log('[SCHEDULER] Rent Reminder Service Started (Running every minute for DEMO)...');

    cron.schedule('*/1 * * * *', async () => {
        try {
            console.log('[JOBS] Checking for pending rent payments...');

            // Find tenants with pending rent
            const pendingTenants = await Tenant.find({ paymentStatus: 'Pending' }).populate('user_id');

            if (pendingTenants.length === 0) {
                console.log('[JOBS] No pending rent found.');
                return;
            }

            for (const tenant of pendingTenants) {
                if (tenant.user_id && tenant.rentAmount > 0) {
                    const message = `Hello ${tenant.user_id.name}, your rent of ₹${tenant.rentAmount} is pending. Please pay immediately to avoid penalties. Click here to pay: ${PAYMENT_LINK}`;

                    // Send WhatsApp
                    // Assuming 'contact' field exists or we use dummy
                    const phone = tenant.contact || '9999999999';
                    await sendWhatsApp(phone, message);
                }
            }

        } catch (error) {
            console.error('[JOBS] Rent Reminder Error:', error);
        }
    });

    // AI Nudge Scheduler (Runs every hour)
    console.log('[SCHEDULER] AI Onboarding Nudge Service Started...');
    cron.schedule('0 * * * *', async () => { // Every hour
        try {
            await checkPendingActivations();
        } catch (error) {
            console.error('[JOBS] Nudge Error:', error);
        }
    });
};

module.exports = { initRentReminders };

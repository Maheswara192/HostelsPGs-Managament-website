const OnboardingCommunication = require('../models/OnboardingCommunication');
const emailService = require('./email.service');
const whatsappService = require('./whatsapp.service');
const OnboardingAnalytics = require('../models/OnboardingAnalytics');

/**
 * Send Onboarding Communication
 * Centralized handler for sending messages and logging to audit trail.
 * @param {object} user - User object
 * @param {object} pg - PG object
 * @param {string} token - Activation Token (Plaintext)
 * @param {string} type - 'WELCOME' | 'REMINDER'
 */
const sendOnboardingCommunication = async (user, pg, token, type = 'WELCOME') => {
    const results = { email: false, whatsapp: false };

    // 1. Send Email
    if (user.email) {
        const emailSent = await emailService.sendAccountSetupEmail(
            user.email,
            user.name,
            token,
            pg.name,
            user.preferredLanguage
        );
        results.email = emailSent;

        // Audit Log
        await OnboardingCommunication.create({
            user_id: user._id,
            pg_id: pg._id,
            channel: 'EMAIL',
            template_key: 'setupEmailBody',
            delivery_status: emailSent ? 'SENT' : 'FAILED'
        });

        // Analytics
        await OnboardingAnalytics.create({
            pg_id: pg._id,
            tenant_id: user._id,
            step: 'EMAIL_SENT',
            meta: { type }
        });
    }

    // 2. Send WhatsApp (if mobile exists)
    // Assuming user has a mobile/contact field (checking User or Tenant profile?)
    // User model doesn't have phone, Tenant model does. 
    // For now we assume User might have phone or we pass it.
    // Let's assume passed in user object or fetched.
    // In this streamlined flow, we might need to fetch Tenant profile or add phone to User.
    // For safety, we skip if no phone.
    if (user.phone) {
        const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/setup-account?token=${token}`;
        const waSent = await whatsappService.sendWhatsApp(
            user.phone,
            'smsBody', // Reuse SMS body for WA for now
            {
                PG_NAME: pg.name,
                SHORT_LINK: link
            },
            user.preferredLanguage
        );
        results.whatsapp = waSent;

        await OnboardingCommunication.create({
            user_id: user._id,
            pg_id: pg._id,
            channel: 'WHATSAPP',
            template_key: 'smsBody',
            delivery_status: waSent ? 'SENT' : 'FAILED'
        });
    }

    return results;
};

module.exports = { sendOnboardingCommunication };

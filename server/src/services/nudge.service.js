const User = require('../models/User');
const PG = require('../models/PG');
const tokenService = require('./token.service');
const communicationService = require('./communication.service');
const OnboardingAnalytics = require('../models/OnboardingAnalytics');

/**
 * Check Pending Activations (AI Nudge Logic)
 * Scans DB for users in PENDING_ACTIVATION state for > 24h (or configured time).
 * Sends reminders.
 */
const checkPendingActivations = async () => {
    console.log('[AI NUDGE] Scanning for pending activations...');

    // Rule: Created > 24 hours ago AND Status is PENDING
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const pendingUsers = await User.find({
        accountStatus: 'PENDING_ACTIVATION',
        createdAt: { $lt: cutoffDate }
        // Optimization: Add field 'lastNudgeSentAt' to avoid spamming
    }).populate('pg_id');

    if (pendingUsers.length === 0) {
        console.log('[AI NUDGE] No pending users found for nudge.');
        return;
    }

    for (const user of pendingUsers) {
        try {
            console.log(`[AI NUDGE] Nudging user: ${user.email}`);

            // 1. Generate NEW Token (Old one likely expired or we want fresh one)
            // Ideally check if old token valid, but simpler to reissue for nudge
            const token = await tokenService.createActivationToken(user);

            // 2. Determine Best Channel (Simple Logic: WhatsApp if available, else Email)
            // "AI" part could be more complex later based on open rates

            // 3. Send Communication
            await communicationService.sendOnboardingCommunication(user, user.pg_id, token, 'REMINDER');

            // 4. Log Nudge
            await OnboardingAnalytics.create({
                pg_id: user.pg_id,
                tenant_id: user._id,
                step: 'EMAIL_SENT', // Reusing step or new NUDGE_SENT
                meta: { type: 'NUDGE_24H' }
            });

        } catch (err) {
            console.error(`[AI NUDGE] Failed to nudge user ${user._id}:`, err);
        }
    }
};

module.exports = { checkPendingActivations };

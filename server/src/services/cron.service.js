const cron = require('node-cron');
const { createBackup } = require('./backup.service');

const initCronJobs = () => {
    // Schedule Backup Daily at Midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('⏰ Running Daily Backup...');
        try {
            const zipPath = await createBackup();
            console.log(`✅ Daily Backup Complete: ${zipPath}`);
        } catch (error) {
            console.error('❌ Daily Backup Failed:', error);
        }
    });

    console.log('📅 Cron Jobs Initialized: Daily Backup scheduled for Midnight.');
};

module.exports = { initCronJobs };

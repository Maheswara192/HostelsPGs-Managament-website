const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://mahisince2002_db_user:admin123321@hostelpgs.4nmxycc.mongodb.net/hostel_saas_db?retryWrites=true&w=majority&appName=HostelPGS',
    JWT_SECRET: process.env.JWT_SECRET || 'temporary_secret_for_audit',
    NODE_ENV: process.env.NODE_ENV || 'development',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN
};

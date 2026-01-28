const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'owner', 'tenant'],
        default: 'tenant'
    },
    mustChangePassword: {
        type: Boolean,
        default: false
    },
    setupToken: {
        type: String,
        index: true
    },
    setupTokenExpires: Date,
    accountStatus: {
        type: String,
        enum: ['PENDING_ACTIVATION', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
        default: 'PENDING_ACTIVATION'
    },
    preferredLanguage: {
        type: String,
        default: 'en'
    },
    // For Owners, this links to their owned PG (optional linkage here, usually PG links to Owner)
    // For Tenants, this links to the PG they reside in
    pg_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PG'
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);

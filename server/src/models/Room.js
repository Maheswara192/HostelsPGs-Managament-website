const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    pg_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PG',
        required: true
    },
    number: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Single', 'Double', 'Triple', 'Dorm'],
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    occupied: {
        type: Number,
        default: 0
    },
    // floor: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

roomSchema.index({ pg_id: 1 });

module.exports = mongoose.model('Room', roomSchema);

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  pg_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PG',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  type: {
    type: String,
    enum: ['RENT', 'SUBSCRIPTION', 'DEPOSIT', 'OTHER'],
    required: true
  },
  payment_mode: {
    type: String,
    enum: ['ONLINE', 'CASH', 'UPI_MANUAL', 'BANK_TRANSFER'],
    default: 'ONLINE'
  },
  status: {
    type: String,
    enum: ['CREATED', 'ATTEMPTED', 'SUCCESS', 'FAILED'],
    default: 'CREATED'
  },
  gateway_order_id: {
    type: String,

    unique: true
  },
  gateway_payment_id: String,
  gateway_signature: String,
  transaction_date: {
    type: Date,
    default: Date.now
  },
  subscription_processed: {
    type: Boolean,
    default: false
  },
  metadata: Object
});

paymentSchema.index({ pg_id: 1 });
paymentSchema.index({ pg_id: 1, status: 1 });
paymentSchema.index({ pg_id: 1, transaction_date: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

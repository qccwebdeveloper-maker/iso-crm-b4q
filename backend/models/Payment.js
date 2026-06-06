const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  transactionId: { type: String, required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
  amount:        { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending','partially_received','received'], default: 'pending' },
  paymentDate:   { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);

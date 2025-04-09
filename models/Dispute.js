const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved', 'rejected'], default: 'open' },
  resolution: String,
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);

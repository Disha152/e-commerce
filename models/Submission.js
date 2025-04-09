const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionText: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);

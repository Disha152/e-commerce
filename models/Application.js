// models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationMessage: { type: String, required: true },
  status: { type: String, default: 'pending' }, // Status can be pending, accepted, rejected, etc.
  createdAt: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;

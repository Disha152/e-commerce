
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  deadline: Date,
  budget: Number,
  skills: [String],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'approved','open', 'assigned', 'completed', 'rejected'],
    default: 'pending' // 🔁 Set initial status to pending
  },
  attachments: [String], // 📎 Store file URLs
  submission: String,
  comments: [commentSchema],
  // In your Task model (e.g., taskModel.js)
applicantsQueue: [{ 
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  coverLetter: String, 
  appliedAt: { type: Date, default: Date.now }
}]

}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

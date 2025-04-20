const mongoose = require('mongoose');

// Comment Schema for storing comments on tasks
const commentSchema = new mongoose.Schema({
  text: String,
  author: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Task Schema with Categories and Subcategories
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
    enum: ['pending', 'approved', 'open', 'assigned', 'completed', 'rejected'],
    default: 'pending' // Initial status set to pending
  },
  attachments: [String], // Store file URLs for attachments
  submission: String,
  comments: [commentSchema],
  applicantsQueue: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    coverLetter: String,
    appliedAt: { type: Date, default: Date.now }
  }],
  // Categories and Subcategories
  category: { 
    type: String, 
    required: true,
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Design', 'Other'] // Example categories
  },
  subcategory: { 
    type: String, 
    required: true,
    enum: ['Frontend', 'Backend', 'Machine Learning', 'UI/UX', 'Other'] // Example subcategories
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

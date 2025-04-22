// const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   taskId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Task",
//     required: true,
//   },
//   author: {
//     id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     name: String,
//     email: String,
//   },
//   text: { type: String, required: true },
//   rating: { type: Number, min: 1, max: 5 }, // New field
//   createdAt: { type: Date, default: Date.now },
// });

// // Task Schema with additional metadata
// const taskSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   deadline: Date,
//   budget: Number,
//   skills: [String],
//   creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   status: {
//     type: String,
//     enum: ['pending', 'approved', 'open', 'assigned', 'completed', 'rejected'],
//     default: 'pending'
//   },
//   attachments: [String], // File URLs
//   submission: String,
//   comments: [commentSchema],
//   applicantsQueue: [{ 
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     coverLetter: String,
//     appliedAt: { type: Date, default: Date.now }
//   }],
//   category: { type: String },
//   subcategory: { type: String },

//   // New fields:
//   experienceLevel: {
//     type: String,
//     enum: ['Beginner', 'Intermediate', 'Expert'],
//     required: false
//   },
//   timeCommitment: {
//     type: String,
//     enum: ['12 hours', '4 days/week', 'Full-time', 'Milestone-based'],
//     required: false
//   },
//   deliverables: {
//     type: String, // Detailed description of expected outputs
//     required: false
//   },
//   communicationExpectations: {
//     type: String, // e.g. Weekly meetings, daily updates, etc.
//     required: false
//   },
//   additionalNotes: {
//     type: String, // Any extra instructions, links, etc.
//     required: false
//   }
//   , averageRating: {
//     type: Number,
//     default: 0,
//   },

// }, { timestamps: true });


// // ✅ Define the method properly
// taskSchema.methods.calculateAverageRating = function () {
//   if (this.comments.length === 0) return 0;

//   const total = this.comments.reduce((acc, comment) => acc + (comment.rating || 0), 0);
//   return total / this.comments.length;
// };

// module.exports = mongoose.model('Task', taskSchema);


const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: String,
    email: String,
  },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// Main Task schema
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [commentSchema], // embedded subdocuments
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

module.exports = mongoose.model("Task", taskSchema);

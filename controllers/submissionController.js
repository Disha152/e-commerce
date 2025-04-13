const Task = require('../models/Task');
const Submission = require('../models/Submission');

// Submit Task
const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Prevent submission if already submitted
    const existingSubmission = await Submission.findOne({
      task: task._id,
      user: req.user._id
    });
    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this task' });
    }

    // Check if the user is submitting their own task
    if (task.creator.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'You cannot submit to your own task' });
    }

    const newSubmission = new Submission({
      task: task._id,
      user: req.user._id,
      submissionText: req.body.submissionText
    });

    await newSubmission.save();
    task.status = 'submitted'; // set it as submitted (not completed yet)
    await task.save();

    res.status(201).json({ message: 'Task submitted successfully', submission: newSubmission });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve or Reject Submission
const updateSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('task');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const task = submission.task;
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check creator
    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this submission' });
    }

    const { status } = req.body; // status: 'approved' or 'rejected'
    const allowedStatuses = ['approved', 'rejected'];

    // Validate status input
    if (!allowedStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (status === 'approved') {
      submission.isApproved = true;
      task.status = 'completed';
    } else if (status === 'rejected') {
      submission.isApproved = false;
      task.status = 'rejected';
    }

    await submission.save();
    await task.save();

    res.json({ message: `Submission ${status} successfully`, submission });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Submissions (Admin only)
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().populate('user task');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Single Submission (Admin)
const getSingleSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ task: req.params.id }).populate('user task');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Submissions for Tasks I Created (Creator dashboard)
const getSubmissionsForMyTasks = async (req, res) => {
  try {
    const taskIds = await Task.find({ creator: req.user._id }).distinct('_id');
    const submissions = await Submission.find({ task: { $in: taskIds } })
      .populate('user', 'name email')
      .populate('task', 'title');

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitTask,
  updateSubmissionStatus,
  getAllSubmissions,
  getSingleSubmission,
  getSubmissionsForMyTasks
};

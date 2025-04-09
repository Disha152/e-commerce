const Task = require('../models/Task');
const Submission = require('../models/Submission');

const submitTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const newSubmission = new Submission({
      task: task._id,
      user: req.user._id,
      submissionText: req.body.submissionText
    });

    await newSubmission.save();
    task.status = 'completed';
    await task.save();

    res.status(201).json({ message: 'Task submitted successfully', submission: newSubmission });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({ task: req.params.id });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Optionally check if the logged-in user is the creator
    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to approve this submission' });
    }

    task.status = 'completed';
    await task.save();

    res.json({ message: 'Submission approved and task marked as completed' });
  } catch (err) {
    console.error('Approval error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllSubmissions = async (req, res) => {
    try {
      const submissions = await Submission.find().populate('user task');
      res.json(submissions);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const getSingleSubmission = async (req, res) => {
    try {
      const submission = await Submission.findOne({ task: req.params.id }).populate('user task');
      if (!submission) return res.status(404).json({ message: 'Submission not found' });
      res.json(submission);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = { submitTask, approveSubmission , getAllSubmissions,
    getSingleSubmission};

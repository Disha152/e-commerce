const Task = require('../models/Task');
const Submission = require('../models/Submission');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /tasks - Create a new task
const createTask = async (req, res) => {
  const { title, description, deadline, budget, skills } = req.body;

  try {
    const task = new Task({
      title,
      description,
      deadline,
      budget,
      skills,
      creator: req.user._id
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// GET /tasks/:id - Get task details
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('creator', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

// GET /tasks - Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('creator', 'name email');
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// PUT /tasks/:id - Update task
const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    
    res.json({ message: 'Task updated', task: updatedTask });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// DELETE /tasks/:id - Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

// GET /tasks/browse - Browse tasks based on user skills
const browseTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({ message: "Please update your skills to browse relevant tasks." });
    }

    const tasks = await Task.find({ status: 'open', skills: { $in: user.skills } });

    res.status(200).json({ tasks });
  } catch (err) {
    console.error('Browse tasks error:', err);
    res.status(500).json({ message: 'Server error while browsing tasks' });
  }
};

// POST /tasks/assign - Assign task to user
const assignTask = async (req, res) => {
  const { taskId, userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: userId, status: 'assigned' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: `📝 New Task Assigned: ${task.title}`,
      text: `Hello ${user.name},\n\nYou have been assigned a new task: "${task.title}".\n\nDeadline: ${task.deadline?.toDateString()}\n\nPlease log in to the platform to check details.\n\nThanks,\nTask Assigner`
    });

    res.json({ message: 'Task assigned and user notified via email', task });
  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({ message: 'Server error while assigning task' });
  }
};

// GET /tasks/my-created - Get tasks created by the user
const getMyCreatedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ creator: req.user._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks created by user:', err);
    res.status(500).json({ message: 'Error fetching created tasks' });
  }
};

// POST /tasks/:taskId/review - Review task submission
const reviewSubmission = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to review this task' });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({ message: 'Task not marked as completed yet' });
    }

    res.json({
      title: task.title,
      assignedTo: task.assignedTo.name,
      status: task.status,
      submission: task.submission,
      submittedAt: task.updatedAt
    });
  } catch (err) {
    console.error('Error reviewing submission:', err);
    res.status(500).json({ message: 'Error reviewing submission' });
  }
};

// POST /tasks/:taskId/apply - Apply for a task
const applyForTask = async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user._id;

  try {
    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.status !== 'open') return res.status(400).json({ message: 'Task is not open for assignment' });
    if (task.assignedTo) return res.status(400).json({ message: 'Task already assigned' });

    task.assignedTo = userId;
    task.status = 'assigned';
    await task.save();

    res.status(200).json({
      message: 'Task successfully assigned to you!',
      task
    });
  } catch (err) {
    console.error('Error applying for task:', err);
    res.status(500).json({ message: 'Server error while applying for task' });
  }
};

// GET /tasks/:taskId/review-applications - Review applications for a task
const reviewApplications = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to review applications for this task' });
    }

    const applications = await Submission.find({ task: taskId })
      .populate('applicant', 'name email skills');

    res.json({ applications });
  } catch (err) {
    console.error('Error reviewing applications:', err);
    res.status(500).json({ message: 'Server error while reviewing applications' });
  }
};

// POST /tasks/:taskId/approve/:userId - Approve user for the task
const approveUserForTask = async (req, res) => {
  const { taskId, userId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to approve user for this task' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is not open for assignment' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    task.assignedTo = userId;
    task.status = 'assigned';
    await task.save();

    await Submission.updateMany({ task: taskId }, { $set: { status: 'rejected' } });
    await Submission.findOneAndUpdate({ task: taskId, applicant: userId }, { $set: { status: 'approved' } });

    // Send email to the approved user
    await sendEmail({
      to: user.email,
      subject: `✅ You have been approved for task: ${task.title}`,
      text: `Hi ${user.name},\n\nYou’ve been approved to work on the task: "${task.title}".\n\nLogin to begin!\n\nThanks,\nTask Team`
    });

    res.json({ message: 'User approved and assigned to task', task });
  } catch (err) {
    console.error('Error approving user:', err);
    res.status(500).json({ message: 'Server error while approving user' });
  }
};

module.exports = { 
  createTask, 
  getTask, 
  getAllTasks, 
  updateTask, 
  deleteTask, 
  browseTasks, 
  assignTask, 
  getMyCreatedTasks, 
  reviewSubmission, 
  applyForTask, 
  reviewApplications, 
  approveUserForTask 
};

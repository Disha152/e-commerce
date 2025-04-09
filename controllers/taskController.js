const Task = require('../models/Task');
const Submission = require('../models/Submission');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /tasks
const createTask = async (req, res) => {
  const { title, description, deadline, budget, skills } = req.body;

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
};

// GET /tasks
const getTasks = async (req, res) => {
  const tasks = await Task.find().populate('creator', 'name');
  res.json(tasks);
};



const getAllTasks = async (req, res) => {
    try {
      const tasks = await Task.find().populate('creator', 'name email');
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const updateTask = async (req, res) => {
    try {
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task updated', task: updatedTask });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  const deleteTask = async (req, res) => {
    try {
      const task = await Task.findByIdAndDelete(req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json({ message: 'Task deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };

  const browseTasks = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      if (!user.skills || user.skills.length === 0) {
        return res.status(400).json({ message: "Please update your skills to browse relevant tasks." });
      }
  
      const tasks = await Task.find({
        status: 'open',
        skills: { $in: user.skills }
      });
  
      res.status(200).json({ tasks });
    } catch (err) {
      console.error("Browse tasks error:", err);
      res.status(500).json({ message: "Server error while browsing tasks." });
    }
  };

  
  
     

      const assignTask = async (req, res) => {
        try {
          const { taskId, userId } = req.body;
      
          const user = await User.findById(userId);
          if (!user) return res.status(404).json({ message: "User not found" });
      
          const task = await Task.findByIdAndUpdate(
            taskId,
            { assignedTo: userId, status: 'assigned' },
            { new: true }
          ).populate('assignedTo', 'name email');
      
          if (!task) return res.status(404).json({ message: "Task not found" });
      
          // Send email
          await sendEmail({
            to: user.email,
            subject: `📝 New Task Assigned: ${task.title}`,
            text: `Hello ${user.name},\n\nYou have been assigned a new task: "${task.title}".\n\nDeadline: ${task.deadline?.toDateString()}\n\nPlease log in to the platform to check details.\n\nThanks,\nTask Assigner`
          });
      
          res.json({ message: "Task assigned and user notified via email", task });
      
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Server error while assigning task" });
        }
      };

      const getMyCreatedTasks = async (req, res) => {
        try {
          const tasks = await Task.find({ creator: req.user._id })
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });
      
          res.json({ tasks });
        } catch (err) {
          res.status(500).json({ message: "Error fetching tasks", error: err.message });
        }
      };


      const reviewSubmission = async (req, res) => {
        try {
          const task = await Task.findById(req.params.taskId)
            .populate('assignedTo', 'name email');
      
          if (!task) return res.status(404).json({ message: "Task not found" });
      
          if (String(task.creator) !== String(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to review this task" });
          }
      
          if (task.status !== 'completed') {
            return res.status(400).json({ message: "Task not marked as completed yet" });
          }
      
          res.json({
            title: task.title,
            assignedTo: task.assignedTo.name,
            status: task.status,
            submission: task.submission,
            submittedAt: task.updatedAt
          });
        } catch (err) {
          res.status(500).json({ message: "Error reviewing submission", error: err.message });
        }
      };
      

      const applyForTask = async (req, res) => {
        try {
          const taskId = req.params.taskId;
          const userId = req.user._id;
      
          const task = await Task.findById(taskId);
      
          if (!task) return res.status(404).json({ message: "Task not found" });
          if (task.status !== 'open') return res.status(400).json({ message: "Task is not open for assignment" });
          if (task.assignedTo) return res.status(400).json({ message: "Task already assigned" });
      
          // Optional check: Match skills
          const executorSkills = req.body.skills || []; // Optional: can be fetched from User model too
          const taskSkills = task.skills;
      
          const matchingSkills = taskSkills.filter(skill => executorSkills.includes(skill));
          if (matchingSkills.length === 0) {
            return res.status(400).json({ message: "Your skills don't match the task requirements" });
          }
      
          // Assign task to executor
          task.assignedTo = userId;
          task.status = 'assigned';
          await task.save();
      
          res.status(200).json({
            message: "Task successfully assigned to you!",
            task
          });
        } catch (error) {
          console.error("Apply Error:", error);
          res.status(500).json({ message: "Server error", error: error.message });
        }
      };




module.exports = { createTask, getTasks ,getAllTasks, updateTask, deleteTask, browseTasks , assignTask , getMyCreatedTasks, reviewSubmission , applyForTask};

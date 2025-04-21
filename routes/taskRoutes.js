const express = require('express');
const router = express.Router();
const { createTask, getTask , browseTasks , applyForTask, reviewApplications,assignUserFromQueue, approveUserForTask ,getTaskSubmissions,approveTask } = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getAllTasks, updateTask, deleteTask, assignTask,getMyCreatedTasks,reviewSubmission } = require('../controllers/taskController');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const { addCommentToTask ,getTaskComments} = require("../controllers/taskController");


router.get('/:id', getTask);

// router.get('/', protect, authorizeRoles('admin'), getAllTasks);
router.get('/', getAllTasks);
router.put('/:id', protect, authorizeRoles('admin'), updateTask);
router.delete('/:id', protect, authorizeRoles('admin'), deleteTask);


// Task Creator can create tasks
router.post('/', protect, authorizeRoles('creator','admin'), createTask);

router.get('/browse', protect, browseTasks);

router.post('/assign-task', protect, authorizeRoles('creator', 'admin'), assignTask);

router.get('/my-created', protect, authorizeRoles('creator'), getMyCreatedTasks);
router.get('/:taskId/review', protect, authorizeRoles('creator'), reviewSubmission);

// router.post('/:taskId/apply', protect, applyForTask);


router.get('/:taskId/applications', protect, reviewApplications);
router.put('/:taskId/approve', protect ,authorizeRoles('admin'), approveTask);

router.post('/:taskId/approve/:userId', protect, approveUserForTask);
router.get('/:taskId/submissions',protect, getTaskSubmissions);
router.post("/:id/comment",protect, addCommentToTask);
router.get("/:id/comments",protect, getTaskComments);

router.put('/:taskId/comments/:commentId', protect, async (req, res) => {
    const { taskId, commentId } = req.params;
    const { text } = req.body;
  
    try {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
  
      const comment = task.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
      // Only author can edit
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      comment.text = text || comment.text;
      await task.save();
  
      // Populate the updated comment's author
      await comment.populate('author', 'name email');
  
      res.status(200).json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a comment
router.delete('/api/tasks/:taskId/comments/:commentId', protect, async (req, res) => {
    const { taskId, commentId } = req.params;
  
    try {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ message: 'Task not found' });
  
      const comment = task.comments.id(commentId);
      if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
      if (comment.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
  
      comment.remove();
      await task.save();
  
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/:taskId/applications', async (req, res) => {
    const { taskId } = req.params;
  
    try {
      const task = await Task.findById(taskId).populate('applicantsQueue.user', 'userName');
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Return applicants queue with user details
      res.json({ applications: task.applicantsQueue });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  


  router.post('/:taskId/assign/:userId', protect, assignUserFromQueue);

 

// POST /tasks/:taskId/apply - Apply for a task
router.post('/:taskId/apply', protect, async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.user._id; // Get user ID from token
  const { coverLetter } = req.body; // Optional cover letter

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has already applied
    const alreadyInQueue = task.applicantsQueue?.some(
      (applicant) => applicant.user.toString() === userId.toString()
    );
    if (alreadyInQueue) {
      return res.status(400).json({ message: 'You have already applied to this task.' });
    }

    // If task is open and unassigned, assign the task to the user
    if (task.status === 'open' && !task.assignedTo) {
      task.assignedTo = userId;
      task.status = 'assigned';
      await task.save();
      return res.status(200).json({
        message: 'Task successfully assigned to you!',
        task,
      });
    }

    // If task is already assigned, add to the applicants queue
    if (!task.applicantsQueue) task.applicantsQueue = [];
    task.applicantsQueue.push({
      user: userId,
      coverLetter,
      appliedAt: new Date(),
    });

    await task.save();
    return res.status(200).json({
      message: 'Task already assigned. You have been added to the applicant queue.',
    });
  } catch (err) {
    console.error('Error applying for task:', err);
    res.status(500).json({ message: 'Server error while applying for task' });
  }
});


router.get('/:taskId/review-applications', protect, async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the logged-in user is the creator of the task
    if (String(task.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to review applications for this task' });
    }

    // Populate the applicants' information (name, email, skills)
    const queue = await Task.findById(taskId)
      .populate('applicantsQueue.user', 'name email skills') // Adjust fields as necessary
      .select('applicantsQueue assignedTo');

    return res.json({
      applicantsQueue: queue.applicantsQueue,
      assignedTo: queue.assignedTo,
    });
  } catch (err) {
    console.error('Error reviewing applications:', err);
    res.status(500).json({ message: 'Server error while reviewing applications' });
  }
});


// GET tasks by category
router.get("/category/:category", async (req, res) => {
  const { category } = req.params;

  try {
    // Find tasks based on category
    const tasks = await Task.find({ category });

    if (tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this category." });
    }

    return res.json(tasks);  // Return the tasks as a response
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching tasks." });
  }
});

// Get tasks by skill
router.get("/skills/:skill", async (req, res) => {
  try {
    const skill = req.params.skill;
    const tasks = await Task.find({ skills: { $regex: new RegExp(skill, "i") } }); // case-insensitive

    if (!tasks.length) {
      return res.status(404).json({ message: `No tasks found for skill: ${skill}` });
    }

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks by skill:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Route to get unique skills, categories, and subcategories
router.get('/aggregations', async (req, res) => {
  try {
    // Aggregate to get unique skills
    const uniqueSkills = await Task.aggregate([
      { $unwind: "$skills" }, // Unwind the skills array
      { $group: { _id: "$skills", count: { $sum: 1 } } }, // Group by skills and count occurrences
      { $sort: { count: -1 } }  // Optional: Sort by most frequent skills
    ]);

    // Aggregate to get unique categories
    const uniqueCategories = await Task.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }, // Group by category and count occurrences
      { $sort: { count: -1 } } // Optional: Sort by most frequent categories
    ]);

    // Aggregate to get unique subcategories
    const uniqueSubcategories = await Task.aggregate([
      { $group: { _id: "$subcategory", count: { $sum: 1 } } }, // Group by subcategory and count occurrences
      { $sort: { count: -1 } } // Optional: Sort by most frequent subcategories
    ]);

    // Send back the aggregated results
    res.json({
      uniqueSkills,
      uniqueCategories,
      uniqueSubcategories
    });
  } catch (err) {
    console.error("Error aggregating data:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});





  




module.exports = router;

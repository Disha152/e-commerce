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

// router.post('/:taskId/apply', protect, authorizeRoles('user'), applyForTask);

router.post('/:taskId/apply', async (req, res) => {
  const { taskId } = req.params;
  const { userId } = req.body;

  try {
    const task = await Task.findById(taskId);
    const user = await User.findById(userId);

    if (!task || !user) {
      return res.status(404).json({ message: 'Task or User not found' });
    }

    // Check if the user has already applied
    if (task.applicantsQueue.some(app => app.user.toString() === userId)) {
      return res.status(400).json({ message: 'You have already applied to this task' });
    }

    // Add user to applicants queue
    task.applicantsQueue.push({ user: userId, appliedAt: Date.now() });
    await task.save();

    res.json({ message: 'Applied successfully to task' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:taskId/applications', protect, reviewApplications);
router.put('/tasks/:taskId/approve', protect ,authorizeRoles('admin'), approveTask);

router.post('/:taskId/approve/:userId', protect, approveUserForTask);
router.get('/tasks/:taskId/submissions',protect, getTaskSubmissions);
router.post("/:id/comment",protect, addCommentToTask);
router.get("/:id/comments",protect, getTaskComments);

router.put('/api/tasks/:taskId/comments/:commentId', protect, async (req, res) => {
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

  



  




module.exports = router;

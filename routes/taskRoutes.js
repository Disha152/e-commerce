const express = require('express');
const router = express.Router();
const { createTask, getTask , browseTasks , applyForTask, reviewApplications, approveUserForTask ,getTaskSubmissions } = require('../controllers/taskController');
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

router.post('/:taskId/apply', protect, authorizeRoles('user'), applyForTask);

router.get('/:taskId/applications', protect, reviewApplications);
router.post('/:taskId/approve/:userId', protect, approveUserForTask);
router.get('/tasks/:taskId/submissions',protect, getTaskSubmissions);
router.post("/:id/comment",protect, addCommentToTask);
router.post("/:id/comments",protect, getTaskComments);






module.exports = router;

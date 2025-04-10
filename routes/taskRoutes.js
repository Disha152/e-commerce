const express = require('express');
const router = express.Router();
const { createTask, getTasks , browseTasks , applyForTask , getTaskById } = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/auth');
const { getAllTasks, updateTask, deleteTask, assignTask,getMyCreatedTasks,reviewSubmission } = require('../controllers/taskController');
const Task = require('../models/Task');


router.get('/:taskId', protect, getTaskById);

router.get('/', protect, authorizeRoles('admin'), getAllTasks);
router.put('/:id', protect, authorizeRoles('admin'), updateTask);
router.delete('/:id', protect, authorizeRoles('admin'), deleteTask);


// Task Creator can create tasks
router.post('/', protect, authorizeRoles('creator'), createTask);

// Any user can view tasks
router.get('/', protect, getTasks);

router.get('/browse', protect, browseTasks);

router.post('/assign-task', protect, authorizeRoles('creator', 'admin'), assignTask);

router.get('/my-created', protect, authorizeRoles('creator'), getMyCreatedTasks);
router.get('/:taskId/review', protect, authorizeRoles('creator'), reviewSubmission);

router.post('/:taskId/apply', protect, authorizeRoles('user'), applyForTask);




module.exports = router;

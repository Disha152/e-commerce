const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const { handleDispute, getAllDisputes ,rejectTask} = require('../controllers/adminController');

router.get('/disputes', protect, authorizeRoles('admin'), getAllDisputes);
router.post('/resolve', protect, authorizeRoles('admin'), handleDispute);

// Admin rejecting a task
router.put('/tasks/:id/reject', protect, authorizeRoles('admin'), rejectTask);


module.exports = router;
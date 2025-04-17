const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers ,updateSkills , deleteUserById, getSavedTasks,unsaveTask,saveTask} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/auth');


router.post('/save/:taskId', protect, saveTask);
router.delete('/unsave/:taskId', protect, unsaveTask);
router.get('/saved', protect, getSavedTasks);
// Authenticated users can access their profile
router.get('/profile', getUserProfile);

// Admin-only access to all users
router.get('/all', protect, authorizeRoles('admin'), getAllUsers);

router.put('/update-profile',protect ,  updateSkills);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUserById);




module.exports = router;

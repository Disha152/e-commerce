const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers ,updateSkills} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Authenticated users can access their profile
router.get('/profile', getUserProfile);

// Admin-only access to all users
router.get('/all', protect, authorizeRoles('admin'), getAllUsers);

router.put('/update-profile', protect, updateSkills);


module.exports = router;

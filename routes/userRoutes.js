const express = require('express');
const router = express.Router();
const { getUserProfile, getAllUsers ,updateSkills , deleteUserById,} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Authenticated users can access their profile
router.get('/profile', getUserProfile);

// Admin-only access to all users
router.get('/all', protect, authorizeRoles('admin'), getAllUsers);

router.put('/update-profile',protect ,  updateSkills);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUserById);

// Get saved tasks for logged-in user
router.get("/saved-tasks", verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate("savedTasks");
      res.json(user.savedTasks);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch saved tasks" });
    }
  });


module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const { handleDispute, getAllDisputes ,rejectTask} = require('../controllers/adminController');

router.get('/disputes', protect, authorizeRoles('admin'), getAllDisputes);
router.post('/resolve', protect, authorizeRoles('admin'), handleDispute);

// Admin rejecting a task
router.put('/tasks/:id/reject', protect, authorizeRoles('admin'), rejectTask);
router.get('/stats', protect, authorizeRoles('admin'), async (req, res) => {
    const users = await User.countDocuments();
    const tasks = await Task.countDocuments();
    const revenue = await Submission.aggregate([
      { $group: { _id: null, total: { $sum: "$paymentAmount" } } }
    ]);
  
    res.json({
      users,
      tasks,
      revenue: revenue[0]?.total || 0
    });
  });
  


module.exports = router;
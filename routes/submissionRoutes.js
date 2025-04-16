const express = require('express');
const router = express.Router();
const {
  submitTask,
  updateSubmissionStatus,
  getAllSubmissions,
  getSingleSubmission,
  getSubmissionsForMyTasks
} = require('../controllers/submissionController');
const Submission = require("../models/Submission");

const { protect, authorizeRoles } = require('../middleware/auth');

// ADMIN ROUTES
router.get('/', getAllSubmissions);
router.get('/:id', protect, authorizeRoles('admin'), getSingleSubmission);

// USER ROUTE: Submit a task
router.post('/:id', protect, authorizeRoles('user'), submitTask);

// CREATOR ROUTE: Approve or Reject Submission
router.put('/:id/approve', protect, authorizeRoles('creator'), updateSubmissionStatus);

// CREATOR ROUTE: Get all submissions for tasks I created
router.get('/creator/my-submissions', protect, authorizeRoles('creator'), getSubmissionsForMyTasks);


// ✅ Route (already correct)
router.get("/my-submissions", protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id }).populate("task");
    return res.status(200).json(submissions);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});



module.exports = router;

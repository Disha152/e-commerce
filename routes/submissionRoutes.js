const express = require('express');
const router = express.Router();
const { submitTask , approveSubmission , getAllSubmissions, getSingleSubmission} = require('../controllers/submissionController');
const { protect, authorizeRoles } = require('../middleware/auth');



router.get('/', protect, authorizeRoles('admin'), getAllSubmissions);
router.get('/:id', protect, authorizeRoles('admin'), getSingleSubmission);
// POST /api/submissions/:id
router.post('/:id', protect, authorizeRoles('user'), submitTask);

// ✅ Route to approve a submission
router.put('/:id/approve', protect, approveSubmission);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const {
  raiseDispute,
  resolveDispute,
  getAllDisputes
} = require('../controllers/disputeController');

// Raise a dispute (user or creator)
router.post('/raise', protect, raiseDispute);

// Admin: Resolve a dispute
router.put('/:id/resolve', protect, authorizeRoles('admin'), resolveDispute);

// Admin: View all disputes
router.get('/', protect, authorizeRoles('admin'), getAllDisputes);

module.exports = router;

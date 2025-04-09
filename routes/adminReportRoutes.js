const express = require('express');
const router = express.Router();
const { generateAdminReport } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/admin/report', protect, authorizeRoles('admin'), generateAdminReport);


module.exports = router;

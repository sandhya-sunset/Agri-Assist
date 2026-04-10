const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getDashboardStats,
  getOrders,
  getCommissionSettings,
  updateCommissionSettings,
  getExpertApplications,
  approveExpertApplication,
  rejectExpertApplication
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Orders management
router.get('/orders', getOrders);

// Commission settings
router.get('/commission', getCommissionSettings);
router.put('/commission', updateCommissionSettings);

// Expert applications management
router.get('/expert-applications', getExpertApplications);
router.put('/expert-applications/:id/approve', approveExpertApplication);
router.put('/expert-applications/:id/reject', rejectExpertApplication);

module.exports = router;

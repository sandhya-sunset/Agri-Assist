const express = require('express');
const router = express.Router();
const { getDashboardStats, getSellerOrders, getAnalytics } = require('../controllers/sellerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// All routes are protected and for sellers/admins only (assuming 'seller' role exists or just protect)
// If logic requires role check: router.use(protect, authorize('seller', 'admin'));
// For now, just protect is used, assuming any logged-in user can be a seller
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/orders', getSellerOrders);
router.get('/analytics', getAnalytics);
router.put('/orders/:id/status', require('../controllers/sellerController').updateOrderStatus);

module.exports = router;

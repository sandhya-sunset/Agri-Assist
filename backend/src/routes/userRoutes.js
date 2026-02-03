const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, deleteUser, getSellers, updateSellerStatus } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// All routes are protected and for admins only
router.use(protect);
router.use(admin);

router.get('/sellers', getSellers);
router.put('/sellers/:id/status', updateSellerStatus);

router.get('/', getAllUsers);
router.put('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;

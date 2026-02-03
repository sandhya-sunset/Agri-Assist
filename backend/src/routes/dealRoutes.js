const express = require('express');
const router = express.Router();
const { getActiveDeals, createDeal } = require('../controllers/dealController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/active', getActiveDeals);
router.post('/', protect, admin, createDeal);

module.exports = router;

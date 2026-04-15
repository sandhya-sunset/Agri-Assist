const express = require('express');
const router = express.Router();
const { getActiveDeals, createDeal, getAllDeals, updateDeal, deleteDeal } = require('../controllers/dealController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/active', getActiveDeals);
router.route('/')
  .get(protect, admin, getAllDeals)
  .post(protect, admin, createDeal);
  
router.route('/:id')
  .put(protect, admin, updateDeal)
  .delete(protect, admin, deleteDeal);

module.exports = router;

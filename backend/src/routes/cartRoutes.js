const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem
} = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect); // All cart routes are protected

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:productId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;

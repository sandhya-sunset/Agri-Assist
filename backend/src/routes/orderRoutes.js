const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder, initiateKhaltiOrderPayment, confirmKhaltiOrderPayment } = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getMyOrders);

router.route('/:id').get(getOrderById);
router.route('/:id/cancel').put(cancelOrder);
router.route('/:id/payment/khalti/initiate').post(initiateKhaltiOrderPayment);
router.route('/:id/payment/khalti/confirm').put(confirmKhaltiOrderPayment);

module.exports = router;

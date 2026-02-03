const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../controllers/esewaController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/initiate', protect, initiatePayment);
router.get('/verify', verifyPayment);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  verifyOTP,
  resendOTP,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} = require('../utils/validators');

// Public routes
router.post(
  '/register',
  upload.fields([
    { name: 'citizenshipFront', maxCount: 1 },
    { name: 'citizenshipBack', maxCount: 1 },
  ]),
  validateRegister,
  handleValidationErrors,
  register
);

router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

module.exports = router;
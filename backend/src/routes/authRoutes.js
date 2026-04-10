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
  forgotPassword,
  resetPassword,
  applyExpert,
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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/apply-expert', protect, applyExpert);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
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

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
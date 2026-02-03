const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial } = require('../controllers/testimonialController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getTestimonials);
router.post('/', protect, admin, createTestimonial);

module.exports = router;

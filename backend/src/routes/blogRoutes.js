const express = require('express');
const router = express.Router();
const { getBlogPosts, createBlogPost } = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/posts', getBlogPosts);
router.post('/posts', protect, admin, createBlogPost);

module.exports = router;

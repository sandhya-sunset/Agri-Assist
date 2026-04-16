const express = require('express');
const router = express.Router();
const { getBlogPosts, createBlogPost, getBlogPostById } = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/posts', getBlogPosts);
router.get('/posts/:id', getBlogPostById);
router.post('/posts', protect, admin, createBlogPost);

module.exports = router;

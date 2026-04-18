const express = require('express');
const router = express.Router();
const { getBlogPosts, createBlogPost, getBlogPostById, updateBlogPost, deleteBlogPost } = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/posts', getBlogPosts);
router.get('/posts/:id', getBlogPostById);
router.post('/posts', protect, admin, upload.single('image'), createBlogPost);
router.put('/posts/:id', protect, admin, upload.single('image'), updateBlogPost);
router.delete('/posts/:id', protect, admin, deleteBlogPost);

module.exports = router;

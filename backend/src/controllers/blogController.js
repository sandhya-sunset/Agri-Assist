const BlogPost = require('../models/BlogPost');

// @desc    Get published blog posts
// @route   GET /api/blog/posts
// @access  Public
exports.getBlogPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const posts = await BlogPost.find({ published: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', 'name');
    
    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create blog post (admin only)
// @route   POST /api/blog/posts
// @access  Private/Admin
exports.createBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.create(req.body);
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

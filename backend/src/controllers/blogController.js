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

// @desc    Get single blog post
// @route   GET /api/blog/posts/:id
// @access  Public
exports.getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id).populate('author', 'name');
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
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
    const postData = { ...req.body };
    postData.author = req.user._id;

    if (req.body.tags) {
      try {
        postData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        postData.tags = [];
      }
    }

    if (req.file) {
      postData.image = `/${req.file.path.replace(/\\\\/g, "/")}`;
    }

    if (!postData.image) {
      postData.image = "/uploads/default-blog.jpg";
    }

    postData.published = true;

    const post = await BlogPost.create(postData);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    const fs = require('fs');
    fs.appendFileSync('crash.log', new Date().toISOString() + ' ERROR: ' + error.stack + '\n');
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update single blog post
// @route   PUT /api/blog/posts/:id
// @access  Private/Admin
exports.updateBlogPost = async (req, res) => {
  try {
    let post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    const postData = { ...req.body };

    if (req.body.tags) {
      try {
        postData.tags = JSON.parse(req.body.tags);
      } catch (e) {
         postData.tags = post.tags;
      }
    }

    if (req.file) {
      postData.image = `/${req.file.path.replace(/\\\\/g, "/")}`;
    }

    if (!postData.image && !post.image) {
      postData.image = "/uploads/default-blog.jpg";
    }

    post = await BlogPost.findByIdAndUpdate(req.params.id, postData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: post });
  } catch (error) {
     console.error('Error updating blog post:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete single blog post
// @route   DELETE /api/blog/posts/:id
// @access  Private/Admin
exports.deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    await post.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

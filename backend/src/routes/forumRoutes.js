const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const ForumPost = require('../models/ForumPost');
const Notification = require('../models/Notification');

// Get all forum posts with filters
router.get('/', async (req, res) => {
  try {
    const { category, status, search, sortBy } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'views') {
      sortOption = { views: -1 };
    } else if (sortBy === 'latest') {
      sortOption = { createdAt: -1 };
    } else if (sortBy === 'most-replies') {
      sortOption = { 'replies': -1 };
    }

    const posts = await ForumPost.find(query)
      .sort(sortOption)
      .limit(50);

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message,
    });
  }
});

// Get single post with all replies
router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message,
    });
  }
});

// Create new forum post
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, tags, cropType, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const newPost = await ForumPost.create({
      title,
      description,
      category: category || 'General Query',
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      userAvatar: req.user.avatar,
      tags: tags || [],
      cropType: cropType || '',
      location: location || '',
      replies: [],
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
});

// Add reply to post
router.post('/:id/replies', protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required',
      });
    }

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only allow experts, admins, or the original poster to reply
    if (req.user.role !== 'expert' && req.user.role !== 'admin' && post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only verified agriculture experts can reply to forum posts. Please apply to become an expert.',
      });
    }

          const reply = {
        _id: new mongoose.Types.ObjectId(),
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        userAvatar: req.user.avatar,
        content,
        isAccepted: false,
        likes: 0,
        createdAt: new Date(),
      };

      const updateData = { $push: { replies: reply } };
      if (post.status === 'open' && req.user.role === 'expert') {
        updateData.$set = { status: 'answered' };
      }

      const updatedPost = await require('../models/ForumPost').findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: false }
      );

      // Create notification if someone else replies to the post
      if (post.userId.toString() !== req.user.id) {
        const notification = await Notification.create({
          user: post.userId,
          type: 'forum',
          title: 'New Reply to Your Post',
          message: `${req.user.name} replied: ${content.substring(0, 40)}${content.length > 40 ? '...' : ''}`,
          link: `/forum/${post._id}`
        });

        // Try emitting to socket if IO is available
        const io = req.app.get('io');
        if (io) {
          io.to(post.userId.toString()).emit('newNotification', notification);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Reply added successfully',
        data: updatedPost,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error adding reply: ${error.message || error}`,
      error: error.message,
    });
  }
});

// Mark reply as accepted answer
router.put('/:postId/replies/:replyId/accept', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only post owner can accept answer
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only post owner can accept answers',
      });
    }

    const reply = post.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found',
      });
    }

    // Remove accepted status from other replies
    post.replies.forEach((r) => {
      r.isAccepted = false;
    });

    // Mark this reply as accepted
    reply.isAccepted = true;
    post.status = 'answered';

    await post.save();

    res.json({
      success: true,
      message: 'Reply marked as accepted answer',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error accepting reply',
      error: error.message,
    });
  }
});

// Update post status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only post owner or admin can update status
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    post.status = status;
    await post.save();

    res.json({
      success: true,
      message: 'Post status updated',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating post status',
      error: error.message,
    });
  }
});

// Delete post (only owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message,
    });
  }
});

// Like/Unlike reply
router.put('/:postId/replies/:replyId/like', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const reply = post.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Reply not found',
      });
    }

    // Toggle like (simple increment for now, could be improved with tracking who liked it)
    reply.likes += 1;

    await post.save();

    res.json({
      success: true,
      message: 'Reply liked successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error liking reply',
      error: error.message,
    });
  }
});


// Edit a reply
router.put('/:postId/replies/:replyId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Content is required' });

    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    if (reply.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this reply' });
    }

    reply.content = content;
    await post.save();

    res.json({ success: true, message: 'Reply updated successfully', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error editing reply', error: error.message });
  }
});

// Delete a reply
router.delete('/:postId/replies/:replyId', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: 'Reply not found' });

    if (reply.userId.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reply' });
    }

    reply.deleteOne();
    await post.save();

    res.json({ success: true, message: 'Reply deleted successfully', data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting reply', error: error.message });
  }
});

module.exports = router;


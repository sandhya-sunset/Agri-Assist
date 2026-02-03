const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      stock,
      description,
      sku,
      discount,
      offerText,
      status
    } = req.body;

    // Check for image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a product image'
      });
    }

    const product = await Product.create({
      seller: req.user._id, // Assumes auth middleware sets req.user
      name,
      category,
      price,
      stock,
      description,
      sku: sku || undefined, // undefined to bypass unique index if empty
      discount,
      offerText,
      status: status || 'active',
      image: req.file.path // Store path
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error(error);
    // Cleanup file if error
    if (req.file) {
      fs.unlink(req.file.path, (err) => { if (err) console.error(err); });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU must be unique'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get all products (with optional seller filter)
// @route   GET /api/products
// @access  Public (or Private for dashboard)
const getProducts = async (req, res) => {
  try {
    let query = {};
    
    // If querying by seller (e.g. for dashboard)
    if (req.query.seller) {
      query.seller = req.query.seller;
    }
    
    // If user is a seller requesting their own products via some flag, or generic fetch
    // specific logic can be added. For now, simple query param.

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller)
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const fieldsToUpdate = { ...req.body };

    // Handle Image Update
    if (req.file) {
        // Delete old image
        if (product.image) {
            fs.unlink(product.image, (err) => {
                if (err) console.error('Failed to delete old image:', err);
            });
        }
        fieldsToUpdate.image = req.file.path;
    }

    product = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Verify ownership
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Delete image file
    if (product.image) {
        fs.unlink(product.image, (err) => {
            if (err) console.error('Failed to delete image:', err);
        });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add reply to a review
// @route   POST /api/products/:id/reviews/:reviewId/reply
// @access  Private (Seller)
const addReply = async (req, res) => {
  try {
    const { text } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
     // Verify ownership
     if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to reply to reviews for this product'
        });
      }

    // Find review
    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Add reply
    review.replies.push({
        text,
        user: req.user._id
    });

    await product.save();

    res.status(200).json({
        success: true,
        message: 'Reply added',
        data: product
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email location')
      .populate('reviews.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Add a review/question
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const review = {
      user: req.user._id,
      userName: req.user.name,
      rating: Number(rating) || 5, // Default to 5 if it's just a question
      comment
    };

    product.reviews.push(review);
    
    // Update average rating
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added',
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const review = product.reviews.id(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check if user is review owner or admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Use pull to remove the subdocument
        product.reviews.pull(req.params.reviewId);

        // Recalculate rating
        if (product.reviews.length > 0) {
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        } else {
            product.rating = 0;
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Review deleted',
            data: product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  addReply,
  deleteReview
};

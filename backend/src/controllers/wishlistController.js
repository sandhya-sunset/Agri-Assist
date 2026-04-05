const User = require('../models/User');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if product is already in wishlist
    const index = user.wishlist.indexOf(productId);
    let isAdded = false;

    if (index > -1) {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
    } else {
      // Add to wishlist
      user.wishlist.push(productId);
      isAdded = true;
    }

    await user.save();

    // Optionally populate wishlist before returning, but usually frontend only needs to update its local state based on isAdded.
    // However, returning the updated wishlist IDs is a good practice.
    res.status(200).json({
      success: true,
      data: user.wishlist,
      isAdded,
      message: isAdded ? 'Product added to wishlist' : 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

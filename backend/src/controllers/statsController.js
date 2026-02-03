const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get homepage statistics
// @route   GET /api/stats/homepage
// @access  Public
exports.getHomepageStats = async (req, res) => {
  try {
    // Count total users (excluding sellers and admins)
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Count total delivered orders
    const totalOrders = await Order.countDocuments({ status: 'Delivered' });
    
    // Calculate average rating from all products
    const products = await Product.find({});
    const avgRating = products.length > 0 
      ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length 
      : 4.8;
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers: `${totalUsers.toLocaleString()}+`,
        totalOrders: `${totalOrders.toLocaleString()}+`,
        avgRating: `${avgRating.toFixed(1)}/5`,
        yieldIncrease: '40%'
      }
    });
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

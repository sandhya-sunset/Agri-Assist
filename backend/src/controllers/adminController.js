const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total revenue from completed orders
    const revenueStats = await Order.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
      }}
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    const totalOrders = revenueStats.length > 0 ? revenueStats[0].totalOrders : 0;

    // Calculate commission (10% of revenue)
    const commissionRate = 0.10;
    const commissionEarned = totalRevenue * commissionRate;

    // Get user counts
    const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
    const activeSellers = await User.countDocuments({ role: 'seller', isVerified: true, isActive: true });
    const pendingSellers = await User.countDocuments({ role: 'seller', isVerified: false });

    // Get total products
    const totalProducts = await Product.countDocuments();

    // Calculate monthly growth (compare current month to previous month)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
      paymentStatus: 'Completed'
    });

    const previousMonthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfPreviousMonth, $lt: startOfCurrentMonth },
      paymentStatus: 'Completed'
    });

    const monthlyGrowth = previousMonthOrders > 0 
      ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        commissionEarned: Math.round(commissionEarned),
        totalOrders,
        activeUsers,
        activeSellers,
        pendingSellers,
        totalProducts,
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1))
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get orders list
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name seller',
        populate: {
          path: 'seller',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const formattedOrders = orders.map(order => {
      const firstItem = order.items[0];
      const product = firstItem?.product;
      
      return {
        id: order._id,
        buyer: order.user?.name || 'Unknown',
        seller: product?.seller?.name || 'Unknown',
        product: product?.name || 'Unknown Product',
        amount: order.totalAmount,
        commission: Math.round(order.totalAmount * 0.10), // 10% commission
        status: order.paymentStatus === 'Completed' ? 'completed' : 'pending',
        date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 'N/A'
      };
    });

    const total = await Order.countDocuments();

    res.status(200).json({
      success: true,
      data: formattedOrders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get commission settings
// @route   GET /api/admin/commission
// @access  Private/Admin
exports.getCommissionSettings = async (req, res) => {
  try {
    // For now, return default settings
    // In production, these would be stored in a Settings collection
    const settings = {
      defaultRate: 15,
      fertilizers: 12,
      pesticides: 18,
      seeds: 10,
      equipment: 20
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching commission settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update commission settings
// @route   PUT /api/admin/commission
// @access  Private/Admin
exports.updateCommissionSettings = async (req, res) => {
  try {
    const settings = req.body;

    // In production, save to Settings collection
    // For now, just return the updated settings
    
    res.status(200).json({
      success: true,
      message: 'Commission settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating commission settings:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

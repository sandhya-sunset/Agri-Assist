const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    // Filter users: we might want to exclude admins or show them differently. 
    // Here we exclude admins to prevent accidents, or we can just show everyone.
    // For now, let's show all non-admin users as this is typically what an admin manages.
    
    // We can also support query params for search if needed later, but frontend search is already there.
    
    // Calculate stats if needed or just return raw list
    // Formatting data to match frontend expectation
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'active' : 'blocked', // Mapped from isActive
      joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : 'N/A',
      orders: 0, 
      spent: 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user status (Block/Unblock)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'blocked'
    
    // Map status string to boolean isBlocked if that's how model works, 
    // OR if we added a 'status' field.
    // Let's assume we'll use a 'status' field or 'isBlocked'.
    // Standard User models usually have isBlocked. Let's check User model first or just use a generic update.
    
    // Let's check/assume User model structure. 
    // If we simply update whatever field is passed:
    
    let updateData = {};
    if (status === 'blocked') updateData.isActive = false;
    if (status === 'active') updateData.isActive = true;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User ${status === 'blocked' ? 'blocked' : 'activated'} successfully`,
      data: {
        id: user._id,
        status: user.isActive ? 'active' : 'blocked'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get all sellers with stats
// @route   GET /api/users/sellers
// @access  Private/Admin
exports.getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('-password')
      .sort({ createdAt: -1 });

    // In a real app with many sellers, we should optimize this using MongoDB aggregation pipeline
    // For now, we'll do promise.all for simplicity
    const sellersWithStats = await Promise.all(sellers.map(async (seller) => {
      // Count products
      const productsCount = await mongoose.model('Product').countDocuments({ seller: seller._id });
      
      // Calculate Total Sales & Commission
      // 1. Find all orders containing products by this seller
      // 2. Identify which items belong to this seller and sum them up
      // This is expensive, better to have a running total in User model, but calculating it for now.
      
      // Aggregation to get sales for this seller
      const salesStats = await mongoose.model('Order').aggregate([
        { $match: { paymentStatus: 'Completed' } },
        { $unwind: '$items' },
        { $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails'
        }},
        { $unwind: '$productDetails' },
        { $match: { 'productDetails.seller': seller._id } },
        { $group: {
            _id: null,
            totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }}
      ]);

      const totalSales = salesStats.length > 0 ? salesStats[0].totalSales : 0;
      const commissionRate = 0.1; // Example 10% commission
      const commission = totalSales * commissionRate;

      return {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        address: seller.address,
        citizenship: seller.citizenship,
        businessType: seller.businessType,
        storeDescription: seller.storeDescription,
        storeDescription: seller.storeDescription,
        status: !seller.isVerified ? 'pending' : (seller.isActive ? 'active' : 'blocked'),
        joinDate: seller.createdAt ? new Date(seller.createdAt).toISOString().split('T')[0] : 'N/A',
        products: productsCount,
        totalSales: totalSales,
        commission: commission,
        rating: 0 // Placeholder or fetch reviews aggregation
      };
    }));

    res.status(200).json({
      success: true,
      data: sellersWithStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update seller status (Approve/Reject)
// @route   PUT /api/users/sellers/:id/status
// @access  Private/Admin
exports.updateSellerStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active' (approve) or 'rejected'
    const sellerId = req.params.id;

    const seller = await User.findOne({ _id: sellerId, role: 'seller' });

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    if (status === 'active') {
      seller.isVerified = true;
      seller.isActive = true;
    } else if (status === 'rejected') {
      // For rejection, we might want to just keep them unverified or deactivate them
      seller.isVerified = false;
      seller.isActive = false; 
    } else if (status === 'blocked') {
        seller.isActive = false; // Blocked means inactive but kept verified state if needed
    } else if (status === 'pending') {
        seller.isVerified = false;
        seller.isActive = true; // Maybe active but unverified?
    }

    await seller.save();

    // Send notification email
    const sendEmail = require('../utils/sendEmail');
    const message = status === 'active' 
      ? `Congratulations! Your seller account at AgriAssist has been approved. You can now login and start listing your products.` 
      : `We regret to inform you that your seller account request at AgriAssist has been rejected. Please contact support for more details.`;
      
    // Only send email on distinct status changes like Approval/Rejection, maybe not blocking?
    // Let's keep it simple or check if status is active/rejected
    if (status === 'active' || status === 'rejected') {
      try {
        await sendEmail({
          email: seller.email,
          subject: `Seller Account Update - ${status === 'active' ? 'Approved' : 'Rejected'}`,
          message,
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
        // Don't fail the request if email fails, just log it
      }
    }

    res.status(200).json({
      success: true,
      message: `Seller status updated to ${status}`,
      data: {
        id: seller._id,
        status: !seller.isVerified ? 'pending' : (seller.isActive ? 'active' : 'blocked')
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

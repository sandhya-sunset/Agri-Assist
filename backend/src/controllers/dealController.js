const Deal = require('../models/Deal');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get active deals
// @route   GET /api/deals/active
// @access  Public
exports.getActiveDeals = async (req, res) => {
  try {
    const now = new Date();
    
    const deals = await Deal.find({
      active: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: deals
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create deal (admin only)
// @route   POST /api/deals
// @access  Private/Admin
exports.createDeal = async (req, res) => {
  try {
    const deal = await Deal.create(req.body);
    
    res.status(201).json({
      success: true,
      data: deal
    });

    // Notify all users about the new deal
    try {
      const io = req.app.get('io');
      const users = await User.find({ role: 'user' });
      
      const notifications = users.map(user => ({
        user: user._id,
        type: 'system',
        title: `Big Sale: ${deal.title}`,
        message: `${deal.subtitle}. Check it out now!`,
        link: '/home'
      }));

      await Notification.insertMany(notifications);

      if (io) {
        io.emit('newNotification', { 
          type: 'system', 
          title: `Big Sale: ${deal.title}`,
          message: deal.subtitle,
          link: '/home'
        });
      }
    } catch (notifyError) {
      console.error('Failed to send deal notifications:', notifyError);
    }
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const Deal = require('../models/Deal');

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
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

const Message = require('../models/Message');
const Notification = require('../models/Notification');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiver, product, text } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      receiver,
      product,
      text
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('product', 'name image');

    const io = req.app.get('io');
    
    // Emit to receiver
    io.to(receiver).emit('receive_message', populatedMessage);
    // Emit to sender for confirmation if needed (or they can update UI locally)
    io.to(req.user._id.toString()).emit('receive_message', populatedMessage);
    
    // Create persistent notification
    const notification = await Notification.create({
      user: receiver,
      type: 'message',
      title: `New Message from ${req.user.name}`,
      message: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      link: `/user-message`
    });

    // Notification event for real-time update
    // Send the exact same structure as stored in DB
    io.to(receiver).emit('notification', notification);

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages for a user
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .populate('product', 'name image')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

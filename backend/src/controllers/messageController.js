const Message = require("../models/Message");
const Notification = require("../models/Notification");

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
      text,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("product", "name image");

    const io = req.app.get("io");

    // Emit to receiver
    io.to(receiver).emit("receive_message", populatedMessage);
    // Emit to sender for confirmation if needed (or they can update UI locally)
    io.to(req.user._id.toString()).emit("receive_message", populatedMessage);

    // Create persistent notification
    const notification = await Notification.create({
      user: receiver,
      type: "message",
      title: `New Message from ${req.user.name}`,
      message: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      link: `/user-message`,
    });

    // Notification event for real-time update
    // Send the exact same structure as stored in DB
    io.to(receiver).emit("notification", notification);

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get messages for a user
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("product", "name image")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get contacts (sellers, experts, admins) to start a chat with
// @route   GET /api/messages/contacts
// @access  Private
const User = require("../models/User");

exports.getContacts = async (req, res) => {
  try {
    // Only return users who are sellers, experts, or admins.
    // Also, don't return the currently logged in user to themselves.
    const contacts = await User.find({
      _id: { $ne: req.user._id },
      role: { $in: ['seller', 'expert', 'admin'] }
    }).select("name email role profileImage");

    res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark messages from a specific sender as read
// @route   PUT /api/messages/read/:id
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const contactId = req.params.id;

    // Update all unread messages where the contact is the sender, and the current user is the receiver
    await Message.updateMany(
      {
        sender: contactId,
        receiver: req.user._id,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    // Also marked as read if the current user is the sender and the other person is the receiver? No, we only can read messages sent TO us
    
    // Also delete any existing "New Message" notifications from this sender to the user
    await Notification.deleteMany({
      user: req.user._id,
      type: "message",
      link: "/user-message"
    });

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error("Mark as read error", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

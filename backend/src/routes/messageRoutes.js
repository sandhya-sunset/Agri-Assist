const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getContacts, markAsRead } = require('../controllers/messageController');

// Middleware to protect routes and get user from token
const { protect } = require('../middlewares/authMiddleware');

router.get('/contacts', protect, getContacts);

router.route('/')
  .post(protect, sendMessage)
  .get(protect, getMessages);

router.put('/read/:id', protect, markAsRead);

module.exports = router;

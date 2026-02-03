const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, clearNotifications } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .delete(clearNotifications);

router.route('/:id')
  .put(markAsRead);

module.exports = router;

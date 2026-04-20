const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask, testReminder } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.post('/test-reminder', testReminder);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;

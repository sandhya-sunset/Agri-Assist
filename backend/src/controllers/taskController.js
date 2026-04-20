const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, scheduledDate, scheduledTime } = req.body;
    const task = await Task.create({
      user: req.user._id,
      title,
      scheduledDate,
      scheduledTime
    });
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.testReminder = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notificationData = {
      user: req.user._id,
      type: 'system',
      title: 'Test Reminder',
      message: 'This is a test task reminder.',
      link: '/home'
    };
    const notification = await Notification.create(notificationData);
    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }
    res.status(200).json({ success: true, message: 'Test reminder requested' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

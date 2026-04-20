const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/agri_assist').then(async () => {
  const Task = require('./src/models/Task.js');
  const Notification = require('./src/models/Notification.js');
  const { parseTaskTime, getTaskDueDate } = require('./src/utils/parseTaskTime.js');
  const tasks = await Task.find({ isCompleted: false, reminded: { $ne: true } });
  const now = new Date();
  
  for (const task of tasks) {
    let taskDate = new Date(task.scheduledDate);
    if (isNaN(taskDate.getTime())) {
      continue;
    }
    let minutesSinceMidnight = parseTaskTime(task.scheduledTime) || 0;
    const dueDate = getTaskDueDate(taskDate, minutesSinceMidnight);
    console.log(now, dueDate, now >= dueDate);
  }
  process.exit(0);
});
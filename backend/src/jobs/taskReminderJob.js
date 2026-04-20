const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { parseTaskTime, getTaskDueDate } = require('../utils/parseTaskTime');

const startTaskReminderJob = (io) => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find tasks that are not completed and haven't been reminded yet
      const tasks = await Task.find({ isCompleted: false, reminded: { $ne: true } });
      
      for (const task of tasks) {
        let taskDate = new Date(task.scheduledDate);
        if (isNaN(taskDate.getTime())) {
            continue; // Skip invalid dates
        }
        
        let minutesSinceMidnight = parseTaskTime(task.scheduledTime) || 0;
        
        const dueDate = getTaskDueDate(taskDate, minutesSinceMidnight);
        
        // If current time is equal to or past the due date (within a short window, or simply past it)
        if (now >= dueDate) {
          // Send notification
          const notificationData = {
            user: task.user,
            type: 'system',
            title: 'Task Reminder',
            message: `Reminder: ${task.title} is due!`,
            link: '/home'
          };
          
          const notification = await Notification.create(notificationData);
          
          if (io) {
            io.to(task.user.toString()).emit('notification', notification);
          }
          
          // Mark as reminded
          task.reminded = true;
          await task.save();
        }
      }
    } catch (error) {
      console.error('Error running task reminder job:', error);
    }
  });
};

module.exports = startTaskReminderJob;

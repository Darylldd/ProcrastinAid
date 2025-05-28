const PomodoroSession = require('../models/PomodoroSession');
const Task = require('../models/Task');

exports.showInsights = async (req, res) => {
  const userId = req.session.userId;

  try {
    const sessionData = await PomodoroSession.getInsightsByUser(userId);
    const tasks = await Task.getAll(userId);

    if (!sessionData.length) {
      return res.render('insights', { 
        bestHour: null, 
        bestDay: null, 
        topTask: null, 
        message: 'No Pomodoro sessions found. Start a session to see insights!' 
      });
    }

    // Aggregate total minutes by hour, day, and task
    const timeByHour = {};
    const timeByDay = {};
    const timeByTask = {};

    sessionData.forEach(row => {
      timeByHour[row.hour] = (timeByHour[row.hour] || 0) + row.total_minutes;
      timeByDay[row.day] = (timeByDay[row.day] || 0) + row.total_minutes;

      const taskName = tasks.find(t => t.id === row.task_id)?.title || "Unknown Task";
      timeByTask[taskName] = (timeByTask[taskName] || 0) + row.total_minutes;
    });

    // Sort to find highest totals
    const bestHour = Object.entries(timeByHour).sort((a, b) => b[1] - a[1])[0];
    const bestDay = Object.entries(timeByDay).sort((a, b) => b[1] - a[1])[0];
    const topTask = Object.entries(timeByTask).sort((a, b) => b[1] - a[1])[0];

    res.render('insights', {
      bestHour,
      bestDay,
      topTask,
      message: null
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).send('Internal Server Error');
  }
};

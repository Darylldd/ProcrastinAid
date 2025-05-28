const Task = require('../models/Task');
const PomodoroSession = require('../models/PomodoroSession');

exports.showDashboard = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login'); // Redirect unauthenticated users
  }
  
  const userId = req.session.userId;

  try {
    // Fetch tasks and Pomodoro sessions for this user
    const tasks = await Task.getAll(userId);
    const sessions = await PomodoroSession.getByUser(userId);

    // Render dashboard view with fetched data
    res.render('dashboard', { tasks, sessions });
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    res.status(500).send('Internal Server Error');
  }
};

const PomodoroSession = require('../models/PomodoroSession');
const Task = require('../models/Task');

exports.listSessions = async (req, res) => {
  try {
    const userId = req.session.userId;
    // Make sure findByUser uses parameterized queries with $1 for PostgreSQL
    const sessions = await PomodoroSession.findByUser(userId, 20);
    const tasks = await Task.findByUser(userId);
    res.render('pomodoro/list', { sessions, tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.startSession = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { taskId, duration } = req.body;

    if (!taskId || !duration) {
      return res.status(400).json({ error: 'Task ID and duration required' });
    }

    // findActiveByUserAndTask should query with $1, $2 placeholders in model
    const activeSession = await PomodoroSession.findActiveByUserAndTask(userId, taskId);
    if (activeSession) {
      return res.status(400).json({ error: 'Active session already exists' });
    }

    const startTime = new Date();
    // create method should use INSERT with parameterized values ($1, $2, ...)
    const id = await PomodoroSession.create(userId, taskId, duration, startTime.toISOString());

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ success: true, sessionId: id });
    }

    res.redirect(`/pomodoro/timer?taskId=${taskId}&sessionId=${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.stopSession = async (req, res) => {
  try {
    const userId = req.session.userId;
    const sessionId = req.params.id;
    const endTime = new Date().toISOString();

    // updateStatus should run an UPDATE query with PostgreSQL parameter placeholders
    const success = await PomodoroSession.updateStatus(sessionId, userId, 'completed', endTime);
    if (!success) {
      return res.status(404).send('Pomodoro session not found or already stopped');
    }
    res.redirect('/pomodoro');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.showTimer = async (req, res) => {
  try {
    const userId = req.session.userId;
    const taskId = parseInt(req.query.taskId) || null;
    const duration = parseInt(req.query.duration) || 25;

    let activeSessionId = 0;
    if (taskId) {
      // findActiveByUserAndTask must be PostgreSQL compatible in your model
      const activeSession = await PomodoroSession.findActiveByUserAndTask(userId, taskId);
      if (activeSession) activeSessionId = activeSession.id;
    }

    res.render('pomodoro/timer', { taskId, duration, activeSessionId });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const PomodoroSession = require('../models/PomodoroSession');

exports.getInsights = async (req, res) => {
  try {
    const userId = req.session.userId;
    // Get all pomodoro sessions for this user from PostgreSQL
    const sessions = await PomodoroSession.findAllByUser(userId);

    if (!sessions.length) {
      return res.render('ai/insights', { insights: null, message: 'No sessions yet. Start using the Pomodoro timer!' });
    }

    // Initialize stats arrays for hours (0-23) and days (0-6)
    const hourlyStats = new Array(24).fill(0);
    const dayStats = new Array(7).fill(0);

    sessions.forEach(session => {
      // Make sure date is a JS Date object (PostgreSQL may return a string)
      const date = new Date(session.start_time);

      // Defensive check if date is valid
      if (!isNaN(date)) {
        hourlyStats[date.getHours()] += 1;
        dayStats[date.getDay()] += 1;
      }
    });

    // Find hour and day with max sessions
    const mostProductiveHour = hourlyStats.indexOf(Math.max(...hourlyStats));
    const mostProductiveDay = dayStats.indexOf(Math.max(...dayStats));

    // Calculate average duration safely
    const totalDuration = sessions.reduce((acc, s) => acc + Number(s.duration), 0);
    const avgDuration = (totalDuration / sessions.length).toFixed(2);

    const insights = {
      bestHour: `${mostProductiveHour}:00 - ${mostProductiveHour + 1}:00`,
      bestDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][mostProductiveDay],
      totalSessions: sessions.length,
      avgDuration
    };

    res.render('ai/insights', { insights, message: null });

  } catch (err) {
    console.error('Error generating insights:', err);
    res.status(500).send('Error generating insights');
  }
};

const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

// Get Pomodoro sessions history
router.get('/', pomodoroController.listSessions);
router.get('/timer', pomodoroController.showTimer);

// Start a new Pomodoro session for a task

router.post('/start', pomodoroController.startSession);

// Stop an active Pomodoro session
router.post('/stop/:id', pomodoroController.stopSession);

module.exports = router;

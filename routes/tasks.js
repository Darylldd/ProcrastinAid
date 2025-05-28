const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

// Show all tasks
router.get('/', taskController.listTasks);

// Show form for new task
router.get('/new', taskController.showNewTaskForm);

// Handle new task submission
router.post('/new', taskController.createTask);

// Show form to edit task
router.get('/edit/:id', taskController.showEditTaskForm);

// Handle task update
router.post('/edit/:id', taskController.updateTask);

// Handle task deletion
router.post('/delete/:id', taskController.deleteTask);

module.exports = router;

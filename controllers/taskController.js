const Task = require('../models/Task');

exports.listTasks = async (req, res) => {
  try {
    const userId = req.session.userId;
    // findByUser in model must use PostgreSQL parameters ($1) for userId
    const tasks = await Task.findByUser(userId);
    res.render('tasks/list', { tasks });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.showNewTaskForm = (req, res) => {
  res.render('tasks/new', { title: '', description: '', error: null });
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description } = req.body;
    if (!title || title.trim() === '') {
      return res.render('tasks/new', { error: 'Title is required', title, description });
    }
    // create method should INSERT with PostgreSQL placeholders ($1, $2, $3)
    await Task.create(userId, title.trim(), description.trim());
    res.redirect('/tasks');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.showEditTaskForm = async (req, res) => {
  try {
    const userId = req.session.userId;
    // findById must safely query task by id with $1 placeholder
    const task = await Task.findById(req.params.id);
    if (!task || task.user_id !== userId) {
      return res.status(404).send('Task not found');
    }
    res.render('tasks/edit', { task });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.updateTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description, completed } = req.body;
    // update method should run UPDATE with PostgreSQL params ($1, $2, ...)
    const success = await Task.update(req.params.id, userId, {
      title: title.trim(),
      description: description.trim(),
      completed: completed === 'on',
    });

    if (!success) {
      return res.status(404).send('Task not found or update failed');
    }
    res.redirect('/tasks');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    // delete method should run DELETE with PostgreSQL parameterization
    const success = await Task.delete(req.params.id, userId);
    if (!success) {
      return res.status(404).send('Task not found or delete failed');
    }
    res.redirect('/tasks');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

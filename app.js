
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));


// Routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const pomodoroRoutes = require('./routes/pomodoro');

const aiRoutes = require('./routes/ai');

const dashboardRoutes = require('./routes/dashboard');

const insightRoutes = require('./routes/insightRoutes');

app.use('/insights', insightRoutes);

app.use('/dashboard', dashboardRoutes);

app.use('/ai', aiRoutes);

app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/pomodoro', pomodoroRoutes);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

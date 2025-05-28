const User = require('../models/User');

exports.showLogin = (req, res) => {
  res.render('login');
};

exports.showSignup = (req, res) => {
  res.render('signup');
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.verifyPassword(username, password);
  if (user) {
    req.session.userId = user.id;
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Invalid username or password' });
};

exports.signup = async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findByUsername(username);
  if (existingUser) {
    return res.render('signup', { error: 'Username already exists' });
  }
  await User.create(username, password);
  res.redirect('/auth/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

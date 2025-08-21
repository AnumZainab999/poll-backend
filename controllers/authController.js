const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    // check if email exists
    const exists = await User.findByEmail(email);
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, parseInt(process.env.SALT || '10', 10));
    const user = await User.create({ username, email, password: hash });

    // generate token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatar_url },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    res.json({
      message: 'Logged in',
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatar_url },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

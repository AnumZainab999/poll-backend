const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/database'); // Supabase client

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    // Check if email already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (checkError) throw checkError;
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, parseInt(process.env.SALT || '10', 10));

    // Insert new user
    const { data: newUserArray, error: insertError } = await supabase
      .from('users')
      .insert([{ username, email, password: hash }])
      .select('*');

    if (insertError) throw insertError;

    const newUser = newUserArray[0];

    // Generate JWT token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET);

    res.status(201).json({
      message: 'Registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatar_url || null
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });

    // Find user by email
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (findError) throw findError;
    if (!users || users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET);

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url || null
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

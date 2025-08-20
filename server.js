require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db'); // Sequelize instance

// Import routes
const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// --------------------- Middleware ---------------------
app.use(cors({
  origin: '*', // or replace with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files (only public folder now)
app.use(express.static(path.join(__dirname, 'public')));

// --------------------- Routes ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Polls API 🚀');
});

// --------------------- Error handler ---------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// --------------------- Database connection ---------------------
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Models synced');
    }
  } catch (e) {
    console.error('❌ DB Startup error:', e.message);
  }
})();

// Export for Vercel serverless
module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database'); // Sequelize instance

const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

// Frontend origin
const FRONTEND_ORIGIN = 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// ✅ Serve favicon.ico (avoid 500 error in logs)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'), (err) => {
    if (err) {
      console.warn('⚠️ Favicon not found, sending 204');
      res.status(204).end();
    }
  });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/comments', commentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Connect DB once
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ DB synced');
    }
  } catch (e) {
    console.error('❌ DB Startup error:', e.message);
  }
})();

// Export for Vercel serverless
module.exports = app;

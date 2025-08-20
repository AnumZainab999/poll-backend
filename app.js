require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

const FRONTEND_ORIGIN = 'http://localhost:3000'; // baad me apna frontend domain set karna

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Health
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

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    await sequelize.sync({ alter: true });
  } catch (e) {
    console.error('❌ DB startup error:', e.message);
    process.exit(1);
  }
})();

module.exports = app;

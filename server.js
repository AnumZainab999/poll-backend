require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./config/database'); // Supabase client

const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:3000',                   // local frontend
  'https://your-frontend.vercel.app',       // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin like mobile apps, curl, postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json({ limit: '1mb' }));

// Serve favicon.ico (avoid 500 error in logs)
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

// Test Supabase connection
(async () => {
  try {
    // Perform a simple query to test the connection
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connected');
  } catch (e) {
    console.error('❌ Supabase connection error:', e.message);
  }
})();

// Export for Vercel serverless
module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to MongoDB


const app = express();

// Middleware
// cors is configured to allow requests from our React frontend and allow cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json()); // Allows us to parse JSON in request bodies
app.use(cookieParser()); // Allows us to parse HTTP-only cookies (for JWTs)

// Routes
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') && req.get('origin') !== (process.env.FRONTEND_URL || 'http://localhost:5173')) return res.status(403).json({ message: 'Origin not allowed' });
  next();
});
const attempts = new Map();
const cleanup = setInterval(() => { for (const [key, value] of attempts) if (value.until < Date.now()) attempts.delete(key); }, 60000);
cleanup.unref();
app.post('/api/auth/login', (req, res, next) => {
  let entry = attempts.get(req.ip);
  if (!entry || entry.until < Date.now()) { entry = { count: 0, until: Date.now() + 900000 }; attempts.set(req.ip, entry); }
  if (++entry.count > 20) return res.status(429).json({ message: 'Too many login attempts. Try again in 15 minutes.' });
  next();
});
// Public registration is disabled.
const { loginUser, logoutUser } = require('./controllers/authController');
app.post('/api/auth/login', loginUser);
app.post('/api/auth/logout', logoutUser);
app.use('/api', require('./routes/contentRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(['CastError', 'ValidationError'].includes(err.name) || err.type === 'entity.parse.failed' ? 400 : 500).json({ message: 'Unable to complete request. Check your input and try again.' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Photography Club Portal API is running');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
}));

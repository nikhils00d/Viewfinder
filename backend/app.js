const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');


// Connect to MongoDB


const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
  next();
});
app.get('/api/health', (req, res) => {
  const ready = require('mongoose').connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable' });
});

// Local Vite ports may change when another preview is already running.
function allowedOrigin(origin) {
  if (!origin || origin === 'https://viewfinderconfluenz.vercel.app' || origin === process.env.FRONTEND_URL) return true;
  if (process.env.NODE_ENV === 'production') return false;
  try { const u = new URL(origin); return u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname); } catch { return false; }
}
app.use(cors({ origin: (origin, callback) => callback(null, allowedOrigin(origin)), credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
// Routes
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') && !allowedOrigin(req.get('origin'))) return res.status(403).json({ message: 'Origin not allowed' });
  next();
});
const rateLimit = require('express-rate-limit');
app.use('/api/auth', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.post('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
}));
// Public registration is disabled.
const { loginUser, logoutUser } = require('./controllers/authController');
app.post('/api/auth/login', loginUser);
app.post('/api/auth/logout', logoutUser);
app.use('/api', require('./routes/contentRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.type === 'entity.too.large' ? 413 : ['CastError', 'ValidationError'].includes(err.name) || err.type === 'entity.parse.failed' ? 400 : 500).json({ message: 'Unable to complete request. Check your input and try again.' });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Photography Club Portal API is running');
});

module.exports = app;

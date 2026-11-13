require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
  console.error('Configure a unique JWT_SECRET in backend/.env.');
  process.exit(1);
}
connectDB().then(() => {
  const server = app.listen(PORT, () => console.log(`API listening on port ${PORT}.`));
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Stop the other API instance or choose another PORT.` : 'API server failed to start.'); process.exit(1); });
  const shutdown = () => server.close(() => require('mongoose').disconnect().finally(() => process.exit(0)));
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}).catch(() => { console.error('Database connection failed. Check MONGO_URI, network access, and your MongoDB IP allowlist.'); process.exit(1); });

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

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

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Photography Club Portal API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

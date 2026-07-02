const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // Create the JWT token with the user's ID
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days as per PRD
  });

  // Set JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
    secure: process.env.NODE_ENV !== 'development', // Use HTTPS in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

module.exports = generateToken;

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sessionCookie = require('../utils/sessionCookie');

// @desc    Register a new user (Pending approval)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user (role defaults to Guest, status defaults to pending)
    const user = await User.create({
      name,
      email,
      phone,
      password,
    });

    if (user) {
      // Don't log them in automatically since they are pending approval
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        message: 'Registration successful. Waiting for admin approval.',
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Authentication request failed:', error.name);
    res.status(500).json({ message: 'Sign in is temporarily unavailable. Please try again.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password || email.length > 254 || password.length > 200) {
      return res.status(400).json({ message: 'Enter your email and password' });
    }

    // Find user and explicitly select password since we hid it by default
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'active' || user.role !== 'Admin') {
        return res.status(403).json({ message: 'Active administrator access required' });
      }
      // Generate token and set it in cookie
      generateToken(res, user._id);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Authentication request failed:', error.name);
    res.status(500).json({ message: 'Sign in is temporarily unavailable. Please try again.' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.clearCookie('jwt', sessionCookie());
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};

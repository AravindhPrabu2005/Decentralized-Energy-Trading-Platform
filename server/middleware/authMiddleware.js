const jwt = require('jsonwebtoken');

// Verify JWT Token
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is prosumer
const isProsumer = (req, res, next) => {
  if (req.user.userType !== 'prosumer') {
    return res.status(403).json({ error: 'Access denied. Prosumer only.' });
  }
  next();
};

// Check if user is consumer
const isConsumer = (req, res, next) => {
  if (req.user.userType !== 'consumer') {
    return res.status(403).json({ error: 'Access denied. Consumer only.' });
  }
  next();
};

module.exports = { authMiddleware, isProsumer, isConsumer };

const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('../routes/auth');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token has been invalidated' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
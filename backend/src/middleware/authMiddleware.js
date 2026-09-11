const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/secrets');
const dataService = require('../services/dataService');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please sign in again.' });
  }
};

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. You do not have permission to access this resource.'
      });
    }

    next();
  };
};

const requireVerifiedFarmer = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Admins bypass farmer verification checks
  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.role !== 'farmer') {
    return res.status(403).json({ success: false, message: 'Access restricted to verified farmers.' });
  }

  const farmerUser = await dataService.findUserById(req.user.id);
  const verificationStatus = farmerUser?.farmDetails?.verificationStatus || 'pending';

  if (verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      verificationStatus,
      message: `Your farmer account is currently '${verificationStatus}'. Marketplace produce operations require platform admin verification approval.`
    });
  }

  next();
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // Ignore invalid token for optional auth — treat as unauthenticated
  }
  next();
};

module.exports = { authenticateToken, optionalAuth, requireRole, requireVerifiedFarmer };

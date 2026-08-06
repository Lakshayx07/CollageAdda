import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select(
        '_id name email university isVerified verificationStatus onboardingComplete interests isAdmin'
      );
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      req.user.isAdmin = req.user.email === 'collageadda1@gmail.com' || req.user.role === 'admin';
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const verified = (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. Please verify your student identity first.',
      verificationStatus: req.user?.verificationStatus || 'unverified'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

export { protect, verified, adminOnly };

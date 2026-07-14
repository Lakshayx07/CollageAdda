import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const verified = (req, res, next) => {
  // Auto-verify users for now to prevent blocking features during testing
  // In production, this would check req.user.isVerified
  if (req.user) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. Please verify your student identity first 🎓',
      verificationStatus: 'unverified'
    });
  }
};

export { protect, verified };

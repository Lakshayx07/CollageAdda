import express from 'express';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all listings (visible to all users across all colleges)
router.get('/', protect, async (req, res) => {
  try {
    const listings = await Listing.find({})
      .populate('seller', 'name university isVerified')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a listing
router.post('/', protect, async (req, res) => {
  const { title, price, condition, type, gigType, comment, image, roleNeeded, projectType, compensation } = req.body;
  try {
    const listing = await Listing.create({
      title,
      price,
      condition,
      type,
      gigType,
      roleNeeded: roleNeeded || '',
      projectType: projectType || '',
      compensation: compensation || '',
      comment,
      image,
      seller: req.user._id
    });
    const populated = await listing.populate('seller', 'name university isVerified');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

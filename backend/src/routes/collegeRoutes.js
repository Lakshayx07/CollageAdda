import express from 'express';
import College from '../models/College.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/colleges
// @desc    Get all colleges
router.get('/', protect, async (req, res) => {
  try {
    const colleges = await College.find({});
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/colleges/:id
// @desc    Get college details by ID, including posts and students
router.get('/:id', protect, async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });

    // Find students belonging to this university
    const students = await User.find({ university: college.name }).limit(20).select('name profilePic bio university interests year');
    
    // Find posts belonging to this university
    const posts = await Post.find({ university: college.name })
      .populate('author', 'name profilePic university')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      ...college.toObject(),
      studentsData: students,
      postsData: posts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

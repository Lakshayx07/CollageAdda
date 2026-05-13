import express from 'express';
import College from '../models/College.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
 
// @route   GET /api/colleges/public
// @desc    Get all colleges (public, for login/register)
router.get('/public', async (req, res) => {
  try {
    const colleges = await College.find({}).select('name');
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

    // Find students and posts belonging to this university
    const fullName = college.name.trim();
    const baseName = fullName.split(',')[0].trim();
    const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedFullName = fullName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Extract acronym if it exists in parentheses, e.g., "School of Planning and Architecture (SPA)" -> "SPA"
    const acronymMatch = fullName.match(/\(([^)]+)\)/);
    let searchPattern = `(${escapedBaseName})|(${escapedFullName})`;
    
    if (acronymMatch && acronymMatch[1]) {
      const escapedAcronym = acronymMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchPattern += `|(${escapedAcronym})`;
    }

    const students = await User.find({ 
      university: { $regex: new RegExp(searchPattern, 'i') } 
    }).select('name profilePic bio university interests year createdAt').sort({ createdAt: -1 });
    
    // Find ALL posts by students of this university
    const posts = await Post.find({ 
      university: { $regex: new RegExp(searchPattern, 'i') } 
    })
      .populate('author', 'name profilePic university')
      .sort({ createdAt: -1 });

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

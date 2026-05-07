import express from 'express';
import Story from '../models/Story.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/stories
// @desc    Create a new story
router.post('/', protect, async (req, res) => {
  try {
    const { mediaUrl, mediaType, caption } = req.body;
    
    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL is required' });
    }

    const story = await Story.create({
      author: req.user._id,
      university: req.user.university,
      mediaUrl,
      mediaType: mediaType || 'image',
      caption: caption || ''
    });

    const populatedStory = await Story.findById(story._id).populate('author', 'name profilePic');
    res.status(201).json(populatedStory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/stories
// @desc    Get all active stories for the user's university
router.get('/', protect, async (req, res) => {
  try {
    const stories = await Story.find({
      university: req.user.university,
      expiresAt: { $gt: new Date() }
    })
    .populate('author', 'name profilePic')
    .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/stories/me
// @desc    Get current user's active stories
router.get('/me', protect, async (req, res) => {
  try {
    const stories = await Story.find({
      author: req.user._id,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/stories/:id
// @desc    Delete a story
router.delete('/:id', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    if (story.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await story.remove();
    res.json({ message: 'Story removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

import express from 'express';
import Story from '../models/Story.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';
import { awardXP } from '../services/xpService.js';

const router = express.Router();

// @route   PUT /api/stories/:id/like
// @desc    Like or unlike a story
router.put('/:id/like', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    // Check if the story is already liked by the user
    if (story.likes.includes(req.user._id)) {
      // Unlike
      story.likes = story.likes.filter(id => id.toString() !== req.user._id.toString());
      // Remove notification if unliked
      await Notification.findOneAndDelete({
        sender: req.user._id,
        recipient: story.author,
        story: story._id,
        type: 'story_like'
      });
    } else {
      // Like
      story.likes.push(req.user._id);
      
      // Create notification
      if (story.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: story.author,
          sender: req.user._id,
          type: 'story_like',
          story: story._id,
          text: 'liked your story'
        });
      }
    }

    await story.save();
    res.json(story.likes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

    await awardXP(req.user._id, 'CREATE_STORY', story._id.toString());

    const populatedStory = await Story.findById(story._id).populate('author', 'name profilePic isVerified xp points currentTick');
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
    .populate('author', 'name profilePic isVerified xp points currentTick')
    .sort({ createdAt: -1 })
    .lean();

    // Convert ObjectId arrays to strings for easy frontend comparison
    const normalized = stories.map(s => ({
      ...s,
      _id: s._id.toString(),
      author: { ...s.author, _id: s.author._id.toString() },
      likes: (s.likes || []).map(id => id.toString()),
    }));

    res.json(normalized);
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

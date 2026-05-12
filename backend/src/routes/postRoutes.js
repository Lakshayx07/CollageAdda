import express from 'express';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { protect, verified } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (university feed)
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find({ university: req.user.university })
      .populate('author', 'name profilePic university followers following')
      .sort({ createdAt: -1 })
      .limit(30);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/trending
// @desc    Get trending hashtags in the university
router.get('/trending', protect, async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trending = await Post.aggregate([
      { $match: { university: req.user.university, createdAt: { $gte: yesterday } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(trending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a post
router.post('/', protect, verified, async (req, res) => {
  const { content, mediaUrl, mediaType, poll } = req.body;
  
  // Extract hashtags from content
  const hashtags = content.match(/#[\w\u0590-\u05ff]+/g) || [];

  try {
    const post = await Post.create({
      author: req.user._id,
      university: req.user.university,
      content,
      mediaUrl,
      mediaType,
      hashtags: hashtags.map(tag => tag.toLowerCase()),
      poll: poll || undefined
    });
    
    const populated = await post.populate('author', 'name profilePic university');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/vote
// @desc    Vote in a poll
router.post('/:id/vote', protect, verified, async (req, res) => {
  const { optionIndex } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.poll) return res.status(404).json({ message: 'Poll not found' });

    const userId = req.user._id;

    if (post.poll.allowMultiple) {
      // Toggle vote for this specific option
      const option = post.poll.options[optionIndex];
      const hasVoted = option.votes.includes(userId);
      
      if (hasVoted) {
        option.votes = option.votes.filter(v => v.toString() !== userId.toString());
      } else {
        option.votes.push(userId);
      }
    } else {
      // Single choice logic
      const alreadyVotedAny = post.poll.options.some(opt => opt.votes.includes(userId));
      
      if (alreadyVotedAny) {
        // If already voted, check if it's the same option to toggle/unvote
        const currentlyVotedIdx = post.poll.options.findIndex(opt => opt.votes.includes(userId));
        if (currentlyVotedIdx === optionIndex) {
          post.poll.options[optionIndex].votes = post.poll.options[optionIndex].votes.filter(v => v.toString() !== userId.toString());
        } else {
          return res.status(400).json({ message: 'You can only vote for one option' });
        }
      } else {
        post.poll.options[optionIndex].votes.push(userId);
      }
    }

    await post.save();
    res.json(post.poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Toggle like on a post
router.put('/:id/like', protect, verified, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const alreadyLiked = post.likes.includes(req.user._id);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    // Notification for like
    if (!alreadyLiked && post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id,
        text: 'liked your post'
      });
    }

    res.json({ likes: post.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
router.post('/:id/comment', protect, verified, async (req, res) => {
  const { text } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    // Notification for comment
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: 'commented on your post'
      });
    }

    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
router.delete('/:id', protect, verified, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check ownership
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

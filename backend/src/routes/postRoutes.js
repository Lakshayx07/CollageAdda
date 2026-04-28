import express from 'express';
import Post from '../models/Post.js';
import { protect, verified } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (university feed)
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find({ university: req.user.university })
      .populate('author', 'name profilePic university')
      .sort({ createdAt: -1 })
      .limit(30);
    
    // If post is anonymous, hide author details from response
    const sanitizedPosts = posts.map(post => {
      if (post.isAnonymous) {
        const p = post.toObject();
        p.author = { name: 'Anonymous Student', profilePic: '', university: p.university };
        return p;
      }
      return post;
    });

    res.json(sanitizedPosts);
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
  const { content, mediaUrl, mediaType, isAnonymous, poll } = req.body;
  
  // Extract hashtags from content
  const hashtags = content.match(/#[\w\u0590-\u05ff]+/g) || [];

  try {
    const post = await Post.create({
      author: req.user._id,
      university: req.user.university,
      content,
      mediaUrl,
      mediaType,
      isAnonymous,
      hashtags: hashtags.map(tag => tag.toLowerCase()),
      poll: poll || undefined
    });
    
    let populated = await post.populate('author', 'name profilePic university');
    
    if (isAnonymous) {
      const p = populated.toObject();
      p.author = { name: 'Anonymous Student', profilePic: '', university: p.university };
      populated = p;
    }

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

    // Check if user already voted in any option
    const alreadyVoted = post.poll.options.some(opt => opt.votes.includes(req.user._id));
    if (alreadyVoted) return res.status(400).json({ message: 'You have already voted' });

    post.poll.options[optionIndex].votes.push(req.user._id);
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
    res.status(201).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

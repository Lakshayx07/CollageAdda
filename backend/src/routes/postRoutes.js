import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (university feed)
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find({ university: req.user.university })
      .populate('author', 'name profilePic university')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/posts
// @desc    Create a post
router.post('/', protect, async (req, res) => {
  const { content, mediaUrl, mediaType } = req.body;
  try {
    const post = await Post.create({
      author: req.user._id,
      university: req.user.university,
      content,
      mediaUrl,
      mediaType,
    });
    const populated = await post.populate('author', 'name profilePic university');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Toggle like on a post
router.put('/:id/like', protect, async (req, res) => {
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
router.post('/:id/comment', protect, async (req, res) => {
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

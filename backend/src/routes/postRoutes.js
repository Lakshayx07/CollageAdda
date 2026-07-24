import express from 'express';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';
import { protect, verified } from '../middleware/authMiddleware.js';
import { slimPost, slimComments } from '../utils/postSerialize.js';
import { awardXP } from '../services/xpService.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get university feed with pagination (lean payloads)
// @query   author — optional user id to return only that author's posts
router.get('/', protect, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const requestedLimit = parseInt(req.query.limit, 10) || 12;
    const limit = Math.min(Math.max(requestedLimit, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.author) {
      filter.author = req.query.author;
    }

    const posts = await Post.find(filter)
      .select('content mediaType hashtags university createdAt updatedAt author likes comments poll')
      .populate('author', 'name university isVerified xp points currentTick')
      .populate('comments.user', 'name isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(posts.map((post) => slimPost(post, req.user._id)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/posts/:id/media
// @desc    Serve inline base64 post media without embedding it in the feed JSON
// Public like avatars so <img>/<video> tags can load without Authorization headers.
router.get('/:id/media', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).select('mediaUrl').lean();
    if (!post || !post.mediaUrl) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (post.mediaUrl.startsWith('http')) {
      return res.redirect(post.mediaUrl);
    }

    if (post.mediaUrl.startsWith('data:')) {
      const match = post.mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return res.status(400).json({ message: 'Invalid media data' });
      const mime = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }

    return res.status(400).json({ message: 'Unsupported media format' });
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
  const hashtags = content ? (content.match(/#[\w\u0590-\u05ff]+/g) || []) : [];

  try {
    const post = await Post.create({
      author: req.user._id,
      university: req.user.university,
      content,
      mediaUrl,
      mediaType,
      hashtags: hashtags.map((tag) => tag.toLowerCase()),
      poll: poll && poll.options && poll.options.length > 0 ? poll : undefined
    });

    await awardXP(req.user._id, 'CREATE_POST', post._id.toString());

    const populated = await Post.findById(post._id)
      .select('content mediaUrl mediaType hashtags university createdAt updatedAt author likes comments poll')
      .populate('author', 'name university isVerified xp points currentTick')
      .populate('comments.user', 'name')
      .lean();

    res.status(201).json(slimPost(populated, req.user._id));
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
      const option = post.poll.options[optionIndex];
      if (!option) return res.status(400).json({ message: 'Invalid option' });
      const hasVoted = option.votes.includes(userId);

      if (hasVoted) {
        option.votes = option.votes.filter((v) => v.toString() !== userId.toString());
      } else {
        option.votes.push(userId);
      }
    } else {
      const currentlyVotedIdx = post.poll.options.findIndex((opt) => opt.votes.includes(userId));
      if (currentlyVotedIdx === optionIndex) {
        post.poll.options[optionIndex].votes = post.poll.options[optionIndex].votes.filter(
          (v) => v.toString() !== userId.toString()
        );
      } else if (currentlyVotedIdx >= 0) {
        return res.status(400).json({ message: 'You can only vote for one option' });
      } else {
        post.poll.options[optionIndex].votes.push(userId);
      }
    }

    await post.save();
    res.json(slimPoll(post.poll, userId));
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
      await awardXP(post.author.toString(), 'LIKE_POST', `like_${req.user._id}_${post._id}`);
    }
    await post.save();

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

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        text: 'commented on your post'
      });
    }

    await awardXP(req.user._id, 'COMMENT_POST', `comment_${post.comments[post.comments.length - 1]._id.toString()}`);

    await post.populate('comments.user', 'name');
    res.status(201).json(slimComments(post.comments));
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

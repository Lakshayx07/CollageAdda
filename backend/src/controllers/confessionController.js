import Confession from '../models/Confession.js';

export const getConfessions = async (req, res) => {
  try {
    // Sort by heat (highest first), then by newest
    const confessions = await Confession.find().sort({ heat: -1, createdAt: -1 });
    res.json(confessions);
  } catch (error) {
    console.error('Error in getConfessions:', error);
    res.status(500).json({ message: 'Server error fetching confessions' });
  }
};

export const createConfession = async (req, res) => {
  try {
    const { text, gradient } = req.body;
    const user = req.user; // from auth middleware
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Confession text is required' });
    }

    const confession = new Confession({
      text: text.trim(),
      college: user.university || 'Unknown Campus',
      gradient: gradient || 'from-orange-500 via-rose-500 to-purple-600',
      likes: [],
      comments: []
    });

    await confession.save();
    res.status(201).json(confession);
  } catch (error) {
    console.error('Error in createConfession:', error);
    res.status(500).json({ message: 'Server error creating confession' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    const likeIndex = confession.likes.indexOf(userId);
    if (likeIndex === -1) {
      confession.likes.push(userId);
    } else {
      confession.likes.splice(likeIndex, 1);
    }

    await confession.save();
    res.json(confession);
  } catch (error) {
    console.error('Error in toggleLikeConfession:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    confession.comments.push({ text: text.trim() });
    await confession.save();
    
    res.status(201).json(confession);
  } catch (error) {
    console.error('Error in addComment to confession:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
};

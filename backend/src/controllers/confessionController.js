import Confession from '../models/Confession.js';

// Rotating hyper-local prompts
const DAILY_PROMPTS = [
  "What is the unwritten rule of the night canteen?",
  "Wrong answers only: why was the professor late today?",
  "Best nap spot on campus nobody talks about?",
  "The most cursed exam question you've ever seen?",
  "Hot take: which campus building should be demolished first?",
  "Name a campus trend that needs to die immediately.",
  "What does the library WiFi password symbolize about this place?",
  "Describe your department in three words (be honest).",
  "What's the secret handshake between seniors here?",
  "Rate your campus food: 1 being 'academic research material' to 10."
];

export const getPrompts = (req, res) => {
  res.json(DAILY_PROMPTS);
};

export const getConfessions = async (req, res) => {
  try {
    const { scope = 'local' } = req.query;

    const filter = {};
    if (scope === 'local') {
      filter.college = req.user.university;
    }
    // scope === 'global' returns all confessions

    // Filter out heavily reported content (>5 reports)
    filter.$or = [
      { reports: { $size: 0 } },
      { $expr: { $lt: [{ $size: '$reports' }, 5] } }
    ];

    const confessions = await Confession.find(filter).sort({ heat: -1, createdAt: -1 });
    res.json(confessions);
  } catch (error) {
    console.error('Error in getConfessions:', error);
    res.status(500).json({ message: 'Server error fetching confessions' });
  }
};

export const createConfession = async (req, res) => {
  try {
    const { text, gradient } = req.body;
    const user = req.user;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Confession text is required' });
    }
    if (text.trim().length < 10) {
      return res.status(400).json({ message: 'Confession too short. Add more context!' });
    }

    const confession = new Confession({
      text: text.trim(),
      college: user.university || 'Unknown Campus',
      gradient: gradient || 'from-orange-500 via-rose-500 to-purple-600',
      likes: [],
      comments: [],
      reports: []
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

    const likeIndex = confession.likes.findIndex(l => l.toString() === userId.toString());
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

export const reportConfession = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ message: 'Confession not found' });
    }

    const alreadyReported = confession.reports.some(r => r.toString() === userId.toString());
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this confession' });
    }

    confession.reports.push(userId);
    await confession.save();

    res.json({ message: 'Reported. Thank you for keeping the campus safe.' });
  } catch (error) {
    console.error('Error in reportConfession:', error);
    res.status(500).json({ message: 'Server error reporting confession' });
  }
};

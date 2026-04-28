import User from '../models/User.js';

// @desc    Get potential matches for the user
// @route   GET /api/matches
// @access  Private
export const getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Exclude current user, already connected users, and skipped users
    const excludeIds = [
      currentUser._id,
      ...(currentUser.connectedUsers || []),
      ...(currentUser.skippedUsers || [])
    ];

    // Advanced Matching Algorithm: "Vibe-Score"
    const users = await User.find({
      _id: { $nin: excludeIds },
      isVerified: true // Only match with verified students
    }).select('-password -email').limit(50);

    const scoredMatches = users.map(user => {
      let score = 0;
      
      // 1. Shared Interests (+40 max)
      const commonInterests = user.interests.filter(i => currentUser.interests.includes(i));
      score += Math.min(commonInterests.length * 15, 40);

      // 2. Shared Goals (+30 max)
      const commonGoals = user.goals.filter(g => currentUser.goals.includes(g));
      score += Math.min(commonGoals.length * 15, 30);

      // 3. Same University (+15)
      if (user.university === currentUser.university) score += 15;

      // 4. Same Year (+15)
      if (user.year === currentUser.year) score += 15;

      return { 
        ...user.toObject(), 
        matchScore: score,
        commonInterests 
      };
    });

    // Sort by score and limit to top 20
    const sortedMatches = scoredMatches
      .filter(m => m.matchScore > 10) // Filter out low quality matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
    
    res.json(sortedMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Connect with a user
// @route   POST /api/matches/connect/:id
// @access  Private
export const connectUser = async (req, res) => {
  try {
    const userToConnect = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToConnect) {
      return res.status(404).json({ message: 'User to connect not found' });
    }

    if (currentUser.connectedUsers.includes(userToConnect._id)) {
      return res.status(400).json({ message: 'Already connected' });
    }

    currentUser.connectedUsers.push(userToConnect._id);
    await currentUser.save();

    res.json({ message: `Successfully connected with ${userToConnect.name}!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Skip a user
// @route   POST /api/matches/skip/:id
// @access  Private
export const skipUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser.skippedUsers.includes(req.params.id)) {
      currentUser.skippedUsers.push(req.params.id);
      await currentUser.save();
    }

    res.json({ message: 'User skipped' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

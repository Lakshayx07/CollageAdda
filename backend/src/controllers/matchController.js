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

    // Simple matching algorithm:
    // Find users who have at least one common interest or goal
    const matches = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { interests: { $in: currentUser.interests || [] } },
        { goals: { $in: currentUser.goals || [] } }
      ]
    }).select('-password').limit(20);

    // Sort matches by number of common interests/goals (optional enhancement)
    // For now, we return the list as is.
    
    res.json(matches);
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

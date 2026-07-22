import express from 'express';
import Collab from '../models/Collab.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/collab - Get collab cards (local only by default)
router.get('/', protect, async (req, res) => {
  try {
    const me = req.user._id;
    // Show collab requests from same university, not authored by current user
    const cards = await Collab.find({
      university: req.user.university,
      author: { $ne: me }
    })
      .populate('author', 'name profilePic university year isVerified xp points currentTick')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/collab - Create a collab request card
router.post('/', protect, async (req, res) => {
  try {
    const { skillset, building, yearMajor, projectType, rolesNeeded, urgency, description } = req.body;

    if (!skillset || !building || !yearMajor) {
      return res.status(400).json({ message: 'Skillset, project idea, and class year are required.' });
    }

    const card = await Collab.create({
      author: req.user._id,
      university: req.user.university,
      skillset,
      building,
      yearMajor,
      projectType: projectType || 'Side Project',
      rolesNeeded: rolesNeeded || [],
      urgency: urgency || 'Medium',
      description: description || ''
    });

    const populated = await card.populate('author', 'name profilePic university year isVerified xp points currentTick');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/collab/:id/interest - Express interest (swipe right)
router.put('/:id/interest', protect, async (req, res) => {
  try {
    const card = await Collab.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Collab card not found' });

    const userId = req.user._id;
    if (!card.interests.includes(userId)) {
      card.interests.push(userId);
      await card.save();
    }
    res.json({ message: 'Interest registered! The poster can now reach out to you.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/collab/:id - Delete your own collab card
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Collab.findById(req.params.id);
    if (!card) return res.status(404).json({ message: 'Collab card not found' });
    if (card.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await card.deleteOne();
    res.json({ message: 'Collab card removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

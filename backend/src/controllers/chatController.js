import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @desc    Get user's chat rooms
 * @route   GET /api/chat/rooms
 * @access  Private
 */
export const getRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ participants: req.user._id })
      .populate('participants', 'name profilePic university')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get messages for a room
 * @route   GET /api/chat/rooms/:id/messages
 * @access  Private
 */
export const getMessages = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  try {
    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Mark messages as seen
 * @route   PUT /api/chat/rooms/:id/seen
 * @access  Private
 */
export const markAsSeen = async (req, res) => {
  try {
    await Message.updateMany(
      { room: req.params.id, 'seenBy.user': { $ne: req.user._id } },
      { $push: { seenBy: { user: req.user._id } } }
    );
    
    // Reset unread count for this user in the room
    const room = await ChatRoom.findById(req.params.id);
    if (room) {
      room.unreadCounts.set(req.user._id.toString(), 0);
      await room.save();
    }

    res.json({ message: 'Messages marked as seen' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get or create a private room or create a group room
 * @route   POST /api/chat/rooms
 * @access  Private
 */
export const getOrCreatePrivateRoom = async (req, res) => {
  const { targetUserId, participantId, isGroup, groupName, participantIds } = req.body;
  const target = targetUserId || participantId;

  try {
    if (isGroup) {
      if (!groupName || !participantIds || participantIds.length === 0) {
        return res.status(400).json({ message: 'Group name and participants are required' });
      }
      const room = await ChatRoom.create({
        participants: [req.user._id, ...participantIds],
        isGroup: true,
        groupName: groupName
      });
      const populatedRoom = await ChatRoom.findById(room._id).populate('participants', 'name profilePic university');
      return res.status(201).json(populatedRoom);
    }

    // Private Room Logic
    if (!target) return res.status(400).json({ message: 'Target user ID is required for private rooms' });

    let room = await ChatRoom.findOne({
      isGroup: false,
      participants: { $all: [req.user._id, target] }
    }).populate('participants', 'name profilePic university');

    if (!room) {
      room = await ChatRoom.create({
        participants: [req.user._id, target],
        isGroup: false
      });
      room = await ChatRoom.findById(room._id).populate('participants', 'name profilePic university');
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a message via HTTP
export const sendMessage = async (req, res) => {
  const { text, mediaUrl, mediaType } = req.body;
  const roomId = req.params.id;

  try {
    const room = await ChatRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      text: text || '',
      mediaUrl,
      mediaType: mediaType || 'none'
    });

    // Update last message in room and unread counts
    room.lastMessage = message._id;
    room.participants.forEach(pId => {
      if (pId.toString() !== req.user._id.toString()) {
        const current = room.unreadCounts.get(pId.toString()) || 0;
        room.unreadCounts.set(pId.toString(), current + 1);
      }
    });
    await room.save();

    // Create notification for private messages
    if (!room.isGroup) {
      const recipient = room.participants.find(p => p.toString() !== req.user._id.toString());
      if (recipient) {
        await Notification.create({
          recipient: recipient,
          sender: req.user._id,
          type: 'message',
          chatRoom: room._id,
          text: 'sent you a message'
        });
      }
    }

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name profilePic');
    res.status(201).json(populatedMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Leave a room
 * @route   PUT /api/chat/rooms/:id/leave
 * @access  Private
 */
export const leaveRoom = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Remove user from participants
    room.participants = room.participants.filter(p => p.toString() !== req.user._id.toString());
    
    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add member to a room
 * @route   PUT /api/chat/rooms/:id/add
 * @access  Private
 */
export const addMember = async (req, res) => {
  const { participantId } = req.body;
  try {
    const room = await ChatRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.participants.includes(participantId)) {
      return res.status(400).json({ message: 'User already in room' });
    }

    room.participants.push(participantId);
    
    await room.save();

    const populatedRoom = await ChatRoom.findById(room._id).populate('participants', 'name profilePic university');
    res.json({ message: 'Member added successfully', room: populatedRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

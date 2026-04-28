import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Message from './models/Message.js';
import ChatRoom from './models/ChatRoom.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CollageAdda Backend is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/chat', chatRoutes);

// ── Socket.io Real-time Chat ──────────────────────────────────────────────────
const onlineUsers = new Map(); // socketId → { userId, name, university }

io.on('connection', (socket) => {
  console.log(`[WS] User connected: ${socket.id}`);

  // User comes online
  socket.on('user_online', ({ userId, name, university }) => {
    onlineUsers.set(socket.id, { userId, name, university });
    // Join their university room automatically
    socket.join(university);
    io.emit('online_users', Array.from(onlineUsers.values()));
    console.log(`[WS] ${name} joined room: ${university}`);
  });

  // Join a specific chat room (university or DM)
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[WS] ${socket.id} joined room: ${room}`);
  });

  // Send a message to a room
  socket.on('send_message', async (data) => {
    // data: { room, senderId, senderName, text, mediaUrl, mediaType }
    try {
      const message = await Message.create({
        room: data.room,
        sender: data.senderId,
        text: data.text,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType || 'none'
      });

      // Update room's last message and timestamps
      await ChatRoom.findByIdAndUpdate(data.room, { 
        lastMessage: message._id,
        $set: { updatedAt: Date.now() }
      });

      io.to(data.room).emit('receive_message', {
        ...data,
        _id: message._id,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error('[WS] Error saving message:', err);
    }
  });

  // Seen status
  socket.on('message_seen', async ({ roomId, userId, messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { seenBy: { user: userId, seenAt: Date.now() } }
      });
      socket.to(roomId).emit('user_seen', { messageId, userId });
    } catch (err) {
      console.error('[WS] Error updating seen status:', err);
    }
  });

  // Typing indicators
  socket.on('typing', ({ room, name }) => {
    socket.to(room).emit('user_typing', { name });
  });

  socket.on('stop_typing', ({ room }) => {
    socket.to(room).emit('user_stop_typing');
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      console.log(`[WS] ${user.name} disconnected`);
      onlineUsers.delete(socket.id);
      io.emit('online_users', Array.from(onlineUsers.values()));
    }
  });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 CollageAdda server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

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
import collegeRoutes from './routes/collegeRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import hustleRoutes from './routes/hustleRoutes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
// Allow multiple frontend origins (local, Render, Vercel)
const allowedOrigins = [
  'http://localhost:3000',
  'https://campus-adda-frontend.onrender.com',
  'https://collage-adda.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(httpServer, { cors: corsOptions });

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CollegeAdda Backend is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hustle', hustleRoutes);

// ── Socket.io Real-time Chat ──────────────────────────────────────────────────
const onlineUsers = new Map(); // socketId → { userId, name, university }

io.on('connection', (socket) => {
  console.log(`[WS] User connected: ${socket.id}`);

  // User comes online
  socket.on('user_online', ({ userId, name, university }) => {
    onlineUsers.set(socket.id, { userId, name, university });
    // Join their university room automatically
    socket.join(university);
    // Join a private room for the user to receive targeted messages
    socket.join(userId.toString());
    io.emit('online_users', Array.from(onlineUsers.values()));
    console.log(`[WS] ${name} joined private room: ${userId}`);
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
      console.log(`[WS] Message from ${data.senderName} in room ${data.room}`);
      
      const message = await Message.create({
        room: data.room,
        sender: data.senderId,
        text: data.text,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType || 'none',
        isSystem: data.isSystem || false
      });

      // Update room's last message, timestamps and unread counts
      const room = await ChatRoom.findById(data.room);
      if (room) {
        room.lastMessage = message._id;
        room.updatedAt = Date.now();
        
        // Prepare delivery data
        const deliveryData = {
          ...data,
          _id: message._id,
          createdAt: message.createdAt,
        };

        // Emit to the room (for people actively viewing the chat)
        io.to(data.room).emit('receive_message', deliveryData);

        // Also emit to each participant's private room (for notifications/unread updates)
        room.participants.forEach(pId => {
          const participantId = pId.toString();
          // We send to everyone including sender (for confirmation) or just others?
          // The frontend replaces tempId, so it needs the message back.
          if (participantId !== data.senderId.toString()) {
            const current = room.unreadCounts.get(participantId) || 0;
            room.unreadCounts.set(participantId, current + 1);
            
            // Deliver to the participant's individual room
            console.log(`[WS] Delivering to participant room: ${participantId}`);
            io.to(participantId).emit('receive_message', deliveryData);
          }
        });
        await room.save();
      } else {
        console.error(`[WS] Room not found: ${data.room}`);
      }
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
  console.log(`\n🚀 CollegeAdda server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

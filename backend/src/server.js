import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import verifyRoutes from './routes/verifyRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import Message from './models/Message.js';
import ChatRoom from './models/ChatRoom.js';
import User from './models/User.js';
import collegeRoutes from './routes/collegeRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import hustleRoutes from './routes/hustleRoutes.js';
import confessionRoutes from './routes/confessionRoutes.js';
import collabRoutes from './routes/collabRoutes.js';

connectDB();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://campus-adda-frontend.onrender.com',
  'https://collage-adda.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Reject requests with no origin (server-to-server or curl) in production
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('CORS: origin required in production'));
      }
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};

const io = new Server(httpServer, { cors: corsOptions });

// ── Socket.io JWT authentication middleware ───────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name university').lean();
    if (!user) return next(new Error('User not found'));

    socket.userId = user._id.toString();
    socket.userName = user.name;
    socket.userUniversity = user.university;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

// Middleware
app.use(helmet({
  crossOriginOpenerPolicy: false, // managed by Next.js for Google OAuth
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Cache-Control Middleware
app.use((req, res, next) => {
  if (req.path === '/api/colleges' || req.path.startsWith('/api/colleges/public')) {
    res.setHeader('Cache-Control', 'public, max-age=300');
  } else if (req.path === '/api/users/leaderboard') {
    res.setHeader('Cache-Control', 'public, max-age=60');
  } else {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  }
  next();
});

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/verify', otpLimiter, verifyRoutes);
app.use('/api/posts', apiLimiter, postRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/matches', apiLimiter, matchRoutes);
app.use('/api/chat', apiLimiter, chatRoutes);
app.use('/api/colleges', apiLimiter, collegeRoutes);
app.use('/api/stories', apiLimiter, storyRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/hustle', apiLimiter, hustleRoutes);
app.use('/api/confessions', apiLimiter, confessionRoutes);
app.use('/api/collab', apiLimiter, collabRoutes);

// ── Socket.io Real-time Chat ──────────────────────────────────────────────────
const onlineUsers = new Map(); // socketId → { userId, name, university }

io.on('connection', (socket) => {
  // socket.userId / socket.userName / socket.userUniversity are set by auth middleware

  socket.on('user_online', () => {
    onlineUsers.set(socket.id, {
      userId: socket.userId,
      name: socket.userName,
      university: socket.userUniversity,
    });
    socket.join(socket.userUniversity);
    socket.join(socket.userId);
    io.emit('online_users', Array.from(onlineUsers.values()));
  });

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
  });

  socket.on('send_message', async (data) => {
    try {
      const message = await Message.create({
        room: data.room,
        sender: socket.userId,          // use verified identity, not client-supplied
        text: data.text,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType || 'none',
        isSystem: data.isSystem || false
      });

      const room = await ChatRoom.findById(data.room);
      if (room) {
        room.lastMessage = message._id;
        room.updatedAt = Date.now();

        const deliveryData = {
          ...data,
          senderId: socket.userId,      // override client-supplied senderId
          _id: message._id,
          createdAt: message.createdAt,
        };

        io.to(data.room).emit('receive_message', deliveryData);

        room.participants.forEach(pId => {
          const participantId = pId.toString();
          if (participantId !== socket.userId) {
            const current = room.unreadCounts.get(participantId) || 0;
            room.unreadCounts.set(participantId, current + 1);
            io.to(participantId).emit('receive_message', deliveryData);
          }
        });
        await room.save();
      }
    } catch (err) {
      console.error('[WS] Error saving message:', err);
    }
  });

  socket.on('forward_message', async (data) => {
    try {
      const safeData = { ...data, senderId: socket.userId };
      io.to(data.room).emit('receive_message', safeData);

      const room = await ChatRoom.findById(data.room);
      if (room) {
        room.participants.forEach(pId => {
          const participantId = pId.toString();
          if (participantId !== socket.userId) {
            io.to(participantId).emit('receive_message', safeData);
          }
        });
      }
    } catch (err) {
      console.error('[WS] Error forwarding message:', err);
    }
  });

  socket.on('message_seen', async ({ roomId, messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { seenBy: { user: socket.userId, seenAt: Date.now() } }
      });
      socket.to(roomId).emit('user_seen', { messageId, userId: socket.userId });
    } catch (err) {
      console.error('[WS] Error updating seen status:', err);
    }
  });

  socket.on('typing', ({ room, name }) => {
    socket.to(room).emit('user_typing', { name: socket.userName });
  });

  socket.on('stop_typing', ({ room }) => {
    socket.to(room).emit('user_stop_typing');
  });

  socket.on('message_updated', ({ room, message }) => {
    socket.to(room).emit('message_updated', { room, message });
  });

  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      io.emit('online_users', Array.from(onlineUsers.values()));
    }
  });
});

const PORT = process.env.PORT || 5001;
const server = httpServer.listen(PORT, () => {
  console.log(`\n CollegeAdda server running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

server.keepAliveTimeout = 61000;
server.headersTimeout = 65000;

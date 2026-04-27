# CollageAdda 🎓

> A student-first social & study collaboration platform — built for Gen-Z, by Gen-Z.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Socket.io-client |
| Backend | Node.js + Express, Socket.io, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (bcryptjs) |
| Media | Cloudinary + Multer |

## Project Structure

```
CollageAdda/
├── frontend/          # Vite + React app
│   └── src/
│       ├── context/   # AuthContext
│       └── pages/     # Splash, Auth, Feed, Chat, Study
└── backend/           # Express + Socket.io API
    └── src/
        ├── config/    # DB connection
        ├── middleware/ # JWT auth guard
        ├── models/    # User, Post, Message
        └── routes/    # Auth, Post API routes
```

## Quick Start

### 1. Backend
```bash
cd backend
cp .env.example .env      # Fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # Starts on http://localhost:5001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev               # Starts on http://localhost:5173
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/posts` | Get university feed |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id/like` | Toggle like |
| POST | `/api/posts/:id/comment` | Add comment |
| GET | `/api/health` | Server health check |

## Pages

- `/` — Splash / landing
- `/auth` — Login & register with university selection
- `/feed` — Social feed (stories, posts, likes, comments)
- `/chat` — Real-time university chat rooms (Socket.io)
- `/study` — Study Hub (shared notes, study groups, flashcards)

## Socket.io Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `user_online` | Client → Server | Announce user online |
| `join_room` | Client → Server | Join a chat room |
| `send_message` | Client → Server | Send chat message |
| `receive_message` | Server → Client | Broadcast message |
| `typing` | Client → Server | Typing indicator |
| `user_typing` | Server → Client | Show typing bubble |
| `online_users` | Server → Client | Online user list |

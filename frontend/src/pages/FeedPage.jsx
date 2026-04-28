import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Image, Smile, Plus, Zap } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';

const DUMMY_POSTS = [
  { id: 1, author: 'Aarav Sharma', university: 'Rishihood University', time: '2h ago', content: 'Just finished the finals! Finally some peace ✌️', likes: 124, comments: 12, isLiked: false, isBookmarked: false },
  { id: 2, author: 'Priya Patel', university: 'Rishihood University', time: '5h ago', content: 'Anyone forming a study group for Data Structures? Drop a comment!', likes: 45, comments: 28, isLiked: true, isBookmarked: false },
  { id: 3, author: 'Rohan Gupta', university: 'Rishihood University', time: '1d ago', content: 'The campus cafe just launched a new menu and it is literally the best thing ever ☕🍕', likes: 210, comments: 45, isLiked: false, isBookmarked: true },
  { id: 4, author: 'Aditi Verma', university: 'Rishihood University', time: '3h ago', content: "Petition to make the library open 24/7 during exam week 📚 Who's with me?", likes: 389, comments: 67, isLiked: false, isBookmarked: false },
];

export default function FeedPage() {
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [newPost, setNewPost] = useState('');
  const [showCommentId, setShowCommentId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { showToast } = useToast();

  const toggleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const nowLiked = !post.isLiked;
        if (nowLiked) showToast('❤️ Post liked!', 'success');
        return { ...post, isLiked: nowLiked, likes: nowLiked ? post.likes + 1 : post.likes - 1 };
      }
      return post;
    }));
  };

  const toggleBookmark = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        const nowBookmarked = !post.isBookmarked;
        if (nowBookmarked) showToast('🔖 Post saved!', 'info');
        return { ...post, isBookmarked: nowBookmarked };
      }
      return post;
    }));
  };

  const handleShare = (post) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`Check out this post on CollageAdda: "${post.content.slice(0, 60)}..."`);
      showToast('🔗 Link copied to clipboard!', 'success');
    } else {
      showToast('🔗 Share link copied!', 'info');
    }
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: Date.now(),
      author: 'You',
      university: 'Rishihood University',
      time: 'Just now',
      content: newPost.trim(),
      likes: 0,
      comments: 0,
      isLiked: false,
      isBookmarked: false,
    };
    setPosts([post, ...posts]);
    setNewPost('');
    showToast('🎉 Post shared to your campus!', 'success');
  };

  const handleComment = (postId) => {
    if (!commentText.trim()) return;
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setCommentText('');
    setShowCommentId(null);
    showToast('💬 Comment posted!', 'success');
  };

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen pb-24 md:pb-8 md:pt-6">
        <div className="max-w-2xl mx-auto px-4 space-y-5">

          {/* Create Post */}
          <div className="glass p-4 rounded-2xl border border-gray-800/50 mt-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                Me
              </div>
              <input
                type="text"
                id="new-post-input"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                placeholder="What's happening on campus?"
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm outline-none"
              />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800/50">
              <div className="flex space-x-3">
                <button
                  onClick={() => showToast('📸 Photo upload coming soon!', 'info')}
                  className="flex items-center space-x-1.5 text-gray-500 hover:text-primary transition-colors text-xs"
                >
                  <Image size={16} />
                  <span>Photo</span>
                </button>
                <button
                  onClick={() => showToast('😊 Emoji picker coming soon!', 'info')}
                  className="flex items-center space-x-1.5 text-gray-500 hover:text-yellow-400 transition-colors text-xs"
                >
                  <Smile size={16} />
                  <span>Feeling</span>
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                id="post-btn"
                className="text-sm font-semibold px-5 py-1.5 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all"
              >
                Post
              </button>
            </div>
          </div>

          {/* Top Navigation - Communities (Reddit Style) */}
          <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-2">
            {['All', 'Study Hub', 'Campus Life', 'Tech', 'Music', 'Sports', 'Startup'].map((community, i) => (
              <button
                key={i}
                onClick={() => showToast(`Switching to ${community}...`, 'info')}
                className={`px-5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border
                  ${i === 0 
                    ? 'bg-primary text-white border-primary glow-primary scale-105' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'}`}
              >
                {community}
              </button>
            ))}
          </div>

          {/* Stories - Premium Look */}
          <div className="flex space-x-5 overflow-x-auto pb-2 no-scrollbar">
            {['You', 'Aditi', 'Kabir', 'Neha', 'Vihaan', 'Campus Events'].map((name, i) => (
              <div
                key={i}
                onClick={() => showToast(`📖 ${name}'s story`, 'info')}
                className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-3xl p-[2px] transition-all group-hover:scale-110 group-active:scale-95
                  ${i === 0 ? 'bg-gray-800' : 'bg-gradient-to-tr from-primary via-secondary to-accent'}`}>
                  <div className="w-full h-full rounded-[22px] border-2 border-background bg-dark overflow-hidden flex items-center justify-center">
                    {i === 0 ? (
                      <Plus size={24} className="text-gray-500" />
                    ) : (
                      <img src={`https://i.pravatar.cc/150?u=${name}`} alt={name} className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${i === 0 ? 'text-gray-500' : 'text-gray-300'}`}>
                  {name}
                </span>
              </div>
            ))}
          </div>

          {/* Feed Posts */}
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl border border-gray-800/50 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-800 border border-white/5 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all shadow-lg">
                      <img src={`https://i.pravatar.cc/150?u=${post.author}`} alt={post.author} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight cursor-pointer hover:text-primary transition-colors flex items-center space-x-1.5">
                        <span>{post.author}</span>
                        {post.id === 1 && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{post.time} • <span className="text-secondary">{post.university}</span></p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast('Options menu coming soon!', 'info')}
                    className="text-gray-500 hover:text-white px-2 transition-colors text-lg tracking-widest"
                  >
                    •••
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>
                </div>

                <div className="px-4 py-3 border-t border-gray-800/50 flex justify-between items-center text-gray-400">
                  <div className="flex space-x-5">
                    <button
                      id={`like-btn-${post.id}`}
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-1.5 transition-all hover:scale-110 active:scale-90 ${post.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                      <Heart size={19} className={post.isLiked ? 'fill-current' : ''} />
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => setShowCommentId(showCommentId === post.id ? null : post.id)}
                      className="flex items-center space-x-1.5 hover:text-primary transition-colors hover:scale-110 active:scale-90"
                    >
                      <MessageCircle size={19} />
                      <span className="text-sm">{post.comments}</span>
                    </button>
                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center space-x-1.5 hover:text-green-400 transition-colors hover:scale-110 active:scale-90"
                    >
                      <Share2 size={19} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleBookmark(post.id)}
                    className={`transition-all hover:scale-110 active:scale-90 ${post.isBookmarked ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                  >
                    <Bookmark size={19} className={post.isBookmarked ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Comment Box */}
                {showCommentId === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 border-t border-gray-800/50 pt-3"
                  >
                    <div className="flex space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        Me
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <input
                          autoFocus
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-gray-800/60 rounded-xl px-3 py-1.5 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary/40"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

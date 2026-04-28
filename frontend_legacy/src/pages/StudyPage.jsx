import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, FileText, Users, Plus, Search, Star, Clock, ChevronRight, Flame, Download, Share2 } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useToast, ToastContainer } from '../components/Toast';

const STUDY_NOTES = [
  { id: 1, title: 'DSA - Graphs & Trees', subject: 'Computer Science', author: 'Aarav Sharma', university: 'Rishihood', stars: 48, time: '2h ago', tag: 'Exam Prep', color: 'from-indigo-500 to-purple-500', isCoding: true, link: 'https://leetcode.com/problemset/all/', content: 'Focus on BFS vs DFS implementation. Trees are just special graphs with no cycles! Practice recursion.' },
  { id: 2, title: 'Microeconomics Chapter 4', subject: 'Economics', author: 'Priya Patel', university: 'Rishihood', stars: 31, time: '5h ago', tag: 'Notes', color: 'from-green-500 to-teal-500', content: 'Supply and demand curves. Elasticity measures responsiveness. Remember the law of diminishing returns!' },
  { id: 3, title: 'Constitutional Law Notes', subject: 'Law', author: 'Rohan Gupta', university: 'OP Jindal', stars: 62, time: '1d ago', tag: 'Summary', color: 'from-orange-500 to-red-500', content: 'Fundamental rights vs Directive principles. Case law: Kesavananda Bharati vs State of Kerala.' },
  { id: 4, title: 'Calculus: Integration Methods', subject: 'Mathematics', author: 'Neha Joshi', university: 'Rishihood', stars: 27, time: '3d ago', tag: 'Practice', color: 'from-pink-500 to-rose-500', content: 'Integration by parts formula: ∫u dv = uv - ∫v du. Substitution is key for complex fractions.' },
];

const FLASHCARDS = [
  { question: "What is a Binary Search Tree?", answer: "A tree where each node has at most two children, and the left child is smaller than the parent while the right child is larger." },
  { question: "Define 'Opportunity Cost'", answer: "The value of the next best alternative foregone when a choice is made." },
  { question: "What is BFS?", answer: "Breadth-First Search: An algorithm for traversing tree or graph data structures starting from the root and exploring all neighbor nodes at the present depth." }
];

const INITIAL_GROUPS = [
  { id: 1, name: 'DSA Prep Squad', members: 12, subject: 'Computer Science', active: true, joined: false },
  { id: 2, name: 'Econ Warriors', members: 8, subject: 'Economics', active: false, joined: false },
  { id: 3, name: 'Law Review Circle', members: 15, subject: 'Law', active: true, joined: false },
];

const TABS = ['Notes', 'Study Groups', 'Flashcards'];

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState('Notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredNotes, setStarredNotes] = useState({});
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [emailInput, setEmailInput] = useState('');
  const [viewingNote, setViewingNote] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);
  const { showToast } = useToast();

  const filteredNotes = STUDY_NOTES.filter(
    n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStarNote = (noteId, noteTitle) => {
    setStarredNotes(prev => {
      const nowStarred = !prev[noteId];
      showToast(nowStarred ? `⭐ Saved "${noteTitle}"` : `Removed from saved`, nowStarred ? 'success' : 'info');
      return { ...prev, [noteId]: nowStarred };
    });
  };

  const handleDownloadNote = (title) => showToast(`📥 Downloading "${title}"...`, 'info');
  const handleShareNote = (title) => {
    if (navigator.clipboard) navigator.clipboard.writeText(`Check out this note on CollageAdda: "${title}"`);
    showToast('🔗 Note link copied!', 'success');
  };
  const handleViewNote = (note) => {
    if (note.isCoding) {
      showToast('🚀 Redirecting to Coding Platform...', 'success');
      setTimeout(() => window.open(note.link, '_blank'), 1000);
    } else {
      setViewingNote(note);
    }
  };

  const handleJoinGroup = (groupId, name) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        if (g.joined) {
          showToast(`🚀 Entering ${name} group chat...`, 'success');
          setTimeout(() => navigate('/chat', { state: { studyGroupName: name, studyGroupSubject: g.subject } }), 800);
          return g;
        }
        const nowJoined = !g.joined;
        showToast(nowJoined ? `✅ Joined ${name}!` : `Left ${name}`, nowJoined ? 'success' : 'info');
        return { ...g, joined: nowJoined, members: nowJoined ? g.members + 1 : g.members - 1 };
      }
      return g;
    }));
  };

  const handleCreateGroup = () => showToast('🛠️ Group creation coming soon!', 'info');
  const handleShareNote2 = () => showToast('📤 Note upload UI coming soon!', 'info');
  const handleEarlyAccess = () => {
    if (!emailInput.trim()) { showToast('Please enter your email first!', 'error'); return; }
    showToast(`🎉 You're on the early access list!`, 'success');
    setEmailInput('');
  };
  const handleTrendingClick = () => {
    setActiveTab('Notes');
    setSearchQuery('DSA');
    showToast('🔥 Showing trending DSA notes', 'info');
  };

  return (
    <AppShell>
      <ToastContainer />
      <div className="min-h-screen pb-24 md:pb-8">

        {/* Header */}
        <header className="glass sticky top-0 z-40 border-b border-gray-800 px-4 md:px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Study Hub</h1>
              <p className="text-xs text-gray-500 mt-0.5">Share notes. Collaborate. Ace it. 📚</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareNote2}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-purple-600 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20"
            >
              <Plus size={15} />
              <span>Share Note</span>
            </motion.button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search notes, subjects, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass border border-gray-700/50 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Trending Banner — clickable */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTrendingClick}
            className="glass rounded-2xl p-4 border border-orange-500/20 flex items-center space-x-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
              <Flame size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-300">Trending this week</p>
              <p className="text-xs text-gray-400">DSA Finals preparation notes are 🔥 right now!</p>
            </div>
            <ChevronRight size={16} className="text-orange-400 flex-shrink-0" />
          </motion.div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-dark rounded-xl p-1 border border-gray-800">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab ? 'bg-primary/90 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">

            {/* ── NOTES ── */}
            {activeTab === 'Notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredNotes.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500 text-sm">No notes match your search.</p>
                    <button onClick={() => setSearchQuery('')} className="mt-3 text-primary text-sm hover:underline">Clear search</button>
                  </div>
                ) : filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    onClick={() => handleViewNote(note)}
                    className="glass rounded-2xl border border-gray-800/50 overflow-hidden cursor-pointer group"
                  >
                    <div className={`h-1.5 w-full bg-gradient-to-r ${note.color}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 uppercase tracking-wider">{note.tag}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStarNote(note.id, note.title); }}
                          className={`flex items-center space-x-1 text-xs transition-all hover:scale-110 ${starredNotes[note.id] ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                        >
                          <Star size={13} className={starredNotes[note.id] ? 'fill-current' : ''} />
                          <span>{note.stars + (starredNotes[note.id] ? 1 : 0)}</span>
                        </button>
                      </div>
                      <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">{note.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">{note.subject} • {note.university}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={`https://i.pravatar.cc/150?u=${note.author}`} alt={note.author} className="w-6 h-6 rounded-full" />
                          <span className="text-xs text-gray-400">{note.author}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadNote(note.title); }}
                            className="text-gray-500 hover:text-primary transition-colors hover:scale-110"
                          >
                            <Download size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShareNote(note.title); }}
                            className="text-gray-500 hover:text-green-400 transition-colors hover:scale-110"
                          >
                            <Share2 size={14} />
                          </button>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Clock size={10} />
                            <span>{note.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── STUDY GROUPS ── */}
            {activeTab === 'Study Groups' && (
              <motion.div
                key="groups"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {groups.map((group) => (
                  <motion.div
                    key={group.id}
                    whileHover={{ x: 4 }}
                    className="glass rounded-2xl border border-gray-800/50 p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => showToast(`📚 Opening ${group.name}...`, 'info')}>
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-sm">{group.name}</h3>
                          {group.active && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <Users size={10} className="inline mr-1" />
                          {group.members} members • {group.subject}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleJoinGroup(group.id, group.name)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all ${
                        group.joined
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'border border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                    >
                      <span>{group.joined ? 'Joined ✓' : 'Join'}</span>
                      {!group.joined && <ChevronRight size={12} />}
                    </motion.button>
                  </motion.div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateGroup}
                  className="w-full glass rounded-2xl border border-dashed border-gray-700 py-5 flex items-center justify-center space-x-2 text-gray-500 hover:text-white hover:border-primary transition-colors"
                >
                  <Plus size={16} />
                  <span className="text-sm">Create a Study Group</span>
                </motion.button>
              </motion.div>
            )}

            {/* ── FLASHCARDS ── */}
            {activeTab === 'Flashcards' && (
              <motion.div
                key="flashcards"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {FLASHCARDS.map((card, idx) => (
                    <div 
                      key={idx}
                      className="perspective-1000 h-48 cursor-pointer"
                      onClick={() => setFlippedCard(flippedCard === idx ? null : idx)}
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotateY: flippedCard === idx ? 180 : 0 }}
                        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                        className="relative w-full h-full preserve-3d"
                      >
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden glass rounded-3xl border border-gray-700/50 flex flex-col items-center justify-center p-6 text-center shadow-xl">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-4">
                            <Clock size={16} />
                          </div>
                          <p className="text-white font-medium">{card.question}</p>
                          <span className="text-[10px] text-gray-500 uppercase mt-4 tracking-widest font-bold">Tap to see answer</span>
                        </div>
                        {/* Back */}
                        <div 
                          className="absolute inset-0 backface-hidden glass rounded-3xl border border-primary/50 flex flex-col items-center justify-center p-6 text-center shadow-2xl bg-primary/5"
                          style={{ transform: 'rotateY(180deg)' }}
                        >
                          <p className="text-gray-100 text-sm leading-relaxed">{card.answer}</p>
                          <span className="text-primary font-bold text-xs mt-4">NICE WORK! 🔥</span>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>

                <div className="glass rounded-3xl p-8 border border-gray-800 text-center">
                  <h3 className="text-lg font-bold text-white mb-2">Want AI-Generated Cards?</h3>
                  <p className="text-sm text-gray-500 mb-6">Upload your PDF notes and our AI will create custom flashcards automatically.</p>
                  <div className="flex space-x-2 max-w-md mx-auto">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email for beta"
                      className="flex-1 glass border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-primary"
                    />
                    <button onClick={handleEarlyAccess} className="px-6 py-2 bg-primary rounded-xl text-sm font-bold text-white">Join</button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Note Viewer Modal */}
        <AnimatePresence>
          {viewingNote && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingNote(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl glass rounded-3xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${viewingNote.color}`} />
                <div className="p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">{viewingNote.title}</h2>
                      <p className="text-sm text-gray-500">{viewingNote.subject} • Compiled by {viewingNote.author}</p>
                    </div>
                    <button onClick={() => setViewingNote(null)} className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                      <ChevronRight size={24} className="rotate-90" />
                    </button>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800 min-h-[300px]">
                      <div className="flex items-center space-x-2 text-primary mb-4 p-2 bg-primary/10 rounded-lg w-fit">
                        <FileText size={18} />
                        <span className="text-sm font-bold">DIGITAL NOTE PREVIEW</span>
                      </div>
                      <p className="text-gray-200 leading-relaxed text-lg italic">
                        "{viewingNote.content}"
                      </p>
                      <div className="mt-12 space-y-4">
                        <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex space-x-4">
                    <button onClick={() => handleDownloadNote(viewingNote.title)} className="flex-1 py-3 rounded-2xl bg-primary text-white font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/20">
                      <Download size={18} />
                      <span>Download PDF</span>
                    </button>
                    <button onClick={() => handleShareNote(viewingNote.title)} className="flex-1 py-3 rounded-2xl glass border border-gray-700 text-white font-bold flex items-center justify-center space-x-2">
                      <Share2 size={18} />
                      <span>Share Link</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AppShell>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader, Users, Search } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { getAvatarSrc } from "@/utils/defaultAvatars";

export default function ShareCollabModal({ isOpen, onClose, card, currentUser }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchConnections();
    } else {
      setSelectedFriends([]);
      setSearch("");
    }
  }, [isOpen, currentUser]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const [f1, f2] = await Promise.all([
        fetch(`${apiUrl}/api/users/me/following`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${apiUrl}/api/users/me/followers`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);
      const combined = [...(Array.isArray(f1) ? f1 : []), ...(Array.isArray(f2) ? f2 : [])];
      // Deduplicate by ID
      const unique = combined.filter((v, i, a) => a.findIndex(t => (t._id === v._id)) === i);
      setConnections(unique);
    } catch (err) {
      console.error("Error fetching connections:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (id) => {
    setSelectedFriends(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0) return;
    setIsSending(true);

    try {
      const token = localStorage.getItem("collegeadda_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      const siteUrl = window.location.origin; // e.g. http://localhost:3000
      
      const messageText = `Check out this Collab Card I found: ${card.building} - ${siteUrl}/collab?cardId=${card.id}`;

      // Send to each selected friend
      await Promise.all(selectedFriends.map(async (friendId) => {
        // 1. Get or create a private room with this friend
        const roomRes = await fetch(`${apiUrl}/api/chat/rooms`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ participantId: friendId })
        });
        
        if (roomRes.ok) {
          const room = await roomRes.json();
          // 2. Send the message
          await fetch(`${apiUrl}/api/chat/rooms/${room._id}/messages`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ text: messageText })
          });
        }
      }));

      alert("Card shared successfully! 🚀");
      onClose();
    } catch (err) {
      console.error("Error sharing card:", err);
      alert("Failed to share card.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !card) return null;

  const filteredConnections = connections.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="app-panel rounded-[1.75rem] w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="p-5 border-b border-[#E8E6E0] flex justify-between items-center bg-[#F3F2EE] shrink-0">
            <h3 className="font-black uppercase tracking-widest text-sm text-[#1A1A1A] flex items-center">
              <Send size={16} className="mr-2 text-primary" /> Share Collab
            </h3>
            <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 border-b border-[#E8E6E0]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-[#F3F2EE] border border-[#E8E6E0] rounded-xl py-2.5 pl-9 pr-4 text-sm text-[#1A1A1A] focus:border-primary focus:outline-none transition"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <Loader size={24} className="animate-spin text-primary mb-2" />
                <p className="text-xs text-[#6B6B6B] font-bold uppercase tracking-widest">Loading connections...</p>
              </div>
            ) : connections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-6">
                <Users size={32} className="text-[#888888] mb-3" />
                <p className="text-sm font-bold text-[#6B6B6B]">No friends found</p>
                <p className="text-[10px] text-[#6B6B6B] mt-1">Follow some users to share cards with them.</p>
              </div>
            ) : filteredConnections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-sm font-bold text-[#6B6B6B]">No matches found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConnections.map(friend => (
                  <button
                    key={friend._id}
                    onClick={() => toggleFriend(friend._id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      selectedFriends.includes(friend._id) ? 'bg-primary/10 border border-primary/20' : 'hover:bg-[#F3F2EE] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={getAvatarSrc(friend.profilePic, friend.name, friend._id || friend.id)} 
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-[#1A1A1A] leading-none">{friend.name}</p>
                          {friend.isVerified && <VerifiedBadge size={12} />}
                        </div>
                        <p className="text-[10px] text-[#6B6B6B] mt-1">{friend.university || "Student"}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      selectedFriends.includes(friend._id) ? 'bg-primary border-primary text-black' : 'border-[#E8E6E0]'
                    }`}>
                      {selectedFriends.includes(friend._id) && <X size={12} className="rotate-45" style={{ filter: 'brightness(0)' }} />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#E8E6E0] shrink-0">
            <button
              onClick={handleShare}
              disabled={selectedFriends.length === 0 || isSending}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-[#D4A843] hover:from-[#C8922A] hover:to-[#C8922A] text-[#1A1A1A] rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
              {isSending ? "Sending..." : `Send to ${selectedFriends.length > 0 ? selectedFriends.length : ''} friend${selectedFriends.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

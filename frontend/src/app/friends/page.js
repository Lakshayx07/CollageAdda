"use client";
import { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserX, Search, Users, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const SUGGESTED_FRIENDS = [
  { id: 1, name: "Priya Sharma", university: "Rishihood University", major: "Computer Science", mutual: 5, avatar: "https://i.pravatar.cc/150?u=priya1", bio: "Tech enthusiast & Coffee lover ☕", interests: ["Coding", "Art"] },
  { id: 2, name: "Arjun Mehta", university: "Delhi University", major: "Business Administration", mutual: 3, avatar: "https://i.pravatar.cc/150?u=arjun1", bio: "Aspiring entrepreneur 🚀", interests: ["Gaming", "Fitness"] },
  { id: 3, name: "Sneha Gupta", university: "Amity University", major: "Psychology", mutual: 8, avatar: "https://i.pravatar.cc/150?u=sneha1", bio: "Reading my way through life 📚", interests: ["Books", "Travel"] },
  { id: 4, name: "Ravi Kumar", university: "IIT Delhi", major: "Mechanical Engineering", mutual: 2, avatar: "https://i.pravatar.cc/150?u=ravi1", bio: "Building the future 🛠️", interests: ["Cricket", "Gaming"] },
  { id: 5, name: "Asha Patel", university: "DTU", major: "Electronics", mutual: 6, avatar: "https://i.pravatar.cc/150?u=asha1", bio: "Music is my therapy 🎵", interests: ["Music", "Movies"] },
  { id: 6, name: "Karan Singh", university: "Ashoka University", major: "Liberal Arts", mutual: 1, avatar: "https://i.pravatar.cc/150?u=karan1", bio: "Exploring the world ✈️", interests: ["Travel", "Cooking"] },
];

const INITIAL_REQUESTS = [
  { id: 7, name: "Neha Verma", university: "JNU", major: "Political Science", mutual: 4, avatar: "https://i.pravatar.cc/150?u=neha1", bio: "Passionate about social change", interests: ["Movies", "Books"] },
  { id: 8, name: "Rohan Das", university: "SRM University", major: "Biotech", mutual: 2, avatar: "https://i.pravatar.cc/150?u=rohan1", bio: "Lab rat 🧪", interests: ["Art", "Music"] },
];

export default function FriendsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState({});
  const [incoming, setIncoming] = useState(INITIAL_REQUESTS);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("collegeadda_user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const storedRequests = JSON.parse(localStorage.getItem("collegeadda_requests") || "{}");
    setRequests(storedRequests);

    const storedIncoming = JSON.parse(localStorage.getItem("collegeadda_incoming") || JSON.stringify(INITIAL_REQUESTS));
    setIncoming(storedIncoming);

    // Mark as viewed
    localStorage.setItem("collegeadda_friends_viewed", "true");
  }, []);

  const updateStorage = (newRequests, newIncoming) => {
    localStorage.setItem("collegeadda_requests", JSON.stringify(newRequests));
    localStorage.setItem("collegeadda_incoming", JSON.stringify(newIncoming));
    
    // Sync with followers/following for Profile
    const following = SUGGESTED_FRIENDS.filter(f => newRequests[f.id] === "connected" || newRequests[f.id] === "sent");
    const followers = INITIAL_REQUESTS.filter(r => !newIncoming.find(i => i.id === r.id));
    
    localStorage.setItem("collegeadda_following_list", JSON.stringify(following));
    localStorage.setItem("collegeadda_followers_list", JSON.stringify(followers));
  };

  const sendRequest = (id) => {
    const newRequests = { ...requests, [id]: "sent" };
    setRequests(newRequests);
    updateStorage(newRequests, incoming);
  };

  const acceptRequest = (id) => {
    const person = incoming.find(r => r.id === id);
    const newIncoming = incoming.filter(r => r.id !== id);
    const newRequests = { ...requests, [id]: "connected" };
    setIncoming(newIncoming);
    setRequests(newRequests);
    updateStorage(newRequests, newIncoming);
  };

  const declineRequest = (id) => {
    const newIncoming = incoming.filter(r => r.id !== id);
    setIncoming(newIncoming);
    updateStorage(requests, newIncoming);
  };

  const filtered = SUGGESTED_FRIENDS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center space-x-3">
        <Users size={22} style={{ color: '#e1306c' }} />
        <h1 className="text-xl font-bold text-foreground">Friends</h1>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or university..."
            className="w-full bg-surface-hover border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Incoming Requests */}
        {incoming.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider flex items-center gap-2">
              Friend Requests
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{incoming.length}</span>
            </h2>
            <div className="space-y-3">
              {incoming.map(person => (
                <div key={person.id} className="glass-panel p-4 rounded-2xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{person.name}</p>
                      <p className="text-xs text-muted">{person.university}</p>
                      <p className="text-xs text-muted">{person.mutual} mutual friends</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptRequest(person.id)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                    >
                      <UserCheck size={15} />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => declineRequest(person.id)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-sm font-medium bg-surface-hover text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <UserX size={15} />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Friends */}
        <div>
          <h2 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">People You May Know</h2>
          <div className="space-y-4">
            {filtered.map(person => {
              const status = requests[person.id];
              return (
                <div key={person.id} className="glass-panel p-5 rounded-3xl transition-all hover:border-primary/20 group">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img src={person.avatar} alt={person.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-background shadow-md" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-foreground text-base truncate">{person.name}</p>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{person.major}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => !status && sendRequest(person.id)}
                            disabled={!!status && status !== "connected"}
                            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                              status === "sent"
                                ? "bg-surface-hover text-muted cursor-default"
                                : status === "connected"
                                ? "bg-green-500/20 text-green-400 cursor-default"
                                : "text-white hover:scale-[1.05] active:scale-95 shadow-primary/20"
                            }`}
                            style={(!status) ? { background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' } : {}}
                          >
                            {status === "sent" ? (
                              <><UserCheck size={14} /><span>Requested</span></>
                            ) : status === "connected" ? (
                              <><UserCheck size={14} /><span>Connected</span></>
                            ) : (
                              <><UserPlus size={14} /><span>Add</span></>
                            )}
                          </button>
                          {(status === "sent" || status === "connected") && (
                            <button 
                              onClick={() => router.push(`/messages?chat=${person.id}`)}
                              className="p-2.5 rounded-xl bg-surface-hover text-primary hover:bg-primary/10 hover:scale-105 active:scale-95 transition-all shadow-sm"
                            >
                              <MessageCircle size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted mt-2 line-clamp-2 italic">"{person.bio}"</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {person.interests.map(i => (
                          <span key={i} className="text-[9px] bg-primary/5 text-primary/80 px-2 py-0.5 rounded-lg border border-primary/10 font-medium">#{i}</span>
                        ))}
                        <span className="text-[9px] text-muted flex items-center ml-auto">
                          <Users size={10} className="mr-1" />
                          {person.mutual} mutual
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

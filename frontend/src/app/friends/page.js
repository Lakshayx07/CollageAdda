"use client";
import { useState } from "react";
import { UserPlus, UserCheck, UserX, Search, Users } from "lucide-react";

const SUGGESTED_FRIENDS = [
  { id: 1, name: "Priya Sharma", university: "Rishihood University", year: "3rd Year", mutual: 5, avatar: "https://i.pravatar.cc/150?u=priya1" },
  { id: 2, name: "Arjun Mehta", university: "Delhi University", year: "2nd Year", mutual: 3, avatar: "https://i.pravatar.cc/150?u=arjun1" },
  { id: 3, name: "Sneha Gupta", university: "Amity University", year: "4th Year", mutual: 8, avatar: "https://i.pravatar.cc/150?u=sneha1" },
  { id: 4, name: "Ravi Kumar", university: "IIT Delhi", year: "1st Year", mutual: 2, avatar: "https://i.pravatar.cc/150?u=ravi1" },
  { id: 5, name: "Asha Patel", university: "DTU", year: "3rd Year", mutual: 6, avatar: "https://i.pravatar.cc/150?u=asha1" },
  { id: 6, name: "Karan Singh", university: "Ashoka University", year: "2nd Year", mutual: 1, avatar: "https://i.pravatar.cc/150?u=karan1" },
];

const INCOMING_REQUESTS = [
  { id: 7, name: "Neha Verma", university: "JNU", year: "4th Year", mutual: 4, avatar: "https://i.pravatar.cc/150?u=neha1" },
  { id: 8, name: "Rohan Das", university: "SRM University", year: "1st Year", mutual: 2, avatar: "https://i.pravatar.cc/150?u=rohan1" },
];

export default function FriendsPage() {
  const [requests, setRequests] = useState({});
  const [incoming, setIncoming] = useState(INCOMING_REQUESTS);
  const [search, setSearch] = useState("");

  const sendRequest = (id) => {
    setRequests(prev => ({ ...prev, [id]: "sent" }));
  };

  const acceptRequest = (id) => {
    setIncoming(prev => prev.filter(r => r.id !== id));
    setRequests(prev => ({ ...prev, [id]: "connected" }));
  };

  const declineRequest = (id) => {
    setIncoming(prev => prev.filter(r => r.id !== id));
  };

  const filtered = SUGGESTED_FRIENDS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
          <div className="space-y-3">
            {filtered.map(person => {
              const status = requests[person.id];
              return (
                <div key={person.id} className="glass-panel p-4 rounded-2xl flex items-center space-x-3">
                  <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{person.name}</p>
                    <p className="text-xs text-muted truncate">{person.university} • {person.year}</p>
                    <p className="text-xs text-muted">{person.mutual} mutual friends</p>
                  </div>
                  <button
                    onClick={() => !status && sendRequest(person.id)}
                    disabled={!!status}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      status === "sent"
                        ? "bg-surface-hover text-muted cursor-default"
                        : status === "connected"
                        ? "bg-green-500/20 text-green-400 cursor-default"
                        : "text-white hover:scale-[1.04]"
                    }`}
                    style={!status ? { background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' } : {}}
                  >
                    {status === "sent" ? (
                      <><UserCheck size={13} /><span>Requested</span></>
                    ) : status === "connected" ? (
                      <><UserCheck size={13} /><span>Connected</span></>
                    ) : (
                      <><UserPlus size={13} /><span>Add</span></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { User, LogOut, Star, Users, BookOpen, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("collegeadda_user");
    if (stored) setUser(JSON.parse(stored));
    else router.push("/login");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("collegeadda_token");
    localStorage.removeItem("collegeadda_user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="text-primary" size={22} />
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-1 text-muted hover:text-red-400 transition-colors text-sm">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-4">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-secondary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <h2 className="text-xl font-bold text-foreground">{user.name || "Student"}</h2>
          <p className="text-sm text-muted mt-1">{user.email}</p>
          <p className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full inline-block mt-2">{user.university || "University not set"}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Star, label: "Points", value: user.points || 50 },
            { icon: Users, label: "Connections", value: 0 },
            { icon: BookOpen, label: "Resources", value: 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass-panel p-4 rounded-2xl text-center">
              <Icon className="text-primary mx-auto mb-1" size={20} />
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Edit Profile Button */}
        <button className="w-full glass-panel py-3 rounded-xl flex items-center justify-center space-x-2 text-sm text-foreground hover:border-primary/30 transition-colors">
          <Edit3 size={16} />
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

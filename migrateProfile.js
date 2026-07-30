const fs = require('fs');

const pageContent = fs.readFileSync('frontend/src/app/profile/page.js', 'utf8');
const userIdContent = fs.readFileSync('frontend/src/app/profile/[userId]/page.js', 'utf8');

// 1. Extract the 'init' useEffect from [userId]/page.js
const initRegex = /\/\* ─────────────────────────── init ─────────────────────────── \*\/(.*?)\/\* ─────────────────────── keyboard shortcuts ─────────────────── \*\//s;
const initMatch = userIdContent.match(initRegex);
const initLogic = initMatch ? initMatch[1] : '';

// 2. Extract Connect actions and message actions from [userId]/page.js
const actionsRegex = /\/\* ────────────────────────── actions ────────────────────────── \*\/(.*?)\n  return \(/s;
const actionsMatch = userIdContent.match(actionsRegex);
const actionsLogic = actionsMatch ? actionsMatch[1] : '';

// Now take page.js and modify it
let newContent = pageContent;

// Replace 'export default function ProfilePage() {' with the params version
newContent = newContent.replace(
  'export default function ProfilePage() {',
  `export default function UserProfilePage({ params }) {\n  const resolvedParams = require("react").use(params);\n  const targetUserId = resolvedParams.userId;\n  const [currentUser, setCurrentUser] = useState(null);\n  const [profileUser, setProfileUser] = useState(null);\n  const [connectStatus, setConnectStatus] = useState("idle");\n  const [followers, setFollowers] = useState([]);\n  const [following, setFollowing] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [loadingPosts, setLoadingPosts] = useState(true);\n  const [error, setError] = useState(null);\n`
);

// We must replace 'user' state with 'profileUser' where used for UI. But wait! page.js uses 'user' for the profile data.
// Let's just alias profileUser as user for the UI!
// Oh! So in the state, instead of setProfileUser, we can just use setUser like page.js does!
// Let's just change the initLogic to use setUser instead of setProfileUser!
let modifiedInitLogic = initLogic.replace(/setProfileUser/g, 'setUser');

// Remove the two useEffects in page.js that fetch data
// We'll replace from '// Set user from localStorage initially' down to the end of the second useEffect
const fetchLogicRegex = /\/\/ Set user from localStorage initially.*?\}\);\n  \}, \[user\?\._id, router, apiUrl\]\);/s;
newContent = newContent.replace(fetchLogicRegex, modifiedInitLogic);

// Insert the actions logic after the initLogic (around line where activeDropdown is)
// Actually we can just put actionsLogic before the return statement
newContent = newContent.replace(/return \(\n    <div className="min-h-screen/s, actionsLogic + "\n  return (\n    <div className=\"min-h-screen");

// Now we need to replace the Edit Profile button.
// In page.js, the Edit Profile button is:
const editButtonRegex = /<button\n[^\n]*onClick=\{[^}]*setModal\("edit"\)[^}]*\}\n.*?<Edit3[^>]*>.*?<\/button>/s;
const connectButtons = `
                  {currentUser && (currentUser._id === user._id || currentUser.id === user._id) ? (
                    <button
                      onClick={() => setModal("edit")}
                      className="px-6 py-2.5 rounded-2xl bg-black text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                    >
                      <Edit3 size={16} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleConnectAction}
                        className={clsx(
                          "px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2",
                          connectStatus === "connected"
                            ? "bg-[#F9F8F5] border border-[#E8E6E0] text-[#1A1A1A]"
                            : connectStatus === "pending"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-black text-white hover:scale-105 active:scale-95 shadow-black/20"
                        )}
                      >
                        {connectStatus === "connecting" && <Loader2 size={16} className="animate-spin" />}
                        {connectStatus === "connected" ? "Connected" : connectStatus === "pending" ? "Pending" : "Connect"}
                      </button>
                      <button
                        onClick={handleDirectMessage}
                        className="p-2.5 rounded-2xl bg-[#F9F8F5] border border-[#E8E6E0] text-[#1A1A1A] hover:bg-[#E8E6E0] transition-colors"
                      >
                        <MessageCircle size={18} />
                      </button>
                    </div>
                  )}
`;
newContent = newContent.replace(editButtonRegex, connectButtons);

// Next: In page.js, clicking the Avatar or Cover opens file upload. We should disable this if currentUser != user.
// Find the input for cover upload:
// <input type="file" ref={coverInputRef} ... />
// We can just leave the input, but conditionally disable the click.
newContent = newContent.replace(/onClick=\{handleCoverClick\}/g, 'onClick={() => { if(currentUser && (currentUser._id === user._id || currentUser.id === user._id)) handleCoverClick(); }}');
newContent = newContent.replace(/onClick=\{handleAvatarClick\}/g, 'onClick={() => { if(currentUser && (currentUser._id === user._id || currentUser.id === user._id)) handleAvatarClick(); }}');

// Disable edit modal logic for non-users (just in case they hack it)
newContent = newContent.replace(/setModal\("edit"\)/g, 'if (currentUser && (currentUser._id === user._id || currentUser.id === user._id)) setModal("edit")');

// Replace standard lucide imports to make sure Loader2 is there
newContent = newContent.replace(/import \{.*?\} from "lucide-react";/s, `import { LogOut, Edit3, X, Check, Plus, Grid, Heart, MessageCircle, Send, ChevronLeft, ChevronRight, Share2, Ghost, MapPin, Zap, Star, Camera, Clock, Image as ImageIcon, Music, Code, Palette, Plane, Gamepad2, Book, Dumbbell, Film, Utensils, Trophy, Briefcase, Users, Crown, CalendarDays, GraduationCap, Flame, Building2, TrendingUp, Award, User, MoreVertical, Globe, Sparkles, Users2, Lock, Loader2 } from "lucide-react";`);

// One more issue: in page.js, logout is handled in the settings modal. 
// We should probably hide the settings button for other users.
const settingsButtonRegex = /<button\n[^\n]*onClick=\{[^}]*setModal\("settings"\)[^}]*\}\n.*?<MoreVertical[^>]*>.*?<\/button>/s;
newContent = newContent.replace(settingsButtonRegex, `
                  {currentUser && (currentUser._id === user._id || currentUser.id === user._id) && (
                    $&
                  )}
`);

// Write the result
fs.writeFileSync('frontend/src/app/profile/[userId]/page.js', newContent);
console.log('Migration complete');

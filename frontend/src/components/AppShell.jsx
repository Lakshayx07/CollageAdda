import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MessageCircle, BookOpen, Compass, LogOut, Users } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/feed',    icon: Home,          label: 'Feed'    },
  { to: '/chat',    icon: MessageCircle, label: 'Chat'    },
  { to: '/study',   icon: BookOpen,      label: 'Study'   },
  { to: '/friends', icon: Users,         label: 'Friends' },
  { to: '/explore', icon: Compass,       label: 'Explore' },
];

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('collageadda_user') || '{}'); }
  catch { return {}; }
};

/* ── Desktop Sidebar ── */
export function Sidebar() {
  const navigate = useNavigate();
  const user = getUser();
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleLogout = () => {
    localStorage.removeItem('collageadda_user');
    navigate('/');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-dark border-r border-gray-800 py-6 sticky top-0 h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-6 mb-8">
        <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
          CollageAdda
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">Your campus, your vibe 🎓</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isExplore = to === '/explore';
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-medium group relative
                 ${isActive 
                   ? (isExplore ? 'bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-transparent text-yellow-500' : 'bg-primary/15 text-primary')
                   : (isExplore ? 'text-yellow-600 hover:bg-gray-800/60 hover:text-yellow-400' : 'text-gray-400 hover:bg-gray-800/60 hover:text-white')} `
              }
            >
              {({ isActive }) => (
                <>
                  {isExplore && (
                    <div className={`absolute -left-1 w-1 bg-yellow-500 rounded-full transition-all duration-300 transform 
                      ${isActive ? 'h-6 scale-y-100 opacity-100' : 'h-4 scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-50'}`} 
                    />
                  )}
                  <Icon size={20} className={`transition-transform group-hover:scale-110 
                    ${isActive ? (isExplore ? 'text-yellow-400' : 'text-primary') : (isExplore ? 'text-yellow-500' : '')} 
                    ${isExplore && isActive ? 'animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''}`} 
                  />
                  <span className={isExplore && isActive ? 'font-bold drop-shadow-md' : ''}>{label}</span>
                  
                  {/* Glowing dot for generic active items */}
                  {isActive && !isExplore && (
                    <motion.div layoutId="sidebar-active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  
                  {/* Ping effect for Explore */}
                  {isExplore && isActive && (
                    <span className="absolute right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500 drop-shadow-[0_0_8px_rgba(245,158,11,1)]"></span>
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Profile card + Logout */}
      <div className="px-4 pt-4 border-t border-gray-800 space-y-2">
        {/* Profile NavLink with avatar + name */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group ${
              isActive ? 'bg-primary/15' : 'hover:bg-gray-800/60'}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                {user.profilePic
                  ? <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-white'}`}>
                  {user.name || 'My Profile'}
                </p>
                <p className="text-[10px] text-gray-500 truncate">{user.university || 'View profile'}</p>
              </div>
            </>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

/* ── Mobile Bottom Nav ── */
export function BottomNav() {
  const user = getUser();
  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-gray-800 px-2 py-2 flex justify-around items-center z-50">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isExplore = to === '/explore';
        return (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all relative
               ${isActive 
                 ? (isExplore ? 'text-yellow-400' : 'text-primary') 
                 : (isExplore ? 'text-yellow-600 hover:text-yellow-500' : 'text-gray-500 hover:text-gray-300')}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all 
                  ${isActive 
                    ? (isExplore ? 'bg-gradient-to-tr from-yellow-500/20 to-amber-500/20 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-primary/15') 
                    : (isExplore ? 'bg-yellow-500/5' : '')}`}
                >
                  <Icon size={20} className={isExplore ? (isActive ? 'animate-pulse text-yellow-400' : 'text-yellow-600') : ''} />
                </div>
                <span className={`text-[10px] font-medium ${isExplore && isActive ? 'font-bold' : ''}`}>{label}</span>
                {isExplore && !isActive && (
                   <span className="absolute top-1 right-2 flex h-1.5 w-1.5">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500"></span>
                   </span>
                )}
              </>
            )}
          </NavLink>
        );
      })}

      {/* Profile tab on mobile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all
           ${isActive ? 'text-primary' : 'text-gray-500'}`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-600 border-2 transition-all ${isActive ? 'border-primary' : 'border-transparent'}`}>
              {user.profilePic
                ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <span className="text-[10px] font-medium">Me</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}

/* ── App Shell ── */
export default function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

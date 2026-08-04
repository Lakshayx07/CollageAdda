import re

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'r') as f:
    content = f.read()

# 1. Update Input Area
old_input = """          ) : (
            <div className="max-w-md mx-auto text-center py-2">
              <p className="text-sm text-[#6B6B6B] mb-3 font-semibold">You are not a member of this community.</p>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-[#1A1A1A] py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-300/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {joining ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                Join Community to Participate
              </button>
            </div>
          )}"""
new_input = """          ) : role === 'pending' ? (
            <div className="max-w-md mx-auto text-center py-2">
              <p className="text-sm text-amber-700 mb-3 font-semibold">Your join request is pending approval.</p>
              <button
                disabled
                className="w-full bg-amber-50 text-amber-600 border border-amber-200 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 opacity-80"
              >
                <Loader2 size={14} className="animate-spin" />
                Approval Pending...
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-2">
              <p className="text-sm text-[#6B6B6B] mb-3 font-semibold">You are not a member of this community.</p>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-[#1A1A1A] py-3 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-amber-300/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {joining ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                {community?.privacy === 'invite_only' ? 'Request to Join' : 'Join Community to Participate'}
              </button>
            </div>
          )}"""
content = content.replace(old_input, new_input)

# 2. Update Messages Area
old_messages_start = """          {/* Message bubbles */}
          {sortedMessages.map((msg, index) => {"""
new_messages_start = """          {/* Message bubbles */}
          {(!isMember && community?.privacy === 'invite_only') ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-60">
              <div className="w-16 h-16 rounded-full bg-[#E8E6E0] flex items-center justify-center mb-4 text-[#888888]">
                <Globe size={24} />
              </div>
              <h4 className="text-[#1A1A1A] font-bold text-lg mb-1">Private Community</h4>
              <p className="text-[#6B6B6B] text-sm text-center max-w-xs">You must be approved to view messages and participate in this community.</p>
            </div>
          ) : sortedMessages.map((msg, index) => {"""
content = content.replace(old_messages_start, new_messages_start)


with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'w') as f:
    f.write(content)

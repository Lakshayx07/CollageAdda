import re

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'r') as f:
    content = f.read()

# 1. Add UserPlus button to header
old_header = """            {pinnedCount > 0 && (
              <button
                type="button"
                onClick={handleJumpToPinned}
                className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100 cursor-pointer"
                title="Jump to pinned message"
              >
                <span aria-hidden="true">📌</span>
                {pinnedCount}
              </button>
            )}
            {isMember && ("""
new_header = """            {pinnedCount > 0 && (
              <button
                type="button"
                onClick={handleJumpToPinned}
                className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-100 cursor-pointer"
                title="Jump to pinned message"
              >
                <span aria-hidden="true">📌</span>
                {pinnedCount}
              </button>
            )}
            {isMember && community?.privacy === 'invite_only' && (
              <button
                type="button"
                onClick={() => setShowRequestsModal(true)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black cursor-pointer transition-colors ${pendingRequests.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-[#F9F8F5] text-[#6B6B6B] border-[#E8E6E0] hover:bg-[#F3F2EE]'}`}
                title="View Join Requests"
              >
                <UserPlus size={16} />
                {pendingRequests.length > 0 && (
                  <span>{pendingRequests.length}</span>
                )}
              </button>
            )}
            {isMember && ("""
content = content.replace(old_header, new_header)

# 2. Add Requests Modal before final return closing tag
modal_jsx = """
      {/* Pending Requests Modal */}
      <AnimatePresence>
        {showRequestsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              className="w-full max-w-md overflow-hidden flex flex-col rounded-[24px] border border-[#ECE6DD] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.12)] max-h-[85vh]"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-[#ECE6DD] bg-[#F4F1EB] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <UserPlus size={14} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#1B1B1B]">
                    Join Requests
                  </h3>
                </div>
                <button onClick={() => setShowRequestsModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#6F6F6F] hover:bg-black/5 transition">
                  <XCircle size={18} />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-10 text-[#888888]">
                    <UserCheck size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="font-bold text-sm">No pending requests</p>
                  </div>
                ) : (
                  pendingRequests.map(req => (
                    <div key={req._id} className="flex items-center justify-between p-3 border border-[#E8E6E0] rounded-2xl bg-[#F9F8F5]">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={req.profilePic || `/api/users/${req._id}/avatar`} alt={req.name} className="w-10 h-10 rounded-xl object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://avatar.iran.liara.run/public'; }} />
                        <div className="min-w-0">
                          <p className="font-black text-[#1A1A1A] text-sm truncate">{req.name}</p>
                          <p className="text-[10px] font-bold text-[#888888] truncate">{req.university || 'Student'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button onClick={() => handleApproveRequest(req._id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition">Approve</button>
                        <button onClick={() => handleSkipRequest(req._id)} className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition">Skip</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
"""
# Insert modal before final </div> of messages-layout or similar
content = content.replace('    </div>\n  );\n}', modal_jsx + '    </div>\n  );\n}')

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'w') as f:
    f.write(content)

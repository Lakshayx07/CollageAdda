import re

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'r') as f:
    content = f.read()

# 1. Update sidebar rendering to show pending status
old_sidebar_button = """                    {!active && !member && (
                      <button
                        onClick={() => handleJoinCommunity(comm)}
                        disabled={isJoiningCard}
                        className={`flex items-center gap-1.5 rounded-2xl bg-white border px-4 py-2 text-xs font-black cursor-pointer disabled:opacity-50 ${cardTheme.text} ${cardTheme.avatar}`}
                      >
                        {isJoiningCard ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Join
                      </button>
                    )}"""
new_sidebar_button = """                    {!active && !member && (
                      pendingSet.has(comm.id) ? (
                        <button disabled className={`flex items-center gap-1.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 px-4 py-2 text-[10px] font-black opacity-70`}>
                          Pending...
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinCommunity(comm)}
                          disabled={isJoiningCard}
                          className={`flex items-center gap-1.5 rounded-2xl bg-white border px-4 py-2 text-xs font-black cursor-pointer disabled:opacity-50 ${cardTheme.text} ${cardTheme.avatar}`}
                        >
                          {isJoiningCard ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          {comm.privacy === 'invite_only' ? 'Request' : 'Join'}
                        </button>
                      )
                    )}"""
content = content.replace(old_sidebar_button, new_sidebar_button)

# 2. Add fetchPendingRequests logic
fetch_pending_func = """
  const fetchPendingRequests = async () => {
    if (!activeCommunityId || !isMember) return;
    try {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      const { data } = await authSupabase
        .from('community_members')
        .select('user_id')
        .eq('community_id', activeCommunityId)
        .eq('role', 'pending');
        
      if (data && data.length > 0) {
        // Fetch user details from our backend API
        const userIds = data.map(d => d.user_id);
        const users = await Promise.all(
          userIds.map(async (id) => {
             const res = await fetch(`/api/users/${id}`, {
               headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
             });
             if (res.ok) return await res.json();
             return { _id: id, name: 'Unknown User', university: 'Unknown' };
          })
        );
        setPendingRequests(users.filter(u => u !== null));
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [activeCommunityId, isMember]);
"""

# Insert fetchPendingRequests before return
content = content.replace('  const theme = getCommunityTheme(community);', fetch_pending_func + '\n  const theme = getCommunityTheme(community);')

# 3. Handle Approve and Skip actions
approve_skip_logic = """
  const handleApproveRequest = async (userId) => {
    try {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      await authSupabase
        .from('community_members')
        .update({ role: 'member' })
        .eq('community_id', activeCommunityId)
        .eq('user_id', userId);
        
      await authSupabase
        .from('communities')
        .update({ member_count: (community?.member_count || 0) + 1 })
        .eq('id', activeCommunityId);
        
      setCommunity(prev => ({ ...prev, member_count: (prev.member_count || 0) + 1 }));
      setPendingRequests(prev => prev.filter(req => req._id !== userId));
      showToastMsg("success", "Request approved!");
    } catch (err) {
      showToastMsg("error", "Failed to approve request");
    }
  };

  const handleSkipRequest = async (userId) => {
    try {
      const { client: authSupabase } = await getAuthenticatedSupabaseClient();
      await authSupabase
        .from('community_members')
        .delete()
        .eq('community_id', activeCommunityId)
        .eq('user_id', userId);
        
      setPendingRequests(prev => prev.filter(req => req._id !== userId));
      showToastMsg("success", "Request skipped");
    } catch (err) {
      showToastMsg("error", "Failed to skip request");
    }
  };
"""
content = content.replace('  const handleJoin = async () => {', approve_skip_logic + '\n  const handleJoin = async () => {')


with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'w') as f:
    f.write(content)

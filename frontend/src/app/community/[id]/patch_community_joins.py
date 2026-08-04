import re

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'r') as f:
    content = f.read()

# 5. Patch handleJoin (for active community)
old_handleJoin = """    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: activeCommunityId, user_id: memberUserId, role: 'member' }]);

      if (memberError && memberError.code !== '23505') throw memberError;
      const alreadyJoined = memberError?.code === '23505';

      // Update community member count
      const newCount = alreadyJoined ? (community?.member_count || 0) : (community?.member_count || 0) + 1;
      if (!alreadyJoined) {
        await authSupabase
          .from("communities")
          .update({ member_count: newCount })
          .eq("id", activeCommunityId);
      }

      setCommunity((prev) => ({ ...prev, member_count: newCount }));
      setMembershipSet(prev => new Set([...prev, activeCommunityId]));
      setCommunities(prev => prev.map(comm => (
        comm.id === activeCommunityId ? { ...comm, member_count: newCount } : comm
      )));
      localStorage.setItem(`community_seen_${activeCommunityId}`, new Date().toISOString());
      setIsMember(true);
      setRole('member');
      showToastMsg("success", "You joined the community! 🎉");
      triggerJoinSparkles();"""
new_handleJoin = """    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);
      
      const isInviteOnly = community?.privacy === 'invite_only';
      const roleToInsert = isInviteOnly ? 'pending' : 'member';

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: activeCommunityId, user_id: memberUserId, role: roleToInsert }]);

      if (memberError && memberError.code !== '23505') throw memberError;
      const alreadyJoined = memberError?.code === '23505';

      // Update community member count
      const newCount = alreadyJoined ? (community?.member_count || 0) : (community?.member_count || 0) + 1;
      if (!alreadyJoined && !isInviteOnly) {
        await authSupabase
          .from("communities")
          .update({ member_count: newCount })
          .eq("id", activeCommunityId);
      }

      if (isInviteOnly) {
        setPendingSet(prev => new Set([...prev, activeCommunityId]));
        setRole('pending');
        setIsMember(false);
        showToastMsg("success", "Request sent! 🎉");
      } else {
        setCommunity((prev) => ({ ...prev, member_count: newCount }));
        setMembershipSet(prev => new Set([...prev, activeCommunityId]));
        setCommunities(prev => prev.map(comm => (
          comm.id === activeCommunityId ? { ...comm, member_count: newCount } : comm
        )));
        localStorage.setItem(`community_seen_${activeCommunityId}`, new Date().toISOString());
        setIsMember(true);
        setRole('member');
        showToastMsg("success", "You joined the community! 🎉");
        triggerJoinSparkles();
      }"""
content = content.replace(old_handleJoin, new_handleJoin)

# 6. Patch handleJoinCommunity
old_handleJoinCommunity = """    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: targetCommunity.id, user_id: memberUserId, role: 'member' }]);

      if (memberError && memberError.code !== '23505') throw memberError;
      const alreadyJoined = memberError?.code === '23505';

      const newCount = alreadyJoined ? (targetCommunity.member_count || 0) : (targetCommunity.member_count || 0) + 1;
      if (!alreadyJoined) {
        await authSupabase
          .from("communities")
          .update({ member_count: newCount })
          .eq("id", targetCommunity.id);
      }

      localStorage.setItem(`community_seen_${targetCommunity.id}`, new Date().toISOString());
      setMembershipSet(prev => new Set([...prev, targetCommunity.id]));
      setCommunities(prev => prev.map(comm => (
        comm.id === targetCommunity.id ? { ...comm, member_count: newCount } : comm
      )));
      if (targetCommunity.id === activeCommunityId) {
        setCommunity(prev => ({ ...prev, member_count: newCount }));
        setIsMember(true);
        setRole('member');
      }
      showToastMsg("success", `Joined ${targetCommunity.name}!`);
      triggerJoinSparkles();"""
new_handleJoinCommunity = """    try {
      const { client: authSupabase, user: authUser } = await getAuthenticatedSupabaseClient();
      const memberUserId = authUser.id;
      if (!memberUserId) return;
      setCurrentUserId(memberUserId);
      
      const isInviteOnly = targetCommunity.privacy === 'invite_only';
      const roleToInsert = isInviteOnly ? 'pending' : 'member';

      const { error: memberError } = await authSupabase
        .from("community_members")
        .insert([{ community_id: targetCommunity.id, user_id: memberUserId, role: roleToInsert }]);

      if (memberError && memberError.code !== '23505') throw memberError;
      const alreadyJoined = memberError?.code === '23505';

      const newCount = alreadyJoined ? (targetCommunity.member_count || 0) : (targetCommunity.member_count || 0) + 1;
      if (!alreadyJoined && !isInviteOnly) {
        await authSupabase
          .from("communities")
          .update({ member_count: newCount })
          .eq("id", targetCommunity.id);
      }

      if (isInviteOnly) {
        setPendingSet(prev => new Set([...prev, targetCommunity.id]));
        if (targetCommunity.id === activeCommunityId) {
           setRole('pending');
           setIsMember(false);
        }
        showToastMsg("success", "Request sent! 🎉");
      } else {
        localStorage.setItem(`community_seen_${targetCommunity.id}`, new Date().toISOString());
        setMembershipSet(prev => new Set([...prev, targetCommunity.id]));
        setCommunities(prev => prev.map(comm => (
          comm.id === targetCommunity.id ? { ...comm, member_count: newCount } : comm
        )));
        if (targetCommunity.id === activeCommunityId) {
          setCommunity(prev => ({ ...prev, member_count: newCount }));
          setIsMember(true);
          setRole('member');
        }
        showToastMsg("success", `Joined ${targetCommunity.name}!`);
        triggerJoinSparkles();
      }"""
content = content.replace(old_handleJoinCommunity, new_handleJoinCommunity)

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'w') as f:
    f.write(content)

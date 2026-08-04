import re

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'r') as f:
    content = f.read()

# 1. Add missing imports for modal (UserPlus, UserCheck, XCircle)
if "UserPlus" not in content:
    content = content.replace('import { Users2, ArrowLeft, MoreVertical, Search, MessageCircle,', 'import { Users2, ArrowLeft, MoreVertical, Search, MessageCircle, UserPlus, UserCheck, XCircle,')
    
# 2. Add pendingSet and pendingRequests states
if "const [pendingSet, setPendingSet]" not in content:
    content = content.replace('const [membershipSet, setMembershipSet] = useState(new Set());', 'const [membershipSet, setMembershipSet] = useState(new Set());\n  const [pendingSet, setPendingSet] = useState(new Set());\n  const [pendingRequests, setPendingRequests] = useState([]);\n  const [showRequestsModal, setShowRequestsModal] = useState(false);')

# 3. Modify fetchDetails query for membershipSet
old_memberships_query = """          const { data: memberships } = await authSupabase
            .from("community_members")
            .select("community_id")
            .eq("user_id", authUser.id);
          const nextMembershipSet = new Set(memberships?.map(m => m.community_id) || []);
          setMembershipSet(nextMembershipSet);"""
new_memberships_query = """          const { data: memberships } = await authSupabase
            .from("community_members")
            .select("community_id, role")
            .eq("user_id", authUser.id);
          const nextMembershipSet = new Set();
          const nextPendingSet = new Set();
          (memberships || []).forEach(m => {
            if (m.role === 'pending') nextPendingSet.add(m.community_id);
            else nextMembershipSet.add(m.community_id);
          });
          setMembershipSet(nextMembershipSet);
          setPendingSet(nextPendingSet);"""
content = content.replace(old_memberships_query, new_memberships_query)

# 4. Modify fetchDetails query for active community role (so we don't treat pending as member)
old_role_query = """          const { data: member } = await authSupabase
            .from("community_members")
            .select("*")
            .eq("community_id", targetId)
            .eq("user_id", authUser.id)
            .maybeSingle();

          if (member) {
            setIsMember(true);
            setRole(member.role);
          }"""
new_role_query = """          const { data: member } = await authSupabase
            .from("community_members")
            .select("*")
            .eq("community_id", targetId)
            .eq("user_id", authUser.id)
            .maybeSingle();

          if (member) {
            setRole(member.role);
            if (member.role !== 'pending') {
              setIsMember(true);
            } else {
              setIsMember(false);
            }
          }"""
content = content.replace(old_role_query, new_role_query)

with open('/Users/lakshay.yadav2024nst.rishihood.edu.in/Desktop/CollageAdda/frontend/src/app/community/[id]/page.js', 'w') as f:
    f.write(content)

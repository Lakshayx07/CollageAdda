const fs = require('fs');
const path = 'src/app/friends/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useApiQuery import
if (!content.includes('useApiQuery')) {
    content = content.replace(
        'import { LOGIN_STREAK_UPDATED_EVENT, getDisplayStreak } from "../../utils/loginStreak";',
        'import { LOGIN_STREAK_UPDATED_EVENT, getDisplayStreak } from "../../utils/loginStreak";\nimport { useApiQuery } from "@/utils/useApiQuery";'
    );
}

// 2. Add useApiQuery hooks to FriendsPage component
// Find the component start
const componentStartStr = 'export default function FriendsPage() {';
const componentStartIdx = content.indexOf(componentStartStr);
if (componentStartIdx !== -1) {
    // Find the end of state declarations to insert our queries
    const stateDeclarationsEndIdx = content.indexOf('const [communityToast, setCommunityToast] = useState(null);', componentStartIdx);
    if (stateDeclarationsEndIdx !== -1) {
        const insertPosition = content.indexOf(';', stateDeclarationsEndIdx) + 1;
        
        const hooksToInsert = `

  const { data: profileData } = useApiQuery(
    "squad-profile",
    "/api/users/profile",
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  const { data: suggestedData } = useApiQuery(
    ["squad-suggested", search, activeSquadTab],
    () => buildSearchUrl().replace(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', ''),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000
    }
  );

  useEffect(() => {
    if (profileData) {
      const statusMap = {};
      (profileData.following || []).forEach(id => {
        statusMap[id.toString ? id.toString() : id] = "connected";
      });
      setFollowStatus(statusMap);
    }
  }, [profileData]);

  useEffect(() => {
    if (suggestedData) {
      const users = Array.isArray(suggestedData) ? suggestedData : [];
      setSuggestedUsers(users);
      setCampusUsers(users);
    }
  }, [suggestedData]);
`;
        content = content.slice(0, insertPosition) + hooksToInsert + content.slice(insertPosition);
    }
}

// 3. Remove the fetch from loadData
// Replace the try/catch block inside loadData
const loadDataStart = content.indexOf('const loadData = useCallback(async () => {');
const loadDataEnd = content.indexOf('  }, [apiUrl, router, buildSearchUrl]);', loadDataStart);
if (loadDataStart !== -1 && loadDataEnd !== -1) {
    let loadDataContent = content.substring(loadDataStart, loadDataEnd);
    
    // We just want to keep the user setting and communities loading, and remove the profile and suggested fetching
    const newLoadDataContent = `const loadData = useCallback(async () => {
    const stored = localStorage.getItem("collegeadda_user");
    const token = getToken();
    if (!stored || !token) { router.push("/login"); return; }

    let u;
    try {
      u = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse user data", e);
      router.push("/login");
      return;
    }

    if (!u) { router.push("/login"); return; }
    setUser(u);

    // Load communities and memberships
    fetchCommunities();
    fetchMemberships();
    
    setLoading(false);
`;
    content = content.replace(loadDataContent, newLoadDataContent);
}

fs.writeFileSync(path, content);
console.log("Updated friends/page.js");

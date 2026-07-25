const fs = require('fs');
const path = 'src/app/friends/page.js';
let content = fs.readFileSync(path, 'utf8');

const queryBlock = `
  const { data: profileData } = useApiQuery(
    "network-profile",
    "/api/users/profile",
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  const { data: suggestedData } = useApiQuery(
    ["network-suggested", search, activeNetworkTab],
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

if (content.includes(queryBlock.trim())) {
    content = content.replace(queryBlock, '');
    const insertPos = content.indexOf('}, [apiUrl, filter]);') + 21;
    content = content.slice(0, insertPos) + '\n' + queryBlock + content.slice(insertPos);
    fs.writeFileSync(path, content);
    console.log("Moved useApiQuery block successfully.");
} else {
    console.log("Could not find the exact query block to move.");
}


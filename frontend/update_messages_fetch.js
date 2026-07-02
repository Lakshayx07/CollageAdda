const fs = require('fs');
const path = 'src/app/messages/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useApiQuery for messages at the top of MessagesContent
const componentStartStr = 'const [activeChat, setActiveChat] = useState(null);';
const componentStartIdx = content.indexOf(componentStartStr);
if (componentStartIdx !== -1) {
    const hooksToInsert = `
  const { data: activeChatMessages = [] } = useApiQuery(
    activeChat ? ["chat-messages", activeChat.id] : null,
    activeChat ? \`/api/chat/rooms/\${activeChat.id}/messages\` : null,
    {
      enabled: !!activeChat && !!user,
      staleTime: 60 * 1000 // 1 minute
    }
  );

  useEffect(() => {
    if (activeChat && activeChatMessages && activeChatMessages.length > 0) {
      const u = user || JSON.parse(localStorage.getItem('collegeadda_user') || '{}');
      const formattedMsgs = activeChatMessages.map(m => ({
        id: m._id,
        text: m.text,
        sender: String(m.sender?._id || m.sender?.id) === String(u._id || u.id) ? "me" : "them",
        senderName: m.sender?.name || "Student",
        senderAvatar: m.sender?.profilePic || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(m.sender?.name || "U")}&background=7C3AED&color=fff\`,
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: m.isSystem
      }));
      setMessages(prev => ({ ...prev, [activeChat.id]: formattedMsgs }));
    }
  }, [activeChat, activeChatMessages, user]);
`;
    content = content.replace(componentStartStr, componentStartStr + '\n' + hooksToInsert);
}

// 2. Remove the old fetchHistory logic inside useEffect
const fetchHistoryStart = content.indexOf('      const fetchHistory = async () => {');
const fetchHistoryEnd = content.indexOf('      fetchHistory();', fetchHistoryStart) + 21;
if (fetchHistoryStart !== -1 && fetchHistoryEnd !== -1) {
    let toReplace = content.substring(fetchHistoryStart, fetchHistoryEnd);
    content = content.replace(toReplace, '');
}

fs.writeFileSync(path, content);
console.log("Updated messages/page.js");

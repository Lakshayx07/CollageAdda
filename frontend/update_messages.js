const fs = require('fs');

const path = 'src/app/messages/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace('import { Suspense } from "react";', 'import { Suspense, useCallback, useMemo } from "react";\nimport { useApiQuery } from "@/utils/useApiQuery";\nimport { useQueryClient } from "@tanstack/react-query";');

// 2. Insert useApiQuery and queryClient inside MessagesContent
content = content.replace('  const [chats, setChats] = useState([]);\n  const [loadingChats, setLoadingChats] = useState(true);', `  const queryClient = useQueryClient();
  
  const formatRooms = useCallback((data) => {
    if (!Array.isArray(data) || !user) return [];
    return data.map(room => ({
      id: room._id,
      name: room.isGroup ? (room.groupName || \`\${room.university} Hub\`) : (room.participants.find(p => p._id !== user._id)?.name || "Chat"),
      type: room.isGroup ? "group" : "private",
      avatar: room.isGroup ? <Users size={20} className="text-[#C8922A]" /> : (room.participants.find(p => p._id !== user._id)?.profilePic || \`https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff\`),
      lastMsg: room.lastMessage?.text || "No messages yet",
      time: room.lastMessage ? new Date(room.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
      timestamp: room.lastMessage?.createdAt ? new Date(room.lastMessage.createdAt).getTime() : new Date(room.updatedAt || room.createdAt || 0).getTime(),
      unreadCount: room.unreadCounts?.[user._id] || 0,
      participants: room.participants?.map(p => p._id || p.id) || [],
      partner: room.isGroup ? null : room.participants.find(p => p._id !== user._id)
    }));
  }, [user]);

  const { data: rawRooms = [], isLoading: loadingChats } = useApiQuery(
    "chat-rooms",
    "/api/chat/rooms",
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  );

  const chats = useMemo(() => {
    // If rawRooms is already formatted (due to optimistic updates), use it directly
    if (rawRooms.length > 0 && rawRooms[0].id) return rawRooms;
    return formatRooms(rawRooms);
  }, [rawRooms, formatRooms]);

  const setChats = useCallback((updater) => {
    queryClient.setQueryData("chat-rooms", (oldRawData) => {
      if (!oldRawData) return oldRawData;
      const currentFormatted = (oldRawData.length > 0 && oldRawData[0].id) ? oldRawData : formatRooms(oldRawData);
      return typeof updater === 'function' ? updater(currentFormatted) : updater;
    });
  }, [queryClient, formatRooms]);`);

// 3. Remove the old fetchRooms logic
const fetchRoomsStart = content.indexOf('const fetchRooms = async () => {');
const fetchRoomsEnd = content.indexOf('fetchRooms();', fetchRoomsStart) + 13;
if (fetchRoomsStart !== -1 && fetchRoomsEnd !== -1) {
    let toReplace = content.substring(fetchRoomsStart, fetchRoomsEnd);
    
    // We need to keep the query params handling logic that was inside fetchRooms
    const queryParamsLogic = `
    if (chats.length > 0) {
      // Handle ?chat=roomId (direct room link)
      const chatParam = searchParams.get("chat");
      if (chatParam && !activeChat) {
        const found = chats.find(c => c.id === chatParam);
        if (found) { setActiveChat(found); }
      }

      // Handle ?userId=X (open/create DM from Squad page)
      const userIdParam = searchParams.get("userId");
      if (userIdParam && !activeChat) {
        // Check if a private room with this user already exists
        const existingRoom = chats.find(r => r.type === "private" && r.participants.includes(userIdParam));
        if (existingRoom) {
          setActiveChat(existingRoom);
          const interestParam = searchParams.get("interestProduct");
          if (interestParam) {
            sendAutoInterestMessage(existingRoom.id, interestParam);
          }
        } else {
          // Create a new private DM room
          const createDM = async () => {
            try {
              const token = localStorage.getItem("collegeadda_token");
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
              const createRes = await fetch(\`\${apiUrl}/api/chat/rooms\`, {
                method: "POST",
                headers: { "Authorization": \`Bearer \${token}\`, "Content-Type": "application/json" },
                body: JSON.stringify({ participantId: userIdParam })
              });
              if (createRes.ok) {
                const newRoom = await createRes.json();
                const formatted = {
                  id: newRoom._id,
                  name: newRoom.participants?.find(p => p._id !== user._id)?.name || "Chat",
                  type: "private",
                  avatar: newRoom.participants?.find(p => p._id !== user._id)?.profilePic || \`https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff\`,
                  lastMsg: "No messages yet",
                  time: "",
                  timestamp: Date.now(),
                  unreadCount: 0,
                  partner: newRoom.participants?.find(p => p._id !== user._id)
                };
                setChats(prev => {
                  const exists = prev.find(c => c.id === formatted.id);
                  return exists ? prev : [formatted, ...prev];
                });
                setActiveChat(formatted);
                const interestParam = searchParams.get("interestProduct");
                if (interestParam) {
                  sendAutoInterestMessage(formatted.id, interestParam);
                }
              }
            } catch (err) {
              console.error("Error creating DM room:", err);
            }
          };
          createDM();
        }
      }
    }
`;
    content = content.replace(toReplace, queryParamsLogic);
}

fs.writeFileSync(path, content);
console.log("Updated messages/page.js");

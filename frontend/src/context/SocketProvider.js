"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

/**
 * Global Socket.io provider — keeps a single persistent connection
 * alive across all page navigations.
 *
 * Provides:
 *  - socket        : the raw socket.io instance (or null)
 *  - isConnected   : boolean
 *  - unreadCount   : total unread messages across all rooms
 *  - resetUnread   : call when user opens the messages page
 */
export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // Track which room the user is actively viewing so we don't count those as unread
  const activeRoomRef = useRef(null);
  const seenMessageIdsRef = useRef(new Set());

  useEffect(() => {
    // Only connect if user is authenticated
    const storedUser = localStorage.getItem("collegeadda_user");
    const token = localStorage.getItem("collegeadda_token");
    if (!storedUser || !token) return;

    let user;
    try {
      user = JSON.parse(storedUser);
    } catch {
      return;
    }
    if (!user) return;

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();

    // Pass token in handshake so the server can verify identity
    const newSocket = io(apiUrl, {
      transports: ["websocket"],
      auth: { token },
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      // Tell server we are online — identity is verified server-side via the token
      newSocket.emit("user_online");
    });

    newSocket.on("connect_error", (err) => {
      setIsConnected(false);
      console.warn("[Socket] Connection failed:", err.message);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Global handler — increment unread when message arrives for a room we're NOT viewing
    newSocket.on("receive_message", (msg) => {
      const myId = String(user._id || user.id);
      const senderId = String(msg.senderId || msg.sender?._id || msg.sender?.id || "");
      const roomId = String(msg.room || "");
      const messageId = String(msg._id || msg.id || msg.tempId || "");

      if (messageId) {
        if (seenMessageIdsRef.current.has(messageId)) return;
        seenMessageIdsRef.current.add(messageId);
      }

      // Don't count our own messages
      if (senderId === myId) return;

      // Don't count if user is actively viewing this room
      if (activeRoomRef.current === roomId) return;

      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, []);

  const setActiveRoom = useCallback((roomId) => {
    activeRoomRef.current = roomId ? String(roomId) : null;
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
    socket,
    isConnected,
    unreadCount,
    setUnreadCount,
    resetUnread,
    setActiveRoom,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    // Return a safe fallback for pages that render outside the provider (login, etc.)
    return {
      socket: null,
      isConnected: false,
      unreadCount: 0,
      setUnreadCount: () => {},
      resetUnread: () => {},
      setActiveRoom: () => {},
    };
  }
  return ctx;
}

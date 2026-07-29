export const XP_ACTIONS = {
  EXPLORE_POST: 15,
  CONNECT_USER: 5,
  CREATE_POST: 10,
  FIRST_POST: 5,
  CREATE_STORY: 3,
  FIRST_STORY: 5,
  JOIN_COMMUNITY: 5,
  LIKE_POST: 1,
  COMMENT_POST: 2,
};

export const XP_TIERS = [
  { id: "silver", label: "Silver Tick", xpRequired: 500, icon: "/ticks/silver.png" },
  { id: "purple", label: "Purple Tick", xpRequired: 1500, icon: "/ticks/purple.png" },
  { id: "orange", label: "Orange Tick", xpRequired: 3000, icon: "/ticks/orange.png" },
  { id: "gold", label: "Gold Tick", xpRequired: 5000, icon: "/ticks/gold.png" },
];

export const BADGES = [
  { id: "weekly_poster", label: "Weekly Poster", type: "posts", window: "week", target: 15 },
  { id: "story_streak", label: "Story Streak", type: "stories", window: "week", target: 15 },
  { id: "conversationalist", label: "Conversationalist", type: "comments", window: "week", target: 30 },
  { id: "crowd_favorite", label: "Crowd Favorite", type: "likes_received", window: "month", target: 100 },
  { id: "networker", label: "Networker", type: "connections", window: "week", target: 15 },
  { id: "prolific_poster", label: "Prolific Poster", type: "posts", window: "month", target: 50 },
  { id: "fan_favorite", label: "Fan Favorite", type: "likes_received", window: "lifetime", target: 1000 },
  { id: "veteran_poster", label: "Veteran Poster", type: "posts", window: "lifetime", target: 500 },
  { id: "storyteller", label: "Storyteller", type: "stories", window: "lifetime", target: 500 },
];

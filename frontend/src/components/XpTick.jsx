"use client";
import React from 'react';

export default function XpTick({ user, size = 16, className = "" }) {
  if (!user) return null;

  const xp = user.xp || 0;
  const points = user.points || 0;
  const totalXp = xp + points;

  if (totalXp < 500) return null;

  let tickSrc = "";
  let tickTitle = "";

  if (totalXp >= 5000) {
    tickSrc = "/ticks/gold.png";
    tickTitle = "Gold Tick (5000+ XP)";
  } else if (totalXp >= 3000) {
    tickSrc = "/ticks/orange.png";
    tickTitle = "Orange Tick (3000+ XP)";
  } else if (totalXp >= 1500) {
    tickSrc = "/ticks/purple.png";
    tickTitle = "Purple Tick (1500+ XP)";
  } else {
    tickSrc = "/ticks/silver.png";
    tickTitle = "Silver Tick (500+ XP)";
  }

  return (
    <img 
      src={tickSrc} 
      alt={tickTitle} 
      title={tickTitle}
      className={`inline-block ml-1 object-contain shadow-sm rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

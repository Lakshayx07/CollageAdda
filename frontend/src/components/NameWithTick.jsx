"use client";
import React from 'react';
import { XP_TIERS } from '../config/xpConfig';

export default function NameWithTick({ name, tick, className = "", tickSize = 16, user }) {
  const displayTick = tick || user?.currentTick;
  const displayName = name || user?.name;

  if (!displayName) return null;

  let tickIcon = null;
  let tickTitle = "";

  if (displayTick) {
    const tier = XP_TIERS.find(t => t.id === displayTick);
    if (tier) {
      tickIcon = tier.icon;
      tickTitle = tier.label;
    }
  } else if (user) {
    const totalXp = (user.xp || 0) + (user.points || 0);
    for (let i = XP_TIERS.length - 1; i >= 0; i--) {
      if (totalXp >= XP_TIERS[i].xpRequired) {
        tickIcon = XP_TIERS[i].icon;
        tickTitle = XP_TIERS[i].label;
        break;
      }
    }
  }

  return (
    <span className={`inline-flex items-center align-middle ${className}`}>
      {displayName}
      {tickIcon && (
        <img 
          src={tickIcon} 
          alt={tickTitle} 
          title={tickTitle}
          className="ml-1 object-contain shadow-sm rounded-full"
          style={{ width: tickSize, height: tickSize }}
        />
      )}
    </span>
  );
}

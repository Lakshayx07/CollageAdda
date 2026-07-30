import React, { useState } from "react";
import { Bookmark, BookmarkCheck, Clock, CheckCircle2 } from "lucide-react";

export default function CollabCard({ card, currentUser, hasApplied, appStatus, onContribute }) {
  const [saved, setSaved] = useState(false);

  if (!card) return null;
  const isOwner = currentUser && (
    (currentUser?.id || "").toString() === (card?.user_id || "").toString() || 
    (currentUser?._id || "").toString() === (card?.user_id || "").toString()
  );
  const isApplied = !!hasApplied;

  const skillsArray = Array.isArray(card.skills) ? card.skills : (card.skills ? card.skills.split(",") : []);
  const rolesArray = Array.isArray(card.roles_needed) ? card.roles_needed : (card.roles_needed ? card.roles_needed.split(",") : []);

  const urgencyColors = {
    High: { color: "#DC2626", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)" },
    Medium: { color: "#D97706", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)" },
    Low: { color: "#059669", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.2)" }
  };
  const uColor = urgencyColors[card.urgency] || urgencyColors.Medium;

  return (
    <article
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        padding: 24, borderRadius: 24, border: "1.5px solid #ECE6DD",
        background: "#FFFFFF", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 18px 52px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "#D6A12C";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
        e.currentTarget.style.borderColor = "#ECE6DD";
      }}
    >
      {/* ── Header: Avatar, Name, Role, Urgency ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {card.poster_avatar ? (
            <img src={card.poster_avatar} alt="Avatar" style={{ width: 44, height: 44, borderRadius: 14, objectFit: "cover", border: "1px solid #ECE6DD" }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "#2E3440", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>
              {card.poster_name ? card.poster_name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#1B1B1B", lineHeight: 1.2 }}>
              {card.poster_name || "Campus Student"}
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#6F6F6F", marginTop: 2 }}>
              {card.year_major || "Student"}
            </p>
          </div>
        </div>
        
        {/* Urgency Badge */}
        <span style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "4px 8px", borderRadius: 8, border: `1px solid ${uColor.border}`,
          background: uColor.bg, color: uColor.color,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase"
        }}>
          <Clock size={10} />
          {card.urgency || "Medium"}
        </span>
      </div>

      {/* ── Project Title & Desc ── */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1B1B1B", lineHeight: 1.3, marginBottom: 6 }}>
          {card.building}
        </h3>
        {card.description && (
          <p style={{ fontSize: 14, color: "#6F6F6F", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {card.description}
          </p>
        )}
      </div>

      {/* ── Needed Roles ── */}
      {rolesArray.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2E3440", opacity: 0.8, marginBottom: 8 }}>
            Roles Needed
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rolesArray.map((r, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#D6A12C", background: "rgba(214,161,44,0.1)", border: "1px solid rgba(214,161,44,0.2)", padding: "4px 10px", borderRadius: 8 }}>
                {r.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Required Skills ── */}
      {skillsArray.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2E3440", opacity: 0.8, marginBottom: 8 }}>
            Required Skills
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {skillsArray.map((s, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "#FFFFFF", background: "#2E3440", padding: "4px 10px", borderRadius: 8 }}>
                {s.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to push buttons to bottom */}
      <div style={{ flex: 1 }} />

      {/* ── Buttons ── */}
      <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
        {isApplied ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, height: 44, borderRadius: 12, background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", color: "#059669", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <CheckCircle2 size={16} /> Applied
          </div>
        ) : isOwner ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 44, borderRadius: 12, background: "#F4F1EB", color: "#6F6F6F", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Your Card
          </div>
        ) : (
          <button
            onClick={() => onContribute(card)}
            style={{
              flex: 1, height: 44, borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg,#D6A12C,#C28F18)", color: "#FFF",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              boxShadow: "0 4px 14px rgba(214,161,44,0.3)",
            }}
          >
            Connect
          </button>
        )}
        
        <button
          onClick={() => setSaved(!saved)}
          style={{
            width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            border: saved ? "1.5px solid #D6A12C" : "1.5px solid #ECE6DD",
            background: saved ? "rgba(214,161,44,0.1)" : "#FFF",
            color: saved ? "#D6A12C" : "#6F6F6F",
            transition: "all 0.15s ease",
          }}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
    </article>
  );
}

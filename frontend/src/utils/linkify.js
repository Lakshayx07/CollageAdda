import React from "react";

export function renderTextWithLinks(text) {
  if (!text || typeof text !== "string") return text;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  const regex = new RegExp(urlRegex);
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const rawUrl = match[0];
    const cleanUrl = rawUrl.replace(/[.,;)]+$/, "");
    const trailingPunct = rawUrl.substring(cleanUrl.length);
    const href = cleanUrl.toLowerCase().startsWith("www.") ? `https://${cleanUrl}` : cleanUrl;

    parts.push(
      <React.Fragment key={match.index}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ color: "#2563eb" }}
          className="!text-[#2563eb] hover:!text-[#1d4ed8] underline font-semibold break-all transition-colors"
        >
          {cleanUrl}
        </a>
        {trailingPunct}
      </React.Fragment>
    );
    lastIndex = match.index + rawUrl.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

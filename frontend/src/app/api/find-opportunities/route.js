import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_RESULTS = 8;

const REQUIRED_FIELDS = ["title", "organization", "type", "eligibleBranches", "location", "deadline", "description", "applyLink"];

const cacheStore = globalThis.__campusAddaOpportunityCache || new Map();
globalThis.__campusAddaOpportunityCache = cacheStore;

const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
};

const cleanText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value).replace(/\s+/g, " ").trim() || fallback;
};

const normalizeProfile = (profile = {}) => {
  const types = Array.isArray(profile.type) ? profile.type : Array.isArray(profile.types) ? profile.types : [profile.type];

  return {
    course: cleanText(profile.course, "B.Tech"),
    branch: cleanText(profile.branch, "CSE"),
    year: cleanText(profile.year, "3rd Year"),
    type: types.map((item) => cleanText(item)).filter(Boolean).slice(0, 5),
    location: cleanText(profile.location, "India"),
    skills: cleanText(profile.skills),
  };
};

const createPrompt = (profile) => `
You are Opportunity Finder for Campus Adda, an Indian college student network.

Find current, real, student-relevant opportunities on the public web for this profile:
- Course: ${profile.course}
- Branch/Stream: ${profile.branch}
- Year of study: ${profile.year}
- Opportunity types: ${profile.type.join(", ")}
- Preferred location: ${profile.location}
- Skills/interests: ${profile.skills || "Not specified"}

Prioritize India-friendly opportunities, remote opportunities, official application pages, and opportunities with clear deadlines.
Use web search/grounding before answering. Return only opportunities that are likely active or recently announced.

Return STRICT JSON only. No markdown, no commentary, no citations outside JSON.
The JSON must be an array of up to ${MAX_RESULTS} objects. Every object must include exactly these fields:
[
  {
    "title": "string",
    "organization": "string",
    "type": "Internship | Hackathon | Workshop | Scholarship | Competition | Other",
    "eligibleBranches": ["string"],
    "location": "string",
    "deadline": "YYYY-MM-DD if known, otherwise a short text like Rolling/Ongoing/Not specified",
    "description": "1-2 concise lines explaining why this fits the student",
    "applyLink": "https://..."
  }
]
`;

const parseJsonArray = (text) => {
  const cleaned = cleanText(text)
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : parsed.opportunities || parsed.results || [];
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed : [];
  }
};

const sanitizeOpportunity = (item) => {
  const opportunity = {
    title: cleanText(item?.title),
    organization: cleanText(item?.organization),
    type: cleanText(item?.type, "Other"),
    eligibleBranches: Array.isArray(item?.eligibleBranches)
      ? item.eligibleBranches.map((branch) => cleanText(branch)).filter(Boolean).slice(0, 8)
      : [],
    location: cleanText(item?.location, "Remote / India"),
    deadline: cleanText(item?.deadline, "Not specified"),
    description: cleanText(item?.description),
    applyLink: cleanText(item?.applyLink),
  };

  if (!/^https?:\/\//i.test(opportunity.applyLink)) return null;
  if (!opportunity.title || !opportunity.description) return null;

  REQUIRED_FIELDS.forEach((field) => {
    if (opportunity[field] === undefined) opportunity[field] = field === "eligibleBranches" ? [] : "";
  });

  return opportunity;
};

const sanitizeResults = (items) => {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  return items
    .map(sanitizeOpportunity)
    .filter(Boolean)
    .filter((item) => {
      const key = `${item.title.toLowerCase()}|${item.organization.toLowerCase()}|${item.applyLink.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_RESULTS);
};

async function findWithGemini(profile) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: createPrompt(profile) }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`Gemini search failed: ${detail.slice(0, 240)}`);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
    return sanitizeResults(parseJsonArray(text));
  } catch (error) {
    console.error("Gemini error:", error);
    return null;
  }
}

async function findWithAnthropic(profile) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1800,
        temperature: 0.2,
        system: "You search the web for current student opportunities and output only strict JSON arrays.",
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
        messages: [{ role: "user", content: createPrompt(profile) }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error(`Claude search failed: ${detail.slice(0, 240)}`);
      return null;
    }

    const data = await response.json();
    const text = data?.content?.filter((block) => block.type === "text").map((block) => block.text || "").join("\n") || "";
    return sanitizeResults(parseJsonArray(text));
  } catch (error) {
    console.error("Anthropic error:", error);
    return null;
  }
}


export async function POST(request) {
  // Require a valid app JWT so anonymous traffic cannot exhaust API keys
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();
  try {
    const verifyRes = await fetch(`${apiBase}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Could not verify authentication." }, { status: 503 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const profile = normalizeProfile(body?.profile || body);

  if (!profile.course || !profile.branch || !profile.year || profile.type.length === 0) {
    return NextResponse.json({ error: "Course, branch, year, and at least one opportunity type are required." }, { status: 400 });
  }

  const cacheKey = stableStringify(profile);
  const cached = cacheStore.get(cacheKey);
  const shouldRefresh = Boolean(body?.refresh);

  if (!shouldRefresh && cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return NextResponse.json({ opportunities: cached.opportunities, cached: true, provider: cached.provider });
  }

  try {
    let provider = "gemini";
    let opportunities = await findWithGemini(profile);

    if (!opportunities) {
      provider = "anthropic";
      opportunities = await findWithAnthropic(profile);
    }

    if (!opportunities) {
      return NextResponse.json(
        {
          error: "API quota exceeded. To get real data, please update your Gemini API key, check your billing, or add an Anthropic API key.",
        },
        { status: 429 }
      );
    }

    cacheStore.set(cacheKey, { createdAt: Date.now(), opportunities, provider });

    return NextResponse.json({ opportunities, cached: false, provider });
  } catch (error) {
    console.error("Opportunity Finder error:", error);

    if (cached?.opportunities) {
      return NextResponse.json({
        opportunities: cached.opportunities,
        cached: true,
        stale: true,
        warning: "Live search failed, so cached results were returned.",
      });
    }

    return NextResponse.json(
      { error: "AI providers are currently unavailable. Please try again later." },
      { status: 502 }
    );
  }
}

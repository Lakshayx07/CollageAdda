import { supabase } from './supabase';

const UNIVERSITY_SHORT_NAMES = {
  "Delhi Technological University": "DTU",
  "O.P. Jindal Global University": "OP JINDAL",
  "Rishihood University": "RISHIHOOD",
  "Indian Institute of Technology Delhi": "IIT D",
  "Amity University": "AMITY",
  "Delhi University": "DU"
};

export function getShortUniversityName(fullName) {
  return UNIVERSITY_SHORT_NAMES[fullName] || fullName;
}

// Fallback mock function to use if the database is not configured or fails
function getMockTopConnections() {
  return [
    { university: "O.P. Jindal Global University", shortName: "OP JINDAL", count: 50, rank: 1 },
    { university: "Delhi Technological University", shortName: "DTU", count: 20, rank: 2 },
    { university: "Rishihood University", shortName: "RISHIHOOD", count: 12, rank: 3 }
  ];
}

export async function getTopUniversityConnections(userId, limit = 3) {
  if (!userId) return [];
  
  try {
    const token = localStorage.getItem("collegeadda_token");
    if (!token) return [];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    
    // Determine the ID to use
    let targetId = typeof userId === 'string' && userId.length > 5 ? userId : 'me';
    if (targetId === 'mock-user-123') targetId = 'me'; // Handle legacy mock id

    const res = await fetch(`${apiUrl}/api/users/${targetId}/university-connections`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      
      // Add short names
      const withShortNames = data.map(item => ({
        ...item,
        shortName: getShortUniversityName(item.university)
      }));
      
      // If there are no connections, don't show any badges (or fake badges)
      // We return empty array so that it won't highlight any fake university.
      return withShortNames;
    }
    
    return [];
  } catch (err) {
    console.error("Failed to compute university badges:", err);
    return [];
  }
}

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
  if (!supabase) return getMockTopConnections();
  
  try {
    // Attempt to fetch connections from the Supabase database
    // This assumes a 'connections' table where 'user_id' is the current user
    // and we join with 'users' table to get the 'university' of 'friend_id'
    const { data, error } = await supabase
      .from('connections')
      .select(`
        friend_id,
        users!connections_friend_id_fkey (
          university
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.warn("Error fetching connections, falling back to mock data:", error);
      return getMockTopConnections(); 
    }

    if (!data || data.length === 0) return getMockTopConnections();

    // Group by university and count
    const counts = {};
    data.forEach(conn => {
      // Handle array or object from one-to-one/many joins
      const friendUser = Array.isArray(conn.users) ? conn.users[0] : conn.users;
      const uni = friendUser?.university;
      if (uni) {
        counts[uni] = (counts[uni] || 0) + 1;
      }
    });

    if (Object.keys(counts).length === 0) return getMockTopConnections();

    // Convert to array, assign short names, sort, and rank
    const ranked = Object.entries(counts)
      .map(([university, count]) => ({
        university,
        shortName: getShortUniversityName(university),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }));

    return ranked;
  } catch (err) {
    console.error("Failed to compute university badges:", err);
    return getMockTopConnections();
  }
}

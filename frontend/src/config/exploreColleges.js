export const EXPLORE_PRIORITY_COLLEGES = [
  "Rishihood University",
  "School of Planning and Architecture (SPA)",
  "IIT Delhi",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "IIIT Delhi",
  "University of Delhi (DU)",
  "Jawaharlal Nehru University (JNU)",
  "YMCA Faridabad",
  "AIIMS, New Delhi",
  "Polaris University",
  "VIT University",
  "World University of Design (WUD), Sonipat",
  "O.P. Jindal Global University (JGU), Sonipat",
  "SRM University, Delhi-NCR (Sonepat)",
  "Ashoka University",
  "DY Patil University",
  "S-VYASA (NST Bangalore)",
  "St. Mary's University (NST Hyderabad)",
  "IIT Bombay",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT (BHU) Varanasi",
  "IIT Guwahati",
  "NIT Rourkela",
];

const PRIORITY_ALIASES = {
  "IIT Delhi": ["indian institute of technology (iit) delhi"],
  "Polaris University": ["pollaries university", "polaris"],
  "VIT University": ["vit vellore", "vellore institute of technology", "vit"],
  "World University of Design (WUD), Sonipat": [
    "world university of design",
    "wud",
  ],
  "O.P. Jindal Global University (JGU), Sonipat": [
    "op jindal global university",
    "o.p. jindal",
    "jgu",
  ],
  "SRM University, Delhi-NCR (Sonepat)": [
    "srm university",
    "srm delhi",
    "srm sonepat",
  ],
  "Ashoka University": ["ashoka"],
  "DY Patil University": [
    "d.y. patil",
    "dy patil",
    "dr. d.y. patil",
  ],
  "S-VYASA (NST Bangalore)": [
    "s-vyasa",
    "svyasa",
    "nst bangalore",
    "nst bengaluru",
  ],
  "St. Mary's University (NST Hyderabad)": [
    "st marys university",
    "st. mary's",
    "nst hyderabad",
  ],
};

function normalizeName(name) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function getSearchTokens(name) {
  const tokens = new Set([normalizeName(name)]);
  const acronymMatch = name.match(/\(([^)]+)\)/);
  if (acronymMatch) {
    tokens.add(normalizeName(acronymMatch[1]));
  }
  const withoutParens = normalizeName(name.replace(/\([^)]*\)/g, ""));
  if (withoutParens) {
    tokens.add(withoutParens);
  }
  return tokens;
}

function collegeMatchesPriority(collegeName, priorityName) {
  const collegeTokens = getSearchTokens(collegeName);
  const priorityTokens = getSearchTokens(priorityName);

  for (const priorityToken of priorityTokens) {
    for (const collegeToken of collegeTokens) {
      if (
        collegeToken === priorityToken ||
        collegeToken.includes(priorityToken) ||
        priorityToken.includes(collegeToken)
      ) {
        return true;
      }
    }
  }

  const normalizedCollege = normalizeName(collegeName);
  const aliases = PRIORITY_ALIASES[priorityName] || [];
  return aliases.some(
    (alias) =>
      normalizedCollege === alias ||
      normalizedCollege.includes(alias) ||
      alias.includes(normalizedCollege)
  );
}

function findCollegeForPriority(allColleges, priorityName, usedIds) {
  const candidates = allColleges.filter((college) => {
    const id = college._id || college.id;
    return !usedIds.has(id) && collegeMatchesPriority(college.name, priorityName);
  });

  if (candidates.length === 0) {
    return null;
  }

  const normalizedPriority = normalizeName(priorityName);
  const exactMatch = candidates.find(
    (college) => normalizeName(college.name) === normalizedPriority
  );
  return exactMatch || candidates[0];
}

function buildExplorePool(allColleges) {
  const pool = [];
  const usedIds = new Set();

  for (const priorityName of EXPLORE_PRIORITY_COLLEGES) {
    const match = findCollegeForPriority(allColleges, priorityName, usedIds);
    if (match) {
      pool.push(match);
      usedIds.add(match._id || match.id);
    }
  }

  return pool;
}

export function getExploreCollegePool(allColleges) {
  return buildExplorePool(allColleges);
}

export function getExploreColleges(allColleges, filters = {}) {
  const {
    search = "",
    filterCity = "All",
    filterCategory = "All",
    sortBy = "Default",
  } = filters;

  let filtered = buildExplorePool(allColleges).filter((college) => {
    if (search && !college.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterCity !== "All" && college.location !== filterCity) {
      return false;
    }
    if (filterCategory !== "All" && (college.category || "General") !== filterCategory) {
      return false;
    }
    return true;
  });

  if (sortBy === "Most Students") {
    filtered.sort((a, b) => (b.realStudentCount || b.studentsData?.length || 0) - (a.realStudentCount || a.studentsData?.length || 0));
  } else if (sortBy === "Most Active") {
    filtered.sort((a, b) => (b.postsData?.length || 0) - (a.postsData?.length || 0));
  } else if (sortBy === "Trending This Week") {
    filtered.sort((a, b) => ((b.postsData?.length || 0) * 2 + (b.studentsData?.length || 0)) - ((a.postsData?.length || 0) * 2 + (a.studentsData?.length || 0)));
  } else if (sortBy === "Newest Added") {
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return filtered;
}

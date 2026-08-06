// Maps the actual DB/API college name → the display name shown on cards
export const COLLEGE_DISPLAY_NAME_OVERRIDES = {
  "Rishihood University": "Rishihood University (NST SONIPAT)",
  "DY Patil University": "Ajeenkya DY Patil (NST PUNE)",
  "Dr. D.Y. Patil University": "Ajeenkya DY Patil (NST PUNE)",
  "Ajeenkya DY Patil University": "Ajeenkya DY Patil (NST PUNE)",
};

// Returns the overridden display name for a college, or the original name
export function getCollegeDisplayName(college) {
  if (!college?.name) return "";
  return COLLEGE_DISPLAY_NAME_OVERRIDES[college.name] || college.name;
}

export const EXPLORE_PRIORITY_COLLEGES = [
  "Rishihood University (NST SONIPAT)",
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
  "Ajeenkya DY Patil (NST PUNE)",
  "S-VYASA (NST Bangalore)",
  "Vedam School of Technology",
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
  "Ajeenkya DY Patil (NST PUNE)": [
    "d.y. patil",
    "dy patil",
    "dr. d.y. patil",
    "ajeenkya dy patil",
    "ajeenkya d.y. patil",
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
  "Vedam School of Technology": [
    "vedam",
    "vedam school",
    "vedam school of technology",
  ],
  "Rishihood University (NST SONIPAT)": [
    "rishihood university",
    "rishihood",
    "nst sonipat",
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

// Static stub entries for colleges not yet in the DB (keyed by display name)
const STATIC_COLLEGE_STUBS = {
  "Vedam School of Technology": {
    _id: "static-vedam-school-of-technology",
    name: "Vedam School of Technology",
    location: "Telangana",
    category: "Engineering",
    banner: "https://d13loartjoc1yn.cloudfront.net/upload/institute/images/large/1741756766Campus%203.webp",
    studentsData: [],
    postsData: [],
    realStudentCount: 0,
    followersCount: 0,
  },
};

// Same stubs keyed by _id — used for fast lookup by URL param
export const STATIC_COLLEGE_STUBS_BY_ID = Object.fromEntries(
  Object.values(STATIC_COLLEGE_STUBS).map((s) => [s._id, s])
);

function buildExplorePool(allColleges) {
  const pool = [];
  const usedIds = new Set();

  for (const priorityName of EXPLORE_PRIORITY_COLLEGES) {
    const match = findCollegeForPriority(allColleges, priorityName, usedIds);
    if (match) {
      pool.push(match);
      usedIds.add(match._id || match.id);
    } else if (STATIC_COLLEGE_STUBS[priorityName]) {
      // Inject static stub if not found in API data
      const stub = STATIC_COLLEGE_STUBS[priorityName];
      if (!usedIds.has(stub._id)) {
        pool.push(stub);
        usedIds.add(stub._id);
      }
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

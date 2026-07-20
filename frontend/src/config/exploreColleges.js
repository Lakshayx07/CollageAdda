export const EXPLORE_PRIORITY_COLLEGES = [
  "Rishihood University",
  "School of Planning and Architecture (SPA)",
  "IIT Delhi",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "IIIT Delhi",
  "University of Delhi (DU)",
  "Jawaharlal Nehru University (JNU)",
  "Jamia Millia Islamia",
  "Guru Gobind Singh Indraprastha University (IPU)",
  "Kurukshetra University",
  "YMCA Faridabad",
  "IIT Bombay",
  "IIT Kanpur",
  "IIT Kharagpur",
  "IIT Roorkee",
  "IIT (BHU) Varanasi",
  "IIT Guwahati",
  "NIT Rourkela",
  "AIIMS, New Delhi",
];

const PRIORITY_ALIASES = {
  "IIT Delhi": ["indian institute of technology (iit) delhi"],
  "Guru Gobind Singh Indraprastha University (IPU)": [
    "guru gobind singh indraprastha university (ggsipu)",
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
    filterStream = "All",
    streamMap = {},
  } = filters;

  return buildExplorePool(allColleges).filter((college) => {
    if (search && !college.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (filterCity !== "All" && college.location !== filterCity) {
      return false;
    }
    if (filterCategory !== "All" && (college.category || "General") !== filterCategory) {
      return false;
    }
    if (filterStream !== "All") {
      const collegeStream = streamMap[college.category || "General"] || "Engineering";
      if (collegeStream !== filterStream) {
        return false;
      }
    }
    return true;
  });
}

const boyAvatars = [
  "/default-avatars/boy-1.png",
  "/default-avatars/boy-2.png",
  "/default-avatars/boy-3.png",
  "/default-avatars/boy-4.png",
  "/default-avatars/boy-5.png",
  "/default-avatars/boy-6.png",
];

const girlAvatars = [
  "/default-avatars/girl-1.png",
  "/default-avatars/girl-2.png",
  "/default-avatars/girl-3.png",
  "/default-avatars/girl-4.png",
];

const boyNames = new Set([
  "aarav", "aditya", "aman", "amit", "anand", "ankit", "ansh", "arjun", "aryan",
  "ayush", "dev", "dhruv", "gautam", "harsh", "ishaan", "kabir", "karan",
  "krishna", "lakshay", "manav", "mohit", "naman", "neeraj", "pranav", "rahul",
  "raj", "rishi", "rohan", "sahil", "samarth", "shivam", "siddharth", "sourav",
  "tanish", "utsav", "varun", "ved", "vishal", "yash",
]);

const girlNames = new Set([
  "aanya", "aditi", "ananya", "anjali", "anushka", "avani", "diya", "isha",
  "kavya", "khushi", "kriti", "meera", "muskan", "nandini", "neha", "nisha",
  "priya", "riya", "saanvi", "sakshi", "shreya", "simran", "sneha", "tanvi",
  "trisha", "vaishnavi", "zoya",
]);

const hashString = (value = "") => {
  return String(value).split("").reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }, 0);
};

const firstName = (name = "") => String(name).trim().split(/\s+/)[0]?.toLowerCase() || "";

export const inferAvatarGender = (name = "") => {
  const first = firstName(name);
  if (girlNames.has(first)) return "girl";
  if (boyNames.has(first)) return "boy";
  if (/(a|i|ya|ika|ita|ani|sha|shi|na|ni)$/.test(first)) return "girl";
  return "boy";
};

export const getDefaultAvatar = (name = "Campus Student", id = "") => {
  const gender = inferAvatarGender(name);
  const options = gender === "girl" ? girlAvatars : boyAvatars;
  const key = `${name || "Campus Student"}-${id || ""}`;
  const index = Math.abs(hashString(key)) % options.length;
  return options[index];
};

const isInitialsAvatar = (src = "") => {
  const value = String(src).toLowerCase();
  return [
    "ui-avatars.com",
    "dicebear",
    "/initials/",
    "avatar.iran.liara.run",
    "avatar.vercel.sh",
    "username=",
  ].some(marker => value.includes(marker));
};

const resolveProfilePicUrl = (src = "") => {
  const value = String(src || "").trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (value.startsWith("/api/")) {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001").trim();
    return `${apiUrl}${value}`;
  }
  return value;
};

export const getAvatarSrc = (profilePic, name, id) => {
  if (!profilePic || profilePic === "null" || profilePic === "undefined") {
    return getDefaultAvatar(name, id);
  }
  return !isInitialsAvatar(profilePic) ? resolveProfilePicUrl(profilePic) : getDefaultAvatar(name, id);
};

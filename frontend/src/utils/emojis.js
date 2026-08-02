export const getInterestEmoji = (interestStr) => {
  if (!interestStr) return "✨";
  const str = interestStr.toLowerCase();
  
  // Sports
  if (str.includes("cricket")) return "🏏";
  if (str.includes("football") || str.includes("soccer")) return "⚽";
  if (str.includes("basketball")) return "🏀";
  if (str.includes("tennis")) return "🎾";
  if (str.includes("badminton")) return "🏸";
  if (str.includes("volleyball")) return "🏐";
  if (str.includes("table tennis") || str.includes("ping pong")) return "🏓";
  if (str.includes("swimming")) return "🏊";
  if (str.includes("running") || str.includes("marathon")) return "🏃";
  if (str.includes("cycling")) return "🚴";
  if (str.includes("chess")) return "♟️";
  if (str.includes("boxing") || str.includes("mma")) return "🥊";
  if (str.includes("gym") || str.includes("fitness") || str.includes("workout")) return "🏋️";
  
  // Interests/Hobbies
  if (str.includes("music") || str.includes("singing") || str.includes("guitar") || str.includes("piano")) return "🎵";
  if (str.includes("dance") || str.includes("dancing")) return "💃";
  if (str.includes("art") || str.includes("drawing") || str.includes("painting")) return "🎨";
  if (str.includes("photography") || str.includes("photo")) return "📸";
  if (str.includes("movie") || str.includes("film") || str.includes("cinema") || str.includes("acting")) return "🎬";
  if (str.includes("reading") || str.includes("book")) return "📚";
  if (str.includes("writing") || str.includes("poetry")) return "✍️";
  if (str.includes("gaming") || str.includes("video game") || str.includes("esport")) return "🎮";
  if (str.includes("travel") || str.includes("explore") || str.includes("adventure")) return "✈️";
  if (str.includes("cook") || str.includes("baking") || str.includes("food") || str.includes("culinary")) return "🍳";
  if (str.includes("coding") || str.includes("programming") || str.includes("software") || str.includes("developer") || str.includes("tech") || str.includes("hackathon")) return "💻";
  if (str.includes("business") || str.includes("startup") || str.includes("entrepreneur") || str.includes("finance") || str.includes("investing") || str.includes("trading") || str.includes("stock")) return "📈";
  if (str.includes("fashion") || str.includes("style") || str.includes("modeling")) return "👗";
  if (str.includes("astronomy") || str.includes("space")) return "🔭";
  if (str.includes("nature") || str.includes("environment")) return "🌿";
  if (str.includes("animal") || str.includes("pet") || str.includes("dog") || str.includes("cat")) return "🐾";
  if (str.includes("anime") || str.includes("manga") || str.includes("otaku")) return "🌸";
  if (str.includes("politics") || str.includes("history")) return "🏛️";
  if (str.includes("science")) return "🔬";
  if (str.includes("math")) return "🧮";
  if (str.includes("robotics")) return "🤖";
  if (str.includes("ai") || str.includes("artificial intelligence") || str.includes("machine learning")) return "🧠";
  if (str.includes("yoga") || str.includes("meditation") || str.includes("spiritual")) return "🧘";
  if (str.includes("design") || str.includes("ui") || str.includes("ux")) return "✨";
  if (str.includes("marketing") || str.includes("social media") || str.includes("content creation")) return "📱";
  if (str.includes("crypto") || str.includes("bitcoin") || str.includes("web3") || str.includes("blockchain")) return "🪙";
  if (str.includes("debate") || str.includes("public speaking")) return "🗣️";
  if (str.includes("volunteer") || str.includes("social work") || str.includes("community")) return "🤝";

  // Default fallback for interests
  return "✨";
};

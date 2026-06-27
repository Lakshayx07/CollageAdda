const fs = require('fs');
const path = require('path');

const skippedFiles = [
  'src/app/layout.js',
  'src/context/ThemeContext.js',
  'src/components/Sidebar.jsx',
  'src/components/BottomNav.jsx',
  'src/app/globals.css'
].map(p => path.resolve(p));

const replacements = [
  // Inputs/Textareas that ended up with bg-black
  { pattern: /bg-black(\s+border\s+border-\[#E8E6E0\])/g, replacement: 'bg-[#F3F2EE]$1' },
  { pattern: /bg-black(\s+p-[1234]\s+rounded)/g, replacement: 'bg-[#F3F2EE]$1' },
  
  // Modals / backdrops
  { pattern: /bg-black\/90/g, replacement: 'bg-black/50' },
  { pattern: /bg-black\/80/g, replacement: 'bg-black/40' },
  
  // Specific dark hex codes
  { pattern: /bg-\[#040814\]/g, replacement: 'bg-[#FAFAF8]' },
  { pattern: /bg-\[#060B18\]\/60/g, replacement: 'bg-white/80' },
  { pattern: /bg-\[#080C11\]/g, replacement: 'bg-white' },
  { pattern: /bg-\[#0b0c16\]/g, replacement: 'bg-[#F9F8F5]' },
  { pattern: /border-\[#0b0c16\]/g, replacement: 'border-white' },
  { pattern: /#1A0A2E/g, replacement: '#FFFFFF' },
  { pattern: /#6C3AFF/g, replacement: '#C8922A' },
  
  // Gradients
  { pattern: /from-purple-[456]00/g, replacement: 'from-[#C8922A]' },
  { pattern: /to-purple-[456]00/g, replacement: 'to-[#D4A843]' },
  { pattern: /via-purple-[456]00/g, replacement: 'via-[#D4A843]' },
  { pattern: /from-indigo-[4567]00/g, replacement: 'from-[#C8922A]' },
  { pattern: /to-indigo-[4567]00/g, replacement: 'to-[#D4A843]' },
  { pattern: /from-fuchsia-[456]00/g, replacement: 'from-[#D4A843]' },
  { pattern: /to-cyan-[456]00/g, replacement: 'to-[#C8922A]' },
  { pattern: /from-cyan-[456]00/g, replacement: 'from-[#D4A843]' },
  { pattern: /via-fuchsia-[456]00/g, replacement: 'via-[#D4A843]' },
  { pattern: /from-blue-[89]00/g, replacement: 'from-[#FFF8EC]' },
  { pattern: /to-blue-[56]00/g, replacement: 'to-[#C8922A]' },
  { pattern: /from-pink-[456]00/g, replacement: 'from-[#C8922A]' },
  { pattern: /to-rose-[456]00/g, replacement: 'to-[#D4A843]' },
  { pattern: /from-amber-[45]00/g, replacement: 'from-[#C8922A]' },
  { pattern: /to-orange-[56]00/g, replacement: 'to-[#D4A843]' },
  
  // Gradient partial opacities
  { pattern: /from-purple-600\/[0-9]+/g, replacement: 'from-[#C8922A]/20' },
  { pattern: /to-indigo-600\/[0-9]+/g, replacement: 'to-[#D4A843]/20' },
  { pattern: /via-transparent/g, replacement: 'via-transparent' }, // keep
  
  // Shadows
  { pattern: /shadow-\[0_0_30px_rgba\(139,92,246,0\.5\)\]/g, replacement: 'shadow-[0_0_30px_rgba(200,146,42,0.3)]' },
  { pattern: /shadow-cyan-500\/20/g, replacement: 'shadow-[0_4px_14px_rgba(200,146,42,0.15)]' },
  { pattern: /shadow-pink-500\/20/g, replacement: 'shadow-[0_4px_14px_rgba(200,146,42,0.15)]' },
  { pattern: /shadow-purple-500\/20/g, replacement: 'shadow-[0_4px_14px_rgba(200,146,42,0.15)]' },
  { pattern: /shadow-amber-500\/30/g, replacement: 'shadow-[0_4px_14px_rgba(200,146,42,0.15)]' },
  
  // Texts
  { pattern: /text-purple-[456]00/g, replacement: 'text-[#C8922A]' },
  { pattern: /text-cyan-[456]00/g, replacement: 'text-[#C8922A]' },
  { pattern: /text-indigo-[456]00/g, replacement: 'text-[#C8922A]' },
  
  // Borders
  { pattern: /border-cyan-[456]00\/20/g, replacement: 'border-[#E8E6E0]' }
];

function processFile(filePath) {
  if (skippedFiles.includes(path.resolve(filePath))) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  for (const { pattern, replacement } of replacements) {
    newContent = newContent.replace(pattern, replacement);
  }
  
  if (content !== newContent) {
    console.log(`Updated ${filePath}`);
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  }
}

walkDir('src');
console.log('Migration phase 3 complete.');

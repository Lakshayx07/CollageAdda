/**
 * Seed allowed email domains for known colleges.
 * Run once: node seed-college-domains.mjs
 *
 * Requires MONGO_URI (or MONGODB_URI) in the environment (via .env or shell).
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MONGO_URI environment variable is required.');
  process.exit(1);
}

const collegeSchema = new mongoose.Schema({
  name: String,
  allowedEmailDomains: { type: [String], default: [] }
}, { strict: false });
const College = mongoose.model('College', collegeSchema);

const DOMAIN_MAP = [
  { name: /rishihood/i,                       domains: ['rishihood.edu.in'] },
  { name: /jindal global|jgu/i,               domains: ['jgu.edu.in', 'jagannathuniversity.org'] },
  { name: /university of delhi|du\b/i,        domains: ['du.ac.in'] },
  { name: /iit delhi/i,                       domains: ['iitd.ac.in'] },
  { name: /jamia millia/i,                    domains: ['jmi.ac.in'] },
  { name: /jawaharlal nehru university|jnu/i, domains: ['jnu.ac.in'] },
  { name: /delhi technological|dtu/i,         domains: ['dtu.ac.in'] },
  { name: /nsut|netaji subhas/i,              domains: ['nsut.ac.in'] },
  { name: /iiit delhi/i,                      domains: ['iiitd.ac.in'] },
  { name: /ip university|ipu|indraprastha/i,  domains: ['ipu.ac.in', 'ggsipu.ac.in'] },
  { name: /kurukshetra/i,                     domains: ['kuk.ac.in'] },
  { name: /school of planning|spa\b/i,        domains: ['spa.ac.in'] },
  { name: /ymca faridabad/i,                  domains: ['jcboseust.ac.in'] },
];

await mongoose.connect(mongoUri);
console.log('Connected to MongoDB');

const colleges = await College.find({});
let updated = 0;

for (const college of colleges) {
  for (const { name: pattern, domains } of DOMAIN_MAP) {
    if (pattern.test(college.name)) {
      const existing = college.allowedEmailDomains || [];
      const merged = [...new Set([...existing, ...domains])];
      if (merged.length !== existing.length) {
        college.allowedEmailDomains = merged;
        await college.save();
        console.log(`  Updated "${college.name}" → ${merged.join(', ')}`);
        updated++;
      }
      break;
    }
  }
}

console.log(`\nDone. Updated ${updated} college(s).`);
console.log('Colleges with no domains configured will block new signups until you add their domains.');
await mongoose.disconnect();

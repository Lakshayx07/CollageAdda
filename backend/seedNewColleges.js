import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './src/models/College.js';
import connectDB from './src/config/db.js';

dotenv.config();

// ─── Helper ──────────────────────────────────────────────────────────────────
const normalize = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');

// ─── Placeholder banner (used for colleges without real banners yet) ─────────
const PLACEHOLDER_BANNER =
  'https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=800&q=80';

// ─── NEW colleges to insert ───────────────────────────────────────────────────
// (colleges already in the DB — DTU, IIIT Delhi, IIT Delhi, NSUT,
//  Rishihood University, SPA — are listed in PATCHES below, not here)
const newColleges = [
  // ── IITs ────────────────────────────────────────────────────────────────────
  {
    name: 'IIT (BHU) Varanasi',
    location: 'Varanasi, Uttar Pradesh',
    students: '6,000+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1596112516phpXUCjDJ.jpeg',
    description: 'Indian Institute of Technology (BHU) Varanasi — a premier engineering institute.',
    category: 'IIT',
  },
  {
    name: 'IIT Bombay',
    location: 'Powai, Mumbai',
    students: '10,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548392894phpRELhxd.jpeg',
    description: 'Indian Institute of Technology Bombay — one of India\'s top engineering institutes.',
    category: 'IIT',
  },
  {
    name: 'IIT Guwahati',
    location: 'Guwahati, Assam',
    students: '5,500+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548392894phpRELhxd.jpeg',
    description: 'Indian Institute of Technology Guwahati.',
    category: 'IIT',
  },
  {
    name: 'IIT Indore',
    location: 'Indore, Madhya Pradesh',
    students: '3,000+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: PLACEHOLDER_BANNER,
    description: 'Indian Institute of Technology Indore.',
    category: 'IIT',
  },
  {
    name: 'IIT Kanpur',
    location: 'Kanpur, Uttar Pradesh',
    students: '7,500+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548392894phpRELhxd.jpeg',
    description: 'Indian Institute of Technology Kanpur.',
    category: 'IIT',
  },
  {
    name: 'IIT Kharagpur',
    location: 'Kharagpur, West Bengal',
    students: '12,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548392894phpRELhxd.jpeg',
    description: 'Indian Institute of Technology Kharagpur — the first IIT in India.',
    category: 'IIT',
  },
  {
    name: 'IIT Mandi',
    location: 'Mandi, Himachal Pradesh',
    students: '2,500+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: PLACEHOLDER_BANNER,
    description: 'Indian Institute of Technology Mandi.',
    category: 'IIT',
  },
  {
    name: 'IIT Ropar',
    location: 'Rupnagar, Punjab',
    students: '2,000+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: PLACEHOLDER_BANNER,
    description: 'Indian Institute of Technology Ropar.',
    category: 'IIT',
  },
  {
    name: 'IIT Roorkee',
    location: 'Roorkee, Uttarakhand',
    students: '8,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548392894phpRELhxd.jpeg',
    description: 'Indian Institute of Technology Roorkee — one of the oldest technical institutes.',
    category: 'IIT',
  },

  // ── NITs ────────────────────────────────────────────────────────────────────
  {
    name: 'MANIT Bhopal',
    location: 'Bhopal, Madhya Pradesh',
    students: '5,000+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'Maulana Azad National Institute of Technology Bhopal.',
    category: 'NIT',
  },
  {
    name: 'MNIT Jaipur',
    location: 'Jaipur, Rajasthan',
    students: '5,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'Malaviya National Institute of Technology Jaipur.',
    category: 'NIT',
  },
  {
    name: 'MNNIT Allahabad / Prayagraj',
    location: 'Prayagraj, Uttar Pradesh',
    students: '4,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'Motilal Nehru National Institute of Technology Allahabad.',
    category: 'NIT',
  },
  {
    name: 'NIT Durgapur',
    location: 'Durgapur, West Bengal',
    students: '4,000+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'National Institute of Technology Durgapur.',
    category: 'NIT',
  },
  {
    name: 'NIT Jamshedpur',
    location: 'Jamshedpur, Jharkhand',
    students: '3,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'National Institute of Technology Jamshedpur.',
    category: 'NIT',
  },
  {
    name: 'NIT Kurukshetra',
    location: 'Kurukshetra, Haryana',
    students: '4,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'National Institute of Technology Kurukshetra.',
    category: 'NIT',
  },
  {
    name: 'NIT Patna',
    location: 'Patna, Bihar',
    students: '3,000+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'National Institute of Technology Patna.',
    category: 'NIT',
  },
  {
    name: 'NIT Rourkela',
    location: 'Rourkela, Odisha',
    students: '5,000+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'National Institute of Technology Rourkela.',
    category: 'NIT',
  },
  {
    name: 'NIT Silchar',
    location: 'Silchar, Assam',
    students: '3,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'National Institute of Technology Silchar.',
    category: 'NIT',
  },
  {
    name: 'VNIT Nagpur',
    location: 'Nagpur, Maharashtra',
    students: '4,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: PLACEHOLDER_BANNER,
    description: 'Visvesvaraya National Institute of Technology Nagpur.',
    category: 'NIT',
  },

  // ── Medical ──────────────────────────────────────────────────────────────────
  {
    name: 'AIIMS, New Delhi',
    location: 'Ansari Nagar, New Delhi',
    students: '2,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548148474phpxwYb2L.jpeg',
    description: 'All India Institute of Medical Sciences — India\'s premier medical institution.',
    category: 'Medical',
  },
  {
    name: 'ESIC Medical College, Faridabad',
    location: 'Faridabad, Haryana',
    students: '1,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'ESIC Medical College & Hospital, Faridabad.',
    category: 'Medical',
  },
  {
    name: 'Kalpana Chawla Government Medical College, Karnal',
    location: 'Karnal, Haryana',
    students: '1,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'Kalpana Chawla Government Medical College, Karnal.',
    category: 'Medical',
  },
  {
    name: 'Lady Hardinge Medical College (LHMC)',
    location: 'New Delhi',
    students: '1,200+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548148474phpxwYb2L.jpeg',
    description: 'Lady Hardinge Medical College — a premier women\'s medical college in New Delhi.',
    category: 'Medical',
  },
  {
    name: 'Maharishi Markandeshwar (Deemed University), Mullana',
    location: 'Mullana, Haryana',
    students: '5,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'Maharishi Markandeshwar (Deemed to be University), Mullana-Ambala.',
    category: 'Medical',
  },
  {
    name: 'Maulana Azad Medical College (MAMC)',
    location: 'New Delhi',
    students: '1,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548148474phpxwYb2L.jpeg',
    description: 'Maulana Azad Medical College — one of India\'s premier medical colleges.',
    category: 'Medical',
  },
  {
    name: 'PGIMS Rohtak',
    location: 'Rohtak, Haryana',
    students: '1,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'Pt. B.D. Sharma Post Graduate Institute of Medical Sciences, Rohtak.',
    category: 'Medical',
  },
  {
    name: 'SGT Medical College, Gurgaon',
    location: 'Gurugram, Haryana',
    students: '1,200+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'SGT Medical College, Hospital & Research Institute, Gurgaon.',
    category: 'Medical',
  },
  {
    name: 'University College of Medical Sciences (UCMS)',
    location: 'New Delhi',
    students: '1,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'University College of Medical Sciences, Delhi.',
    category: 'Medical',
  },
  {
    name: 'Vardhman Mahavir Medical College (VMMC) & Safdarjung Hospital',
    location: 'New Delhi',
    students: '1,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: PLACEHOLDER_BANNER,
    description: 'Vardhman Mahavir Medical College & Safdarjung Hospital, New Delhi.',
    category: 'Medical',
  },

  // ── Law ──────────────────────────────────────────────────────────────────────
  {
    name: 'Amity Law School',
    location: 'Noida, Uttar Pradesh',
    students: '3,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'Amity Law School — one of India\'s leading law schools.',
    category: 'Law',
  },
  {
    name: 'Bhagat Phool Singh Mahila Vishwavidyalaya (BPSMV)',
    location: 'Khanpur Kalan, Haryana',
    students: '5,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'BPS Mahila Vishwavidyalaya — a women\'s university with a law faculty.',
    category: 'Law',
  },
  {
    name: 'Faculty of Law, Jamia Millia Islamia',
    location: 'Jamia Nagar, New Delhi',
    students: '1,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'Faculty of Law at Jamia Millia Islamia, New Delhi.',
    category: 'Law',
  },
  {
    name: 'Faculty of Law, University of Delhi',
    location: 'New Delhi',
    students: '2,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'Faculty of Law, University of Delhi — one of India\'s oldest law schools.',
    category: 'Law',
  },
  {
    name: 'Guru Gobind Singh Indraprastha University (GGSIPU)',
    location: 'Dwarka, New Delhi',
    students: '75,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://images.indianexpress.com/2025/02/ggsipu-1.jpg',
    description: 'GGSIPU — state university with prominent law programs.',
    category: 'Law',
  },
  {
    name: 'Jindal Global Law School (JGLS)',
    location: 'Sonipat, NCR',
    students: '4,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548148474phpxwYb2L.jpeg',
    description: 'Jindal Global Law School — a top private law school in India.',
    category: 'Law',
  },
  {
    name: 'Lloyd Law College, Greater Noida',
    location: 'Greater Noida, Uttar Pradesh',
    students: '2,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'Lloyd Law College, Greater Noida.',
    category: 'Law',
  },
  {
    name: 'National Law University, Delhi (NLU Delhi)',
    location: 'New Delhi',
    students: '1,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'National Law University Delhi — a premier national law school.',
    category: 'Law',
  },
  {
    name: 'Puran Murti College of Law (PMCL)',
    location: 'Sonipat, Haryana',
    students: '500+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'Puran Murti College of Law, Sonipat.',
    category: 'Law',
  },
  {
    name: 'SRM University, Delhi-NCR (Sonepat)',
    location: 'Sonipat, NCR',
    students: '8,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: PLACEHOLDER_BANNER,
    description: 'SRM University, Delhi-NCR — offering law programs.',
    category: 'Law',
  },

  // ── Design ───────────────────────────────────────────────────────────────────
  {
    name: 'Amity University, Gurugram',
    location: 'Gurugram, Haryana',
    students: '10,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: PLACEHOLDER_BANNER,
    description: 'Amity University Gurugram — offering design and creative programs.',
    category: 'Design',
  },
  {
    name: 'ICAT Design & Media College, Gurugram',
    location: 'Gurugram, Haryana',
    students: '2,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: PLACEHOLDER_BANNER,
    description: 'ICAT Design & Media College, Gurugram.',
    category: 'Design',
  },
  {
    name: 'NIFT New Delhi',
    location: 'Hauz Khas, New Delhi',
    students: '3,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://images.shiksha.com/mediadata/images/articles/1548148474phpxwYb2L.jpeg',
    description: 'National Institute of Fashion Technology, New Delhi.',
    category: 'Design',
  },
  {
    name: 'O.P. Jindal Global University (JGU), Sonipat',
    location: 'Sonipat, NCR',
    students: '8,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: PLACEHOLDER_BANNER,
    description: 'O.P. Jindal Global University — offering design and creative arts programs.',
    category: 'Design',
  },
  {
    name: 'Pearl Academy, Delhi',
    location: 'New Delhi',
    students: '3,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: PLACEHOLDER_BANNER,
    description: 'Pearl Academy — India\'s premier design & fashion institution.',
    category: 'Design',
  },
  {
    name: 'Pearl Academy, Gurugram',
    location: 'Gurugram, Haryana',
    students: '2,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: PLACEHOLDER_BANNER,
    description: 'Pearl Academy Gurugram campus.',
    category: 'Design',
  },
  {
    name: 'World University of Design (WUD), Sonipat',
    location: 'Sonipat, NCR',
    students: '2,500+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: PLACEHOLDER_BANNER,
    description: 'World University of Design — specialised design university in NCR.',
    category: 'Design',
  },
];

// ─── Category patches for EXISTING colleges ──────────────────────────────────
// (these are already in DB — we only update their category field)
const patches = [
  { name: 'IIT Delhi', category: 'IIT' },
  { name: 'Indian Institute of Technology (IIT) Delhi', category: 'IIT' },
  { name: 'Delhi Technological University (DTU)', category: 'General' },
  { name: 'Netaji Subhas University of Technology (NSUT)', category: 'General' },
  { name: 'IIIT Delhi', category: 'General' },
  { name: 'Rishihood University', category: 'General' },
  { name: 'School of Planning and Architecture (SPA)', category: 'General' },
  { name: 'University of Delhi (DU)', category: 'General' },
  { name: 'Jawaharlal Nehru University (JNU)', category: 'General' },
  { name: 'Jamia Millia Islamia', category: 'General' },
  { name: 'Guru Gobind Singh Indraprastha University (IPU)', category: 'Law' },
  { name: 'Kurukshetra University', category: 'General' },
  { name: 'YMCA Faridabad', category: 'General' },
  { name: 'Stanford University', category: 'General' },
  { name: 'Massachusetts Institute of Technology', category: 'IIT' },
  { name: 'Oxford University', category: 'General' },
  { name: 'BITS Pilani', category: 'General' },
];

// ─── Main ────────────────────────────────────────────────────────────────────
const seedNewColleges = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.\n');

    // Step 1: Patch categories on existing colleges
    console.log('── Patching categories on existing colleges ──');
    for (const patch of patches) {
      const result = await College.updateOne(
        { name: { $regex: new RegExp(`^${patch.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { $set: { category: patch.category } }
      );
      if (result.matchedCount > 0) {
        console.log(`  ✓ Patched: ${patch.name} → ${patch.category}`);
      } else {
        console.log(`  ⚠ Not found (skip): ${patch.name}`);
      }
    }

    // Step 2: Load all existing names for deduplication
    const existing = await College.find({}).select('name');
    const existingNames = new Set(existing.map(c => normalize(c.name)));

    console.log(`\n── Inserting new colleges (${newColleges.length} entries) ──`);
    let added = 0;
    let skipped = 0;

    for (const college of newColleges) {
      if (existingNames.has(normalize(college.name))) {
        // Already in DB — only patch category
        await College.updateOne(
          { name: { $regex: new RegExp(`^${college.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { $set: { category: college.category } }
        );
        console.log(`  ↩ Already exists (category patched): ${college.name}`);
        skipped++;
      } else {
        await College.create({
          ...college,
          posts: '0+',
          departments: 5,
        });
        console.log(`  ✚ Added: ${college.name}`);
        added++;
      }
    }

    console.log(`\n── Done ──`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped (already existed): ${skipped}`);
    console.log(`  Patched existing: ${patches.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding colleges:', error);
    process.exit(1);
  }
};

seedNewColleges();

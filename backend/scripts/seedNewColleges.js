import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from '../src/models/College.js';
import connectDB from '../src/config/db.js';

dotenv.config();

// ─── Helper ──────────────────────────────────────────────────────────────────
const normalize = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');

// ─── Placeholder banner (used for colleges without real banners yet) ─────────
const PLACEHOLDER_BANNER =
  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80';

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
    banner: 'https://blogcdn.aakash.ac.in/wordpress_media/2024/07/IIT-BHU.jpg',
    description: 'Indian Institute of Technology (BHU) Varanasi — a premier engineering institute.',
    category: 'IIT',
  },
  {
    name: 'IIT Bombay',
    location: 'Powai, Mumbai',
    students: '10,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://akasharya.in/images/folio/i1.jpeg',
    description: 'Indian Institute of Technology Bombay — one of India\'s top engineering institutes.',
    category: 'IIT',
  },
  {
    name: 'IIT Guwahati',
    location: 'Guwahati, Assam',
    students: '5,500+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: 'https://m.nenow.in/sortd-service/imaginary/v22-01/jpg/large/high?url=bmVub3ctaW4tcHJvZC1zb3J0ZC9tZWRpYTQ3MzNiMGIwLTI3ZjctMTFlZi1hYzMyLWRkMjViMjZhOWI2OC5qcGc=',
    description: 'Indian Institute of Technology Guwahati.',
    category: 'IIT',
  },
  {
    name: 'IIT Indore',
    location: 'Indore, Madhya Pradesh',
    students: '3,000+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: 'https://www.collegebatch.com/static/clg-gallery/indian-institute-of-technology-indore-239000.webp',
    description: 'Indian Institute of Technology Indore.',
    category: 'IIT',
  },
  {
    name: 'IIT Kanpur',
    location: 'Kanpur, Uttar Pradesh',
    students: '7,500+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://www.iitk.ac.in/data/media/2024/accommodation-1.jpg',
    description: 'Indian Institute of Technology Kanpur.',
    category: 'IIT',
  },
  {
    name: 'IIT Kharagpur',
    location: 'Kharagpur, West Bengal',
    students: '12,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk26YzNF5ijq-Ylq1H8xw0b2KpuADp_SX1JF_C3iGNdo3sNooWzHf0SUnn&s=10',
    description: 'Indian Institute of Technology Kharagpur — the first IIT in India.',
    category: 'IIT',
  },
  {
    name: 'IIT Mandi',
    location: 'Mandi, Himachal Pradesh',
    students: '2,500+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: 'https://dfhe5ze0n4pxu.cloudfront.net/College/Image/Image-1737636620539.JPG',
    description: 'Indian Institute of Technology Mandi.',
    category: 'IIT',
  },
  {
    name: 'IIT Ropar',
    location: 'Rupnagar, Punjab',
    students: '2,000+',
    emoji: '🔬',
    accent: '#0F172A',
    banner: 'https://iitrpr.ac.in/mechanical/wp-content/uploads/2025/09/sab-scaled-e1763706687849.jpg',
    description: 'Indian Institute of Technology Ropar.',
    category: 'IIT',
  },
  {
    name: 'IIT Roorkee',
    location: 'Roorkee, Uttarakhand',
    students: '8,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://bl-i.thgim.com/public/news/xe4vo3/article66182896.ece/alternates/FREE_1200/IIT%20Roorkee%20Campus.jpeg',
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
    banner: 'https://dfhe5ze0n4pxu.cloudfront.net/College/Background-Images/Background-Image-1715287577912.jpeg',
    description: 'Maulana Azad National Institute of Technology Bhopal.',
    category: 'NIT',
  },
  {
    name: 'MNIT Jaipur',
    location: 'Jaipur, Rajasthan',
    students: '5,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: 'https://notopedia-uploads.s3.us-east-2.amazonaws.com/clg-photo/pic-202211211111172574.jpg',
    description: 'Malaviya National Institute of Technology Jaipur.',
    category: 'NIT',
  },
  {
    name: 'MNNIT Allahabad / Prayagraj',
    location: 'Prayagraj, Uttar Pradesh',
    students: '4,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2N7znHOOjQFF7kwj5kbW0PqJNswboNdiSxi1luAeJ6mWjexAqTssWzUMO&s=10',
    description: 'Motilal Nehru National Institute of Technology Allahabad.',
    category: 'NIT',
  },
  {
    name: 'NIT Durgapur',
    location: 'Durgapur, West Bengal',
    students: '4,000+',
    emoji: '⚙️',
    accent: '#047857',
    banner: 'https://assets.kollegeapply.com/images/1751568106045-1743067547phpN1DQH5.jpeg',
    description: 'National Institute of Technology Durgapur.',
    category: 'NIT',
  },
  {
    name: 'NIT Jamshedpur',
    location: 'Jamshedpur, Jharkhand',
    students: '3,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: 'https://www.collegebatch.com/static/clg-gallery/national-institute-of-technology-jamshedpur-242023.webp',
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
    banner: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTS2zkZGjbmyRFzY561qihz0dJypMmkfOPwYfnMDnq4pfCyj13DuMgMpBX&s=10',
    description: 'National Institute of Technology Rourkela.',
    category: 'NIT',
  },
  {
    name: 'NIT Silchar',
    location: 'Silchar, Assam',
    students: '3,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: 'https://d8it4huxumps7.cloudfront.net/images/partners/banners/5d3149dc4cf0a_nit_silchar_college_banner_2.jpg',
    description: 'National Institute of Technology Silchar.',
    category: 'NIT',
  },
  {
    name: 'VNIT Nagpur',
    location: 'Nagpur, Maharashtra',
    students: '4,500+',
    emoji: '⚙️',
    accent: '#047857',
    banner: 'https://images.indianexpress.com/2023/08/VNIT-1.jpg',
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
    banner: 'https://pub-3bd144a409f940998afd367af1dcde44.r2.dev/migrated/colleges/1765993682434-65208607-jz9a7qql10hvqwosu6kl.jpg',
    description: 'All India Institute of Medical Sciences — India\'s premier medical institution.',
    category: 'Medical',
  },
  {
    name: 'ESIC Medical College, Faridabad',
    location: 'Faridabad, Haryana',
    students: '1,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Academic_Block%2C_ESIC_Medical_College_and_Hospital%2C_Faridabad.jpg",
    description: 'ESIC Medical College & Hospital, Faridabad.',
    category: 'Medical',
  },
  {
    name: 'Kalpana Chawla Government Medical College, Karnal',
    location: 'Karnal, Haryana',
    students: '1,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://www.collegebatch.com/static/clg-gallery/kalpana-chawla-government-medical-college-karnal-297557.webp',
    description: 'Kalpana Chawla Government Medical College, Karnal.',
    category: 'Medical',
  },
  {
    name: 'Lady Hardinge Medical College (LHMC)',
    location: 'New Delhi',
    students: '1,200+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80',
    description: 'Lady Hardinge Medical College — a premier women\'s medical college in New Delhi.',
    category: 'Medical',
  },
  {
    name: 'Maharishi Markandeshwar (Deemed University), Mullana',
    location: 'Mullana, Haryana',
    students: '5,000+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://images.jdmagicbox.com/v2/comp/ambala/h6/9999px171.x171.250519120902.r7h6/catalogue/4w47o0nam58xdaq-fbt4thkz4w.jpg',
    description: 'Maharishi Markandeshwar (Deemed to be University), Mullana-Ambala.',
    category: 'Medical',
  },
  {
    name: 'Maulana Azad Medical College (MAMC)',
    location: 'New Delhi',
    students: '1,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://www.diginerve.com/blogs/wp-content/uploads/2024/01/3.jpg',
    description: 'Maulana Azad Medical College — one of India\'s premier medical colleges.',
    category: 'Medical',
  },
  {
    name: 'PGIMS Rohtak',
    location: 'Rohtak, Haryana',
    students: '1,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner: 'https://www.collegebatch.com/static/clg-gallery/pt-bhagwat-dayal-sharma-post-graduate-institute-of-medical-sciences-rohtak-243745.webp',
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
    banner: 'https://campuspro.co.in/collage-image/1749040063_row_66.jpg',
    description: 'Amity Law School — one of India\'s leading law schools.',
    category: 'Law',
  },
  {
    name: 'Bhagat Phool Singh Mahila Vishwavidyalaya (BPSMV)',
    location: 'Khanpur Kalan, Haryana',
    students: '5,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://bpsmv.digitaluniversity.ac/user/pages/images/slides/slide1.jpg',
    description: 'BPS Mahila Vishwavidyalaya — a women\'s university with a law faculty.',
    category: 'Law',
  },
  {
    name: 'Faculty of Law, Jamia Millia Islamia',
    location: 'Jamia Nagar, New Delhi',
    students: '1,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://ik.imagekit.io/syustaging/SYU_PREPROD/COVER-IMAGE_qUHyDhuwg.webp?tr=w-3840',
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
    banner: 'https://iitmjp.ac.in/wp-content/uploads/2022/05/1.jpg',
    description: 'GGSIPU — state university with prominent law programs.',
    category: 'Law',
  },
  {
    name: 'Jindal Global Law School (JGLS)',
    location: 'Sonipat, NCR',
    students: '4,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://static.india.com/wp-content/uploads/2023/07/Jindal-Global-Law-School-Signs-4-MoUs-with-Leading-Law-Schools-in-US-Australia-for-Transnational-Learning.png?impolicy=Medium_Resize&w=1200&h=800',
    description: 'Jindal Global Law School — a top private law school in India.',
    category: 'Law',
  },
  {
    name: 'Lloyd Law College, Greater Noida',
    location: 'Greater Noida, Uttar Pradesh',
    students: '2,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://www.collegebatch.com/static/clg-gallery/lloyd-law-college-greater-noida-353849.webp',
    description: 'Lloyd Law College, Greater Noida.',
    category: 'Law',
  },
  {
    name: 'National Law University, Delhi (NLU Delhi)',
    location: 'New Delhi',
    students: '1,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://campuspro.co.in/collage-image/1749038687_row_335.jpg',
    description: 'National Law University Delhi — a premier national law school.',
    category: 'Law',
  },
  {
    name: 'Puran Murti College of Law (PMCL)',
    location: 'Sonipat, Haryana',
    students: '500+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://www.collegebatch.com/static/clg-gallery/puran-murti-campus-sonipat-235215.webp',
    description: 'Puran Murti College of Law, Sonipat.',
    category: 'Law',
  },
  {
    name: 'SRM University, Delhi-NCR (Sonepat)',
    location: 'Sonipat, NCR',
    students: '8,000+',
    emoji: '⚖️',
    accent: '#7C3AED',
    banner: 'https://dfhe5ze0n4pxu.cloudfront.net/College/Background-Images/Background-Image-1718788403619.jpg',
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
    banner: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeQlrf-E99Mr6dcwVTt2TCAddIKaE_SWL3wyZmDbseqSwmCeg6TLy0H0-B&s=10',
    description: 'Amity University Gurugram — offering design and creative programs.',
    category: 'Design',
  },
  {
    name: 'ICAT Design & Media College, Gurugram',
    location: 'Gurugram, Haryana',
    students: '2,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://www.icat.ac.in/images/icat-bangalore.jpg',
    description: 'ICAT Design & Media College, Gurugram.',
    category: 'Design',
  },
  {
    name: 'NIFT New Delhi',
    location: 'Hauz Khas, New Delhi',
    students: '3,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://iirfranking2.s3.ap-south-1.amazonaws.com/upload__1620895522963.webp',
    description: 'National Institute of Fashion Technology, New Delhi.',
    category: 'Design',
  },
  {
    name: 'O.P. Jindal Global University (JGU), Sonipat',
    location: 'Sonipat, NCR',
    students: '8,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://static.boostmytalent.com/img/univ/jindal-global-university-online-mba-admission.webp',
    description: 'O.P. Jindal Global University — offering design and creative arts programs.',
    category: 'Design',
  },
  {
    name: 'Pearl Academy, Delhi',
    location: 'New Delhi',
    students: '3,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://campuspro.co.in/collage-image/1737943310_row_406.jpg',
    description: 'Pearl Academy — India\'s premier design & fashion institution.',
    category: 'Design',
  },
  {
    name: 'Pearl Academy, Gurugram',
    location: 'Gurugram, Haryana',
    students: '2,000+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://images.adsttc.com/media/images/5011/e982/28ba/0d5f/4c00/03ce/newsletter/stringio.jpg?1414473798',
    description: 'Pearl Academy Gurugram campus.',
    category: 'Design',
  },
  {
    name: 'World University of Design (WUD), Sonipat',
    location: 'Sonipat, NCR',
    students: '2,500+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://www.collegebatch.com/static/clg-gallery/world-university-of-design-sonipat-230555.webp',
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
        // Already in DB — keep category + banner in sync with seed
        await College.updateOne(
          { name: { $regex: new RegExp(`^${college.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { $set: { category: college.category, banner: college.banner } }
        );
        console.log(`  ↩ Already exists (category + banner patched): ${college.name}`);
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

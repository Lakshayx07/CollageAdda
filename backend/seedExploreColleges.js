import dotenv from 'dotenv';
import College from './src/models/College.js';
import connectDB from './src/config/db.js';

dotenv.config();

const normalize = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');

/** Upsert explore colleges + refresh banners (safe to re-run). */
const colleges = [
  // ── Banner refreshes for existing Delhi / NCR schools ─────────────────────
  {
    name: 'School of Planning and Architecture (SPA)',
    location: 'New Delhi',
    students: '1,500+',
    emoji: '🏛️',
    accent: '#0284C7',
    banner:
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi24003tqaFcjayFwY2rQvUJE6Wl13FMKbw9C4Xqe_Pe9l2Kk7fu-ph3xOVzsEXlbkE9Z_UHqwSjbIZEHTOCRhtbf1hO5ZQr6R9NW1vfMPgcejNbWo2-5qDXbebAoHHUPa84JpGAheRV0_c/s1600/MB+hostehg_01.JPG',
    description: 'A specialized university in Delhi for architecture and planning.',
    category: 'Design',
  },
  {
    name: 'IIIT Delhi',
    location: 'New Delhi',
    students: '2,500+',
    emoji: '🖥️',
    accent: '#0891B2',
    banner: '/college-banners/iiit-delhi.jpg',
    description: 'Indraprastha Institute of Information Technology Delhi.',
    category: 'Engineering',
  },
  {
    name: 'University of Delhi (DU)',
    location: 'New Delhi',
    students: '100,000+',
    emoji: '🎓',
    accent: '#7C3AED',
    banner:
      'https://images.shiksha.com/mediadata/images/articles/1662370481phpb8qpYu.jpeg',
    description: 'A collegiate public central university offering numerous courses.',
    category: 'General',
  },
  {
    name: 'Jawaharlal Nehru University (JNU)',
    location: 'New Delhi',
    students: '8,000+',
    emoji: '📚',
    accent: '#BE123C',
    banner: 'https://jnuee.jnu.ac.in/images/slide4.jpg',
    description: 'A premier central university renowned for research and liberal arts.',
    category: 'General',
  },
  {
    name: 'YMCA Faridabad',
    location: 'Faridabad',
    students: '5,000+',
    emoji: '⚙️',
    accent: '#3B82F6',
    banner:
      'https://content3.jdmagicbox.com/v2/comp/faridabad/f7/011pxx11.xx11.240506201615.g9f7/catalogue/j-c-bose-university-of-science-and-technology-ymca-faridabad-sector-6-faridabad-universities-c2j9ylsv1u.jpg',
    description:
      'J.C. Bose University of Science and Technology, YMCA, Faridabad.',
    category: 'Engineering',
  },
  {
    name: 'AIIMS, New Delhi',
    location: 'New Delhi',
    students: '2,500+',
    emoji: '🏥',
    accent: '#DC2626',
    banner:
      'https://pub-3bd144a409f940998afd367af1dcde44.r2.dev/migrated/colleges/1765993682434-65208607-jz9a7qql10hvqwosu6kl.jpg',
    description:
      "All India Institute of Medical Sciences — India's premier medical institution.",
    category: 'Medical',
  },

  // ── New / refreshed explore colleges ──────────────────────────────────────
  {
    name: 'Polaris University',
    location: 'India',
    students: '5,000+',
    emoji: '🌟',
    accent: '#0EA5E9',
    banner:
      'https://framerusercontent.com/images/GK1DzI1zh4f9uHpc7W7XdJgA.jpg?width=1500&height=885',
    description: 'Polaris University — a growing private university.',
    category: 'General',
  },
  {
    name: 'VIT University',
    location: 'Vellore',
    students: '35,000+',
    emoji: '🔬',
    accent: '#003366',
    banner: 'https://vit.ac.in/wp-content/uploads/2023/06/banner7.webp',
    description: 'Vellore Institute of Technology — a premier private engineering university.',
    category: 'Engineering',
  },
  {
    name: 'World University of Design (WUD), Sonipat',
    location: 'Sonipat',
    students: '2,500+',
    emoji: '🎨',
    accent: '#EC4899',
    banner: 'https://images.shiksha.com/mediadata/images/1514283925php4SnqUv.png',
    description: 'World University of Design — specialised design university in NCR.',
    category: 'Design',
  },
  {
    name: 'O.P. Jindal Global University (JGU), Sonipat',
    location: 'Sonipat',
    students: '8,000+',
    emoji: '🎓',
    accent: '#B45309',
    banner: 'https://www.admissionwala.in/storage/productimages/Banner4-1.jpg',
    description: 'O.P. Jindal Global University — multidisciplinary private university in Sonipat.',
    category: 'General',
  },
  {
    name: 'SRM University, Delhi-NCR (Sonepat)',
    location: 'Sonipat',
    students: '8,000+',
    emoji: '🏫',
    accent: '#7C3AED',
    banner:
      'https://collegewollege.com/_next/image?url=https%3A%2F%2Fcdn.collegewollege.com%2Fstorage%2Fcolleges%2Fbranding%2FipycSpCJRcIFxTDX2A507VyuSaJCH4PLMFbcJCNu.png&w=3840&q=60',
    description: 'SRM University, Delhi-NCR (Sonepat).',
    category: 'General',
  },
  {
    name: 'Ashoka University',
    location: 'Sonipat',
    students: '3,000+',
    emoji: '📖',
    accent: '#1D4ED8',
    banner:
      'https://akm-img-a-in.tosshub.com/indiatoday/images/story/201902/Ashoka.jpeg?size=690:388',
    description: 'Ashoka University — a leading liberal arts and sciences university.',
    category: 'General',
  },
  {
    name: 'DY Patil University',
    location: 'India',
    students: '10,000+',
    emoji: '🏥',
    accent: '#059669',
    banner:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6q7UDPbtvT_iGGpZWgv80VIr9OaKCszWcenRL39ryi797zHIJ6P0mxEY&s=10',
    description: 'DY Patil University — multidisciplinary private university.',
    category: 'General',
  },
  {
    name: 'S-VYASA (NST Bangalore)',
    location: 'Bangalore',
    students: '3,000+',
    emoji: '🧘',
    accent: '#16A34A',
    banner: 'https://pbs.twimg.com/media/G8NSI0hbEAAQFYZ.jpg',
    description: 'S-VYASA — Swami Vivekananda Yoga Anusandhana Samsthana (NST Bangalore).',
    category: 'General',
  },
  {
    name: "St. Mary's University (NST Hyderabad)",
    location: 'Hyderabad',
    students: '4,000+',
    emoji: '⛪',
    accent: '#9333EA',
    banner:
      'https://www.appily.com/sites/default/files/styles/max_1200/public/images/hero/college/228149_hero.jpg?itok=Tfzv-e_N',
    description: "St. Mary's University (NST Hyderabad).",
    category: 'General',
  },
];

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB.\n');

    let added = 0;
    let updated = 0;

    for (const college of colleges) {
      const existing = await College.findOne({
        name: {
          $regex: new RegExp(
            `^${college.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i'
          ),
        },
      });

      if (existing) {
        await College.updateOne(
          { _id: existing._id },
          {
            $set: {
              banner: college.banner,
              location: college.location,
              category: college.category,
              emoji: college.emoji,
              accent: college.accent,
              description: college.description,
            },
          }
        );
        console.log(`  ✓ Updated: ${college.name}`);
        updated++;
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

    console.log('\n── Done ──');
    console.log(`  Added  : ${added}`);
    console.log(`  Updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding explore colleges:', err);
    process.exit(1);
  }
};

run();

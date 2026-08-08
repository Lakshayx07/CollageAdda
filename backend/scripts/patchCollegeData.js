import dotenv from 'dotenv';
import College from '../src/models/College.js';
import connectDB from '../src/config/db.js';

dotenv.config();

// ─── Location fixes ───────────────────────────────────────────────────────────
// Map: college name fragment (case-insensitive regex key) → correct location string
// These fix any "Sonipat, NCR", "Powai, Mumbai", "Hauz Khas, New Delhi", etc.
// values into clean, distinct city strings that the City filter can deduplicate.
const LOCATION_FIXES = [
  // Existing Delhi-area colleges
  { match: /^rishihood university$/i,                       location: 'Sonipat' },
  { match: /^school of planning and architecture/i,         location: 'New Delhi' },
  { match: /^iit delhi$/i,                                  location: 'New Delhi' },
  { match: /^delhi technological university/i,              location: 'New Delhi' },
  { match: /^netaji subhas university of technology/i,      location: 'New Delhi' },
  { match: /^iiit delhi$/i,                                 location: 'New Delhi' },
  { match: /^university of delhi/i,                         location: 'New Delhi' },
  { match: /^jawaharlal nehru university/i,                 location: 'New Delhi' },
  { match: /^jamia millia islamia$/i,                       location: 'New Delhi' },
  { match: /^guru gobind singh indraprastha university \(ipu\)$/i, location: 'New Delhi' },
  { match: /^kurukshetra university$/i,                     location: 'Kurukshetra' },
  { match: /^ymca faridabad$/i,                             location: 'Faridabad' },

  // IITs
  { match: /^iit \(bhu\) varanasi$/i,                      location: 'Varanasi' },
  { match: /^iit bombay$/i,                                 location: 'Mumbai' },
  { match: /^iit guwahati$/i,                               location: 'Guwahati' },
  { match: /^iit indore$/i,                                 location: 'Indore' },
  { match: /^iit kanpur$/i,                                 location: 'Kanpur' },
  { match: /^iit kharagpur$/i,                              location: 'Kharagpur' },
  { match: /^iit mandi$/i,                                  location: 'Mandi' },
  { match: /^iit ropar$/i,                                  location: 'Rupnagar' },
  { match: /^iit roorkee$/i,                                location: 'Roorkee' },

  // NITs
  { match: /^manit bhopal$/i,                               location: 'Bhopal' },
  { match: /^mnit jaipur$/i,                                location: 'Jaipur' },
  { match: /^mnnit allahabad/i,                             location: 'Prayagraj' },
  { match: /^nit durgapur$/i,                               location: 'Durgapur' },
  { match: /^nit jamshedpur$/i,                             location: 'Jamshedpur' },
  { match: /^nit kurukshetra$/i,                            location: 'Kurukshetra' },
  { match: /^nit patna$/i,                                  location: 'Patna' },
  { match: /^nit rourkela$/i,                               location: 'Rourkela' },
  { match: /^nit silchar$/i,                                location: 'Silchar' },
  { match: /^vnit nagpur$/i,                                location: 'Nagpur' },

  // Medical
  { match: /^aiims, new delhi$/i,                           location: 'New Delhi' },
  { match: /^esic medical college, faridabad$/i,            location: 'Faridabad' },
  { match: /^kalpana chawla government medical college/i,   location: 'Karnal' },
  { match: /^lady hardinge medical college/i,               location: 'New Delhi' },
  { match: /^maharishi markandeshwar/i,                     location: 'Mullana' },
  { match: /^maulana azad medical college/i,                location: 'New Delhi' },
  { match: /^pgims rohtak$/i,                               location: 'Rohtak' },
  { match: /^sgt medical college/i,                         location: 'Gurugram' },
  { match: /^university college of medical sciences/i,      location: 'New Delhi' },
  { match: /^vardhman mahavir medical college/i,            location: 'New Delhi' },

  // Law
  { match: /^amity law school$/i,                           location: 'Noida' },
  { match: /^bhagat phool singh mahila vishwavidyalaya/i,   location: 'Khanpur Kalan' },
  { match: /^faculty of law, jamia millia islamia$/i,       location: 'New Delhi' },
  { match: /^faculty of law, university of delhi$/i,        location: 'New Delhi' },
  { match: /^guru gobind singh indraprastha university \(ggsipu\)$/i, location: 'New Delhi' },
  { match: /^jindal global law school/i,                    location: 'Sonipat' },
  { match: /^lloyd law college/i,                           location: 'Greater Noida' },
  { match: /^national law university, delhi/i,              location: 'New Delhi' },
  { match: /^puran murti college of law/i,                  location: 'Sonipat' },
  { match: /^srm university, delhi-ncr/i,                   location: 'Sonipat' },

  // Design
  { match: /^amity university, gurugram$/i,                 location: 'Gurugram' },
  { match: /^icat design & media college, gurugram$/i,      location: 'Gurugram' },
  { match: /^nift new delhi$/i,                             location: 'New Delhi' },
  { match: /^o\.p\. jindal global university/i,             location: 'Sonipat' },
  { match: /^pearl academy, delhi$/i,                       location: 'New Delhi' },
  { match: /^pearl academy, gurugram$/i,                    location: 'Gurugram' },
  { match: /^world university of design/i,                  location: 'Sonipat' },
];

// ─── Category → Engineering patches ──────────────────────────────────────────
// Colleges that should be "Engineering" instead of "General"
const ENGINEERING_COLLEGES = [
  /^delhi technological university/i,           // DTU
  /^netaji subhas university of technology/i,   // NSUT
  /^ymca faridabad$/i,                          // J.C. Bose / YMCA
  /^kurukshetra university$/i,                  // tech/engineering-heavy state uni
  /^bits pilani$/i,                             // engineering institute
];

// ─── Main ────────────────────────────────────────────────────────────────────
const run = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.\n');

    const all = await College.find({});
    console.log(`Found ${all.length} colleges in DB.\n`);

    let locationFixed = 0;
    let categoryFixed = 0;

    for (const college of all) {
      const updates = {};

      // ── Fix location ──────────────────────────────────────────────────────
      for (const fix of LOCATION_FIXES) {
        if (fix.match.test(college.name.trim())) {
          if (college.location !== fix.location) {
            updates.location = fix.location;
          }
          break;
        }
      }

      // ── Fix category → Engineering ────────────────────────────────────────
      if (college.category === 'General') {
        for (const pattern of ENGINEERING_COLLEGES) {
          if (pattern.test(college.name.trim())) {
            updates.category = 'Engineering';
            break;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        await College.updateOne({ _id: college._id }, { $set: updates });
        const tags = [];
        if (updates.location) { tags.push(`location → "${updates.location}"`); locationFixed++; }
        if (updates.category) { tags.push(`category → "${updates.category}"`); categoryFixed++; }
        console.log(`  ✓ ${college.name}: ${tags.join(', ')}`);
      }
    }

    console.log(`\n── Summary ──`);
    console.log(`  Location fixes : ${locationFixed}`);
    console.log(`  Category fixes : ${categoryFixed}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

run();

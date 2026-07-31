import dotenv from 'dotenv';
import College from './src/models/College.js';
import connectDB from './src/config/db.js';

dotenv.config();

const WORKING_PLACEHOLDER =
  'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80';

const CAMPUS_ALT =
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80';

const CAMPUS_ALT_2 =
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80';

/**
 * Verified banners for every college we seed.
 * Broken seed/DB hosts (Shiksha 403, dead Unsplash default, Facebook CDN)
 * are replaced with working URLs here.
 */
const BANNER_BY_NAME = {
  // Delhi / NCR
  'Rishihood University':
    'https://framerusercontent.com/images/XFjzi1N8IY9NG8fcSIM2Ev9sc.webp?width=1600',
  'School of Planning and Architecture (SPA)':
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi24003tqaFcjayFwY2rQvUJE6Wl13FMKbw9C4Xqe_Pe9l2Kk7fu-ph3xOVzsEXlbkE9Z_UHqwSjbIZEHTOCRhtbf1hO5ZQr6R9NW1vfMPgcejNbWo2-5qDXbebAoHHUPa84JpGAheRV0_c/s1600/MB+hostehg_01.JPG',
  'IIT Delhi': 'https://home.iitd.ac.in/images/for-faculty/camp8.jpg',
  'Delhi Technological University (DTU)':
    'https://learn.vcnow.in/wp-content/uploads/2026/01/DTU.jpg',
  'Netaji Subhas University of Technology (NSUT)':
    'https://edufever.in/colleges/wp-content/uploads/2021/03/NSUT-Delhi.webp',
  'IIIT Delhi': '/college-banners/iiit-delhi.jpg',
  'University of Delhi (DU)':
    'https://images.shiksha.com/mediadata/images/articles/1662370481phpb8qpYu.jpeg',
  'Jawaharlal Nehru University (JNU)': 'https://jnuee.jnu.ac.in/images/slide4.jpg',
  'Jamia Millia Islamia': CAMPUS_ALT,
  'Guru Gobind Singh Indraprastha University (IPU)':
    'https://images.indianexpress.com/2025/02/ggsipu-1.jpg',
  'Kurukshetra University':
    'https://notopedia-uploads.s3.us-east-2.amazonaws.com/clg-photo/pic-202212220610052590.jpg',
  'YMCA Faridabad':
    'https://content3.jdmagicbox.com/v2/comp/faridabad/f7/011pxx11.xx11.240506201615.g9f7/catalogue/j-c-bose-university-of-science-and-technology-ymca-faridabad-sector-6-faridabad-universities-c2j9ylsv1u.jpg',
  'Polaris University':
    'https://framerusercontent.com/images/GK1DzI1zh4f9uHpc7W7XdJgA.jpg?width=1500&height=885',
  'VIT University': 'https://vit.ac.in/wp-content/uploads/2023/06/banner7.webp',
  'Ashoka University':
    'https://akm-img-a-in.tosshub.com/indiatoday/images/story/201902/Ashoka.jpeg?size=690:388',
  'DY Patil University':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6q7UDPbtvT_iGGpZWgv80VIr9OaKCszWcenRL39ryi797zHIJ6P0mxEY&s=10',
  'S-VYASA (NST Bangalore)': 'https://pbs.twimg.com/media/G8NSI0hbEAAQFYZ.jpg',
  "St. Mary's University (NST Hyderabad)":
    'https://www.appily.com/sites/default/files/styles/max_1200/public/images/hero/college/228149_hero.jpg?itok=Tfzv-e_N',

  // IITs
  'IIT (BHU) Varanasi':
    'https://blogcdn.aakash.ac.in/wordpress_media/2024/07/IIT-BHU.jpg',
  'IIT Bombay': 'https://akasharya.in/images/folio/i1.jpeg',
  'IIT Guwahati':
    'https://m.nenow.in/sortd-service/imaginary/v22-01/jpg/large/high?url=bmVub3ctaW4tcHJvZC1zb3J0ZC9tZWRpYTQ3MzNiMGIwLTI3ZjctMTFlZi1hYzMyLWRkMjViMjZhOWI2OC5qcGc=',
  'IIT Indore':
    'https://www.collegebatch.com/static/clg-gallery/indian-institute-of-technology-indore-239000.webp',
  'IIT Kanpur': 'https://www.iitk.ac.in/data/media/2024/accommodation-1.jpg',
  'IIT Kharagpur':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk26YzNF5ijq-Ylq1H8xw0b2KpuADp_SX1JF_C3iGNdo3sNooWzHf0SUnn&s=10',
  'IIT Mandi':
    'https://dfhe5ze0n4pxu.cloudfront.net/College/Image/Image-1737636620539.JPG',
  'IIT Ropar':
    'https://iitrpr.ac.in/mechanical/wp-content/uploads/2025/09/sab-scaled-e1763706687849.jpg',
  'IIT Roorkee':
    'https://bl-i.thgim.com/public/news/xe4vo3/article66182896.ece/alternates/FREE_1200/IIT%20Roorkee%20Campus.jpeg',

  // NITs
  'MANIT Bhopal':
    'https://dfhe5ze0n4pxu.cloudfront.net/College/Background-Images/Background-Image-1715287577912.jpeg',
  'MNIT Jaipur':
    'https://notopedia-uploads.s3.us-east-2.amazonaws.com/clg-photo/pic-202211211111172574.jpg',
  'MNNIT Allahabad / Prayagraj':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2N7znHOOjQFF7kwj5kbW0PqJNswboNdiSxi1luAeJ6mWjexAqTssWzUMO&s=10',
  'NIT Durgapur':
    'https://assets.kollegeapply.com/images/1751568106045-1743067547phpN1DQH5.jpeg',
  'NIT Jamshedpur':
    'https://www.collegebatch.com/static/clg-gallery/national-institute-of-technology-jamshedpur-242023.webp',
  'NIT Kurukshetra': WORKING_PLACEHOLDER,
  'NIT Patna': WORKING_PLACEHOLDER,
  'NIT Rourkela':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTS2zkZGjbmyRFzY561qihz0dJypMmkfOPwYfnMDnq4pfCyj13DuMgMpBX&s=10',
  'NIT Silchar':
    'https://d8it4huxumps7.cloudfront.net/images/partners/banners/5d3149dc4cf0a_nit_silchar_college_banner_2.jpg',
  'VNIT Nagpur': 'https://images.indianexpress.com/2023/08/VNIT-1.jpg',

  // Medical
  'AIIMS, New Delhi':
    'https://pub-3bd144a409f940998afd367af1dcde44.r2.dev/migrated/colleges/1765993682434-65208607-jz9a7qql10hvqwosu6kl.jpg',
  'ESIC Medical College, Faridabad':
    'https://upload.wikimedia.org/wikipedia/commons/c/c7/Academic_Block%2C_ESIC_Medical_College_and_Hospital%2C_Faridabad.jpg',
  'Kalpana Chawla Government Medical College, Karnal':
    'https://www.collegebatch.com/static/clg-gallery/kalpana-chawla-government-medical-college-karnal-297557.webp',
  'Lady Hardinge Medical College (LHMC)': CAMPUS_ALT,
  'Maharishi Markandeshwar (Deemed University), Mullana':
    'https://images.jdmagicbox.com/v2/comp/ambala/h6/9999px171.x171.250519120902.r7h6/catalogue/4w47o0nam58xdaq-fbt4thkz4w.jpg',
  'Maulana Azad Medical College (MAMC)': CAMPUS_ALT_2,
  'PGIMS Rohtak':
    'https://www.collegebatch.com/static/clg-gallery/pt-bhagwat-dayal-sharma-post-graduate-institute-of-medical-sciences-rohtak-243745.webp',
  'SGT Medical College, Gurgaon': WORKING_PLACEHOLDER,
  'University College of Medical Sciences (UCMS)': WORKING_PLACEHOLDER,
  'Vardhman Mahavir Medical College (VMMC) & Safdarjung Hospital': WORKING_PLACEHOLDER,

  // Law
  'Amity Law School':
    'https://campuspro.co.in/collage-image/1749040063_row_66.jpg',
  'Bhagat Phool Singh Mahila Vishwavidyalaya (BPSMV)':
    'https://bpsmv.digitaluniversity.ac/user/pages/images/slides/slide1.jpg',
  'Faculty of Law, Jamia Millia Islamia':
    'https://ik.imagekit.io/syustaging/SYU_PREPROD/COVER-IMAGE_qUHyDhuwg.webp?tr=w-3840',
  'Faculty of Law, University of Delhi': WORKING_PLACEHOLDER,
  'Guru Gobind Singh Indraprastha University (GGSIPU)':
    'https://images.indianexpress.com/2025/02/ggsipu-1.jpg',
  'Jindal Global Law School (JGLS)':
    'https://static.india.com/wp-content/uploads/2023/07/Jindal-Global-Law-School-Signs-4-MoUs-with-Leading-Law-Schools-in-US-Australia-for-Transnational-Learning.png?impolicy=Medium_Resize&w=1200&h=800',
  'Lloyd Law College, Greater Noida':
    'https://www.collegebatch.com/static/clg-gallery/lloyd-law-college-greater-noida-353849.webp',
  'National Law University, Delhi (NLU Delhi)':
    'https://campuspro.co.in/collage-image/1749038687_row_335.jpg',
  'Puran Murti College of Law (PMCL)':
    'https://www.collegebatch.com/static/clg-gallery/puran-murti-campus-sonipat-235215.webp',
  'SRM University, Delhi-NCR (Sonepat)':
    'https://collegewollege.com/_next/image?url=https%3A%2F%2Fcdn.collegewollege.com%2Fstorage%2Fcolleges%2Fbranding%2FipycSpCJRcIFxTDX2A507VyuSaJCH4PLMFbcJCNu.png&w=3840&q=60',

  // Design
  'Amity University, Gurugram':
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeQlrf-E99Mr6dcwVTt2TCAddIKaE_SWL3wyZmDbseqSwmCeg6TLy0H0-B&s=10',
  'ICAT Design & Media College, Gurugram':
    'https://www.icat.ac.in/images/icat-bangalore.jpg',
  'NIFT New Delhi':
    'https://iirfranking2.s3.ap-south-1.amazonaws.com/upload__1620895522963.webp',
  'O.P. Jindal Global University (JGU), Sonipat':
    'https://www.deccanchronicle.com/h-upload/2024/08/20/1832251-op-jindal-global-university-.webp',
  'Pearl Academy, Delhi':
    'https://campuspro.co.in/collage-image/1737943310_row_406.jpg',
  'Pearl Academy, Gurugram':
    'https://images.adsttc.com/media/images/5011/e982/28ba/0d5f/4c00/03ce/newsletter/stringio.jpg?1414473798',
  'World University of Design (WUD), Sonipat':
    'https://images.shiksha.com/mediadata/images/1514283925php4SnqUv.png',
};

const normalize = (name) => name.toLowerCase().trim().replace(/\s+/g, ' ');

const bannerLookup = new Map(
  Object.entries(BANNER_BY_NAME).map(([name, banner]) => [normalize(name), banner])
);

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB.\n');

    const colleges = await College.find({}).select('name banner');
    let updated = 0;
    let unchanged = 0;
    let missing = 0;

    for (const college of colleges) {
      const nextBanner = bannerLookup.get(normalize(college.name));
      if (!nextBanner) {
        // Still replace known-dead default / Shiksha / Facebook CDN banners
        const current = college.banner || '';
        const isBrokenHost =
          current.includes('images.shiksha.com') ||
          current.includes('scontent') ||
          current.includes('photo-1523050335456-c38a7047d28c');
        if (isBrokenHost) {
          await College.updateOne(
            { _id: college._id },
            { $set: { banner: WORKING_PLACEHOLDER } }
          );
          console.log(`  ~ Fallback: ${college.name}`);
          updated++;
        } else {
          console.log(`  - No map entry (keep): ${college.name}`);
          missing++;
        }
        continue;
      }

      if (college.banner === nextBanner) {
        unchanged++;
        continue;
      }

      await College.updateOne(
        { _id: college._id },
        { $set: { banner: nextBanner } }
      );
      console.log(`  ✓ Updated: ${college.name}`);
      updated++;
    }

    console.log('\n── Summary ──');
    console.log(`  Updated   : ${updated}`);
    console.log(`  Unchanged : ${unchanged}`);
    console.log(`  No mapping: ${missing}`);
    process.exit(0);
  } catch (err) {
    console.error('Error patching banners:', err);
    process.exit(1);
  }
};

run();

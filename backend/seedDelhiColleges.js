import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './src/models/College.js';
import connectDB from './src/config/db.js';

dotenv.config();

const delhiColleges = [
  {
    name: "Rishihood University",
    location: "Sonipat, NCR",
    students: "2,000+",
    posts: "500+",
    departments: 10,
    emoji: "💡",
    accent: "#E11D48",
    banner: "https://framerusercontent.com/images/XFjzi1N8IY9NG8fcSIM2Ev9sc.webp?width=680&height=377",
    description: "An impact-driven university located in Sonipat, Delhi NCR."
  },
  {
    name: "School of Planning and Architecture (SPA)",
    location: "New Delhi",
    students: "1,500+",
    posts: "300+",
    departments: 12,
    emoji: "🏛️",
    accent: "#0284C7",
    banner: "https://spa.ac.in/sites/default/files/inline-images/Rectangle%2022740.jpg",
    description: "A specialized university in Delhi for architecture and planning."
  },
  {
    name: "IIT Delhi",
    location: "Hauz Khas, New Delhi",
    students: "10,000+",
    posts: "1,200+",
    departments: 30,
    emoji: "🔬",
    accent: "#0F172A",
    banner: "https://home.iitd.ac.in/images/for-faculty/camp8.jpg",
    description: "One of India's premier engineering and research institutes."
  },
  {
    name: "Delhi Technological University (DTU)",
    location: "Rohini, New Delhi",
    students: "12,000+",
    posts: "900+",
    departments: 15,
    emoji: "⚙️",
    accent: "#047857",
    banner: "https://learn.vcnow.in/wp-content/uploads/2026/01/DTU.jpg",
    description: "A leading state university renowned for engineering and technology."
  },
  {
    name: "Netaji Subhas University of Technology (NSUT)",
    location: "Dwarka, New Delhi",
    students: "9,000+",
    posts: "700+",
    departments: 11,
    emoji: "💻",
    accent: "#4F46E5",
    banner: "https://edufever.in/colleges/wp-content/uploads/2021/03/NSUT-Delhi.webp",
    description: "Formerly NSIT, a prominent engineering university in Delhi."
  },
  {
    name: "IIIT Delhi",
    location: "Okhla, New Delhi",
    students: "2,500+",
    posts: "400+",
    departments: 6,
    emoji: "🖥️",
    accent: "#0891B2",
    banner: "https://iiitd.ac.in/sites/all/themes/gavias_educar/images/slide-pl.jpg",
    description: "Indraprastha Institute of Information Technology Delhi."
  },
  {
    name: "University of Delhi (DU)",
    location: "New Delhi",
    students: "100,000+",
    posts: "5,000+",
    departments: 86,
    emoji: "🎓",
    accent: "#7C3AED",
    banner: "https://images.shiksha.com/mediadata/images/articles/1662370481phpb8qpYu.jpeg",
    description: "A collegiate public central university offering numerous courses."
  },
  {
    name: "Jawaharlal Nehru University (JNU)",
    location: "New Delhi",
    students: "8,000+",
    posts: "600+",
    departments: 20,
    emoji: "📚",
    accent: "#BE123C",
    banner: "https://images.hindustantimes.com/img/2021/06/09/1600x900/https___blankpaper.htdigital.in_cms-backend-service-mt_image_redirect_link=https___images.hindustantimes.com_rf_image_size_960x540_HT_p2_2020_12_02_Pictures_jnu_faac0890-344e-11eb-a095-f4dd1fe9b7fb_1623229693932_1623229700573.jpg",
    description: "A premier central university renowned for research and liberal arts."
  },
  {
    name: "Jamia Millia Islamia",
    location: "Jamia Nagar, New Delhi",
    students: "18,000+",
    posts: "850+",
    departments: 38,
    emoji: "🕌",
    accent: "#166534",
    banner: "https://scontent-bom5-1.xx.fbcdn.net/v/t39.30808-6/561528853_1245033950996230_1527605211030628163_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=7b2446&_nc_ohc=uNUTIxfVPdcQ7kNvwFYmlij&_nc_oc=AdqHja1I-EpbbxGJLdWf8i7tmNcXvufZh8TKjZjjkJ8fYUCkp3n6g-6GO-ghERPAZolJLlRBveO_0nYWaMS5TORU&_nc_zt=23&_nc_ht=scontent-bom5-1.xx&_nc_gid=qTwBxoOe2UaiE0_uieCl7w&_nc_ss=7b289&oh=00_Af44xunQlnssAAB6biZUsHEhfejtFQBWLjiQNo_2lisr8g&oe=6A01B952",
    description: "A central university located in New Delhi."
  },
  {
    name: "Guru Gobind Singh Indraprastha University (IPU)",
    location: "Dwarka, New Delhi",
    students: "75,000+",
    posts: "2,000+",
    departments: 50,
    emoji: "🏢",
    accent: "#EA580C",
    banner: "https://images.indianexpress.com/2025/02/ggsipu-1.jpg",
    description: "A state university with numerous affiliated colleges across Delhi."
  },
  {
    name: "Kurukshetra University",
    location: "Kurukshetra, Haryana",
    students: "15,000+",
    posts: "450+",
    departments: 40,
    emoji: "🏛️",
    accent: "#059669",
    banner: "https://notopedia-uploads.s3.us-east-2.amazonaws.com/clg-photo/pic-202212220610052590.jpg",
    description: "One of the premier educational institutions of India, located in the holy city of Kurukshetra."
  },
  {
    name: "YMCA Faridabad",
    location: "Faridabad, Haryana",
    students: "5,000+",
    posts: "300+",
    departments: 12,
    emoji: "⚙️",
    accent: "#3B82F6",
    banner: "https://images.shiksha.com/mediadata/images/1741266149phpfUjSPk.jpeg",
    description: "J.C. Bose University of Science and Technology, YMCA, formerly YMCA University of Science and Technology."
  }
];

const seedDelhiColleges = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB.");

    for (const collegeData of delhiColleges) {
      const exists = await College.findOne({ name: collegeData.name });
      if (!exists) {
        const college = new College(collegeData);
        await college.save();
        console.log(`Added: ${collegeData.name}`);
      } else {
        await College.updateOne({ name: collegeData.name }, { $set: collegeData });
        console.log(`Updated: ${collegeData.name}`);
      }
    }

    console.log("Delhi NCR Colleges seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding colleges:", error);
    process.exit(1);
  }
};

seedDelhiColleges();

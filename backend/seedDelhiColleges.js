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
    banner: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1581358055655-eb54ce9ac056?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1590483866299-158a18df7cb3?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1601224283838-518296213038?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1565022536102-f7645c84354a?w=800&q=80",
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
    banner: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800&q=80",
    description: "A state university with numerous affiliated colleges across Delhi."
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
        console.log(`Already exists: ${collegeData.name}`);
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

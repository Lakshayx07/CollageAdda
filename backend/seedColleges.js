import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './src/models/College.js';
import connectDB from './src/config/db.js';

dotenv.config();

const newColleges = [
  {
    name: "Stanford University",
    location: "Stanford, California",
    students: "16,000+",
    posts: "1,200+",
    departments: 40,
    emoji: "🌲",
    accent: "#8C1515",
    banner: "https://images.unsplash.com/photo-1601224283838-518296213038?w=800&q=80",
    description: "Stanford University is one of the world's leading teaching and research institutions."
  },
  {
    name: "Indian Institute of Technology (IIT) Delhi",
    location: "New Delhi, India",
    students: "10,000+",
    posts: "800+",
    departments: 30,
    emoji: "🏛️",
    accent: "#003366",
    banner: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    description: "IIT Delhi is a public engineering and research institute in India."
  },
  {
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, Massachusetts",
    students: "11,000+",
    posts: "1,500+",
    departments: 32,
    emoji: "🔬",
    accent: "#A31F34",
    banner: "https://images.unsplash.com/photo-1590483866299-158a18df7cb3?w=800&q=80",
    description: "MIT is a private land-grant research university in Cambridge, Massachusetts."
  },
  {
    name: "Oxford University",
    location: "Oxford, England",
    students: "24,000+",
    posts: "2,000+",
    departments: 38,
    emoji: "🦉",
    accent: "#002147",
    banner: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    description: "The University of Oxford is a collegiate research university in Oxford, England."
  },
  {
    name: "BITS Pilani",
    location: "Pilani, Rajasthan",
    students: "17,000+",
    posts: "900+",
    departments: 15,
    emoji: "🏜️",
    accent: "#0047b3",
    banner: "https://images.unsplash.com/photo-1523050335456-c38a7047d28c?w=800&q=80",
    description: "Birla Institute of Technology and Science, Pilani is an all-India Institute for higher education."
  }
];

const seedColleges = async () => {
  try {
    await connectDB();
    
    // Check existing to avoid duplicates
    for (const collegeData of newColleges) {
      const exists = await College.findOne({ name: collegeData.name });
      if (!exists) {
        const college = new College(collegeData);
        await college.save();
        console.log(`Added: ${collegeData.name}`);
      } else {
        console.log(`Already exists: ${collegeData.name}`);
      }
    }
    
    console.log("Colleges seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding colleges:", error);
    process.exit(1);
  }
};

seedColleges();

import mongoose from 'mongoose';
import 'dotenv/config';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const stats = await mongoose.connection.db.command({ collStats: 'users' });
  console.log(`Users collection size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Avg Object Size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
  console.log(`Total Documents: ${stats.count}`);
  
  process.exit(0);
}
run();

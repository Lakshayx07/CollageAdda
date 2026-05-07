/**
 * One-time migration: merge duplicate university groups into one per university.
 * Run with: node migrateUniversityGroups.js
 */
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import ChatRoom from './src/models/ChatRoom.js';
import User from './src/models/User.js';

const migrate = async () => {
  await connectDB();
  console.log('Connected. Starting university group migration...\n');

  // Get all group chat rooms grouped by university
  const groups = await ChatRoom.find({ isGroup: true }).sort({ createdAt: 1 });

  // Group them by university name
  const byUniversity = {};
  for (const room of groups) {
    const uni = (room.university || '').trim();
    if (!uni || uni === 'Other') continue;
    if (!byUniversity[uni]) byUniversity[uni] = [];
    byUniversity[uni].push(room);
  }

  for (const [uni, rooms] of Object.entries(byUniversity)) {
    if (rooms.length <= 1) {
      console.log(`✅ ${uni}: already has 1 group (${rooms[0]._id})`);
      continue;
    }

    console.log(`🔀 ${uni}: found ${rooms.length} groups — merging...`);

    // Keep the oldest group (first created) as canonical
    const canonical = rooms[0];
    const duplicates = rooms.slice(1);

    // Collect all unique participant IDs from all duplicate rooms
    const allParticipantIds = new Set(
      canonical.participants.map(id => id.toString())
    );

    for (const dup of duplicates) {
      for (const pid of dup.participants) {
        allParticipantIds.add(pid.toString());
      }
      // Delete the duplicate room
      await ChatRoom.findByIdAndDelete(dup._id);
      console.log(`  🗑  Deleted duplicate group: ${dup._id}`);
    }

    // Update canonical with all merged participants
    canonical.participants = [...allParticipantIds].map(
      id => new mongoose.Types.ObjectId(id)
    );
    await canonical.save();
    console.log(`  ✅ Canonical group ${canonical._id} now has ${canonical.participants.length} members\n`);
  }

  // Also ensure every user is in their university's canonical group
  console.log('\nEnsuring all users are in their university group...');
  const allUsers = await User.find({ university: { $exists: true, $ne: 'Other' } });

  for (const user of allUsers) {
    const uni = (user.university || '').trim();
    if (!uni || uni === 'Other') continue;

    let room = await ChatRoom.findOne({ university: uni, isGroup: true });
    if (!room) {
      room = await ChatRoom.create({
        groupName: `${uni} Common Group`,
        university: uni,
        isGroup: true,
        participants: [user._id]
      });
      console.log(`  Created group for ${uni}`);
    } else {
      const isMember = room.participants.some(
        id => id.toString() === user._id.toString()
      );
      if (!isMember) {
        room.participants.push(user._id);
        await room.save();
        console.log(`  Added ${user.email} to ${uni} group`);
      }
    }
  }

  console.log('\n✅ Migration complete!');
  process.exit(0);
};

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

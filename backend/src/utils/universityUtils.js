import ChatRoom from '../models/ChatRoom.js';

/**
 * Ensures a user is a participant in their university's common group.
 * If the group doesn't exist, it creates it.
 * 
 * @param {Object} user - The user model instance
 */
export const ensureUniversityGroup = async (user) => {
  // Normalize university name — trim whitespace
  const universityName = (user.university || '').trim();
  if (!universityName || universityName === 'Other') return;

  try {
    // Find by exact university name
    let universityRoom = await ChatRoom.findOne({
      university: universityName,
      isGroup: true
    });

    if (!universityRoom) {
      // Create the one canonical group for this university
      universityRoom = await ChatRoom.create({
        groupName: `${universityName} Common Group`,
        university: universityName,
        isGroup: true,
        participants: [user._id]
      });
      console.log(`Created university group for: ${universityName}`);
    } else {
      // Add user if not already a member
      const alreadyMember = universityRoom.participants.some(
        id => id.toString() === user._id.toString()
      );
      if (!alreadyMember) {
        universityRoom.participants.push(user._id);
        await universityRoom.save();
        console.log(`Added ${user.email} to existing group: ${universityName}`);
      }
    }
  } catch (err) {
    console.error("Error joining university room:", err);
  }
};

const mongoose = require('mongoose');

async function main() {
    const uri = "mongodb+srv://lakshayyadav288_db_user:e8jJj6mu2zV721zM@cluster0.jbx5ljd.mongodb.net/collegeadda?retryWrites=true&w=majority";
    await mongoose.connect(uri);

    try {
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({
            $or: [
                { name: /Test Login/i },
                { name: /Test Bug/i }
            ]
        }).toArray();
        console.log(JSON.stringify(users, null, 2));
    } finally {
        await mongoose.disconnect();
    }
}
main().catch(console.error);

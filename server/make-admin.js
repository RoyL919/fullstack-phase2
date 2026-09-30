const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);

async function makeAdmin() {
    try {
        await client.connect();

        const db = client.db('chatDB');
        const users = db.collection('users');

        const username = process.argv[2];

        if (!username) {
            console.log('Please provide a username.');
            return;
        }

        const result = await users.updateOne(
            { username: username },
            { $set: { role: 'admin' } }
        );

        if (result.matchedCount === 0) {
            console.log(`User "${username}" not found.`);
        } else {
            console.log(`User "${username}" is now an admin.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

makeAdmin();
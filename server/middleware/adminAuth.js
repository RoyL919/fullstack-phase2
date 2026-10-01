const { ObjectId } = require('mongodb');
const { getDB } = require('../db/database');

async function adminAuth(req, res, next) {
    try {
        const userId = req.headers['user-id'];

        if (!userId) {
            return res.status(401).json({
                message: 'Authentication required'
            });
        }

        if (!ObjectId.isValid(userId)) {
            return res.status(401).json({
                message: 'Invalid user'
            });
        }

        const db = getDB();

        const user = await db.collection('users').findOne({
            _id: new ObjectId(userId)
        });

        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                message: 'Administrator access required'
            });
        }

        req.currentUser = user;
        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to verify permissions'
        });
    }
}

module.exports = adminAuth;
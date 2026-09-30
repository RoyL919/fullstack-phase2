const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db/database');

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
    try {
        const db = getDB();

        const users = await db.collection('users')
            .find({})
            .project({ password: 0 })
            .toArray();

        res.json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Unable to load users'
        });
    }
});

// Change a user's role
router.put('/:id/role', async (req, res) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid role'
            });
        }

        const db = getDB();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { role } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User role updated'
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to update user'
        });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();

        const result = await db.collection('users').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'User deleted'
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to delete user'
        });
    }
});

module.exports = router;
const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db/database');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all users
router.get('/', adminAuth, async (req, res) => {
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
router.put('/:id/role', adminAuth, async (req, res) => {
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
router.delete('/:id', adminAuth, async (req, res) => {
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

// Update user's profile image
router.put('/:id/profile-image', async (req, res) => {
    try {
        const { profileImage } = req.body;

        if (!profileImage) {
            return res.status(400).json({
                message: 'Profile image is required'
            });
        }

        const db = getDB();

        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(req.params.id) },
            {
                $set: {
                    profileImage: profileImage
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'Profile image updated',
            profileImage
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to update profile image'
        });
    }
});

// Update user description
router.put('/:id/description', async (req, res) => {
    try {
        const { description } = req.body;

        if (typeof description !== 'string') {
            return res.status(400).json({
                message: 'Description is required'
            });
        }

        const db = getDB();

        const result = await db.collection('users').updateOne(
            {
                _id: new ObjectId(req.params.id)
            },
            {
                $set: {
                    description: description.trim()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'Description updated',
            description: description.trim()
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to update description'
        });
    }
});

module.exports = router;
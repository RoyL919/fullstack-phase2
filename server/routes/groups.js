const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db/database');

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const groups = await db.collection('groups').find({}).toArray();

        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Unable to load groups'
        });
    }
});

// Create group
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Group name is required'
            });
        }

        const db = getDB();

        const existingGroup = await db.collection('groups').findOne({
            name: name.trim()
        });

        if (existingGroup) {
            return res.status(400).json({
                message: 'Group already exists'
            });
        }

        const group = {
            name: name.trim(),
            members: [],
            createdAt: new Date()
        };

        const result = await db.collection('groups').insertOne(group);

        res.status(201).json({
            message: 'Group created',
            groupId: result.insertedId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Unable to create group'
        });
    }
});

// Add user to group
router.post('/:groupId/members/:userId', async (req, res) => {
    try {
        const db = getDB();

        const result = await db.collection('groups').updateOne(
            { _id: new ObjectId(req.params.groupId) },
            {
                $addToSet: {
                    members: new ObjectId(req.params.userId)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        res.json({
            message: 'User added to group'
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: 'Unable to add user to group'
        });
    }
});

// Delete group
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();

        const result = await db.collection('groups').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        res.json({
            message: 'Group deleted'
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: 'Unable to delete group'
        });
    }
});

// Remove user from group
router.delete('/:groupId/members/:userId', async (req, res) => {
    try {
        const db = getDB();

        const result = await db.collection('groups').updateOne(
            { _id: new ObjectId(req.params.groupId) },
            {
                $pull: {
                    members: new ObjectId(req.params.userId)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        res.json({
            message: 'User removed from group'
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to remove user from group'
        });
    }
});

module.exports = router;
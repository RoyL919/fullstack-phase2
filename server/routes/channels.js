const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db/database');

const router = express.Router();

// Get all channels
router.get('/', async (req, res) => {
    try {
        const db = getDB();

        const channels = await db.collection('channels')
            .find({})
            .toArray();

        res.json(channels);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to load channels'
        });
    }
});

// Get channels belonging to one group
router.get('/group/:groupId', async (req, res) => {
    try {
        const db = getDB();

        const channels = await db.collection('channels')
            .find({
                groupId: new ObjectId(req.params.groupId)
            })
            .toArray();

        res.json(channels);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to load channels'
        });
    }
});

// Create channel
router.post('/', async (req, res) => {
    try {
        const { name, groupId } = req.body;

        if (!name || !groupId) {
            return res.status(400).json({
                message: 'Channel name and group are required'
            });
        }

        const db = getDB();

        const group = await db.collection('groups').findOne({
            _id: new ObjectId(groupId)
        });

        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            });
        }

        const channel = {
            name: name.trim(),
            groupId: new ObjectId(groupId),
            createdAt: new Date()
        };

        const result = await db.collection('channels').insertOne(channel);

        res.status(201).json({
            message: 'Channel created',
            channelId: result.insertedId
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to create channel'
        });
    }
});

// Delete channel
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();

        const result = await db.collection('channels').deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: 'Channel not found'
            });
        }

        res.json({
            message: 'Channel deleted'
        });

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to delete channel'
        });
    }
});

module.exports = router;
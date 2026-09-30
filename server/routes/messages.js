const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db/database');

const router = express.Router();

// Get messages for one channel
router.get('/:channelId', async (req, res) => {
    try {
        const db = getDB();

        const messages = await db.collection('messages')
            .find({
                channelId: new ObjectId(req.params.channelId)
            })
            .sort({ timestamp: 1 })
            .toArray();

        res.json(messages);

    } catch (error) {
        console.error(error);

        res.status(400).json({
            message: 'Unable to load messages'
        });
    }
});

module.exports = router;
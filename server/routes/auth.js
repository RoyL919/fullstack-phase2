const express = require('express');
const bcrypt = require('bcrypt');
const { getDB } = require('../db/database');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    try {
        let { username, password } = req.body;

        // Check data types
        if (
            typeof username !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                message: 'Username and password must be text'
            });
        }

        // Remove accidental spaces
        username = username.trim();

        // Required fields
        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        // Username validation
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({
                message: 'Username must be between 3 and 20 characters'
            });
        }

        // Only simple username characters
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({
                message: 'Username can only contain letters, numbers and underscores'
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const db = getDB();
        const users = db.collection('users');

        const existingUser = await users.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: 'Username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username,
            password: hashedPassword,
            role: 'user',
            profileImage: '',
            groups: []
        };

        await users.insertOne(newUser);

        res.status(201).json({
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Unable to register user. Please try again.'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        let { username, password } = req.body;

    if (
        typeof username !== 'string' ||
        typeof password !== 'string'
    ) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    username = username.trim();

        if (!username || !password) {
            return res.status(400).json({
                message: 'Username and password are required'
            });
        }

        const db = getDB();
        const users = db.collection('users');

        const user = await users.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCorrect) {
            return res.status(401).json({
                message: 'Invalid username or password'
            });
        }

        res.json({
            message: 'Login successful',
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                groups: user.groups
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

module.exports = router;
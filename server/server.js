const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB } = require('./db/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const channelRoutes = require('./routes/channels');
const messageRoutes = require('./routes/messages');


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);


app.get('/api/test', (req, res) => {
    res.json({
        message: 'Server is working'
    });
});

io.on('connection', (socket) => {

    console.log('User connected:', socket.id);

    // User joins a channel
    socket.on('joinChannel', ({ channelId, username }) => {

        socket.join(channelId);

        console.log(`${username} joined channel ${channelId}`);

        socket.to(channelId).emit('userJoined', {
            username: username,
            message: `${username} joined the channel`
        });
    });

    // User sends a chat message
    socket.on('chatMessage', async ({ channelId, username, message }) => {

        try {
            const { getDB } = require('./db/database');
            const { ObjectId } = require('mongodb');

            const db = getDB();

            const chatMessage = {
                channelId: new ObjectId(channelId),
                username: username,
                message: message.trim(),
                timestamp: new Date()
            };

            await db.collection('messages').insertOne(chatMessage);

            console.log(`${username}: ${message}`);

            io.to(channelId).emit('chatMessage', chatMessage);

        } catch (error) {
            console.error('Message error:', error);
        }
    });

    // User leaves a channel
    socket.on('leaveChannel', ({ channelId, username }) => {

        socket.leave(channelId);

        socket.to(channelId).emit('userLeft', {
            username: username,
            message: `${username} left the channel`
        });

        console.log(`${username} left channel ${channelId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

});

const PORT = 3000;

connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to start server:', error);
    });
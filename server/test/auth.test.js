const request = require('supertest');
const express = require('express');
const { expect } = require('chai');

const authRoutes = require('../routes/auth');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API', function () {

    it('should reject registration when username is missing', async function () {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                password: 'test123'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message)
            .to.equal('Username and password must be text');
    });

    it('should reject a username shorter than 3 characters', async function () {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'ab',
                password: 'test123'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message)
            .to.equal('Username must be between 3 and 20 characters');
    });

    it('should reject invalid username characters', async function () {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'test user!',
                password: 'test123'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message)
            .to.equal(
                'Username can only contain letters, numbers and underscores'
            );
    });

    it('should reject a password shorter than 6 characters', async function () {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                password: '123'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message)
            .to.equal('Password must be at least 6 characters');
    });

    it('should reject login when username or password is missing', async function () {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'testuser'
            });

        expect(response.status).to.equal(400);
        expect(response.body.message)
            .to.equal('Username and password are required');
    });

});
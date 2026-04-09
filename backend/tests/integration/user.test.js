const request = require('supertest');
const { app, server, io } = require('../../src/server');
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');

describe('Integration Test: User Profile API', () => {
    let token;
    let userId;

    beforeAll(async () => {
        const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/routex_test";
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url);
        }

        // Create a test user
        await User.deleteOne({ email: "profileuser@example.com" });
        const user = await User.create({
            full_name: "Profile User",
            email: "profileuser@example.com",
            phone_number: "0770000000",
            password_hash: "hashedpassword",
            role: "entrepreneur"
        });
        userId = user._id;

        token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'testsecret',
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        await User.deleteOne({ email: "profileuser@example.com" });
        await mongoose.connection.close();
        io.close();
        server.close();
    });

    test('GET /api/users/profile - Should return user profile', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', `Bearer ${token}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'profileuser@example.com');
        expect(res.body).not.toHaveProperty('password_hash');
    });

    test('PUT /api/users/update - Should update user profile', async () => {
        const res = await request(app)
            .put('/api/users/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                full_name: "Updated Name",
                phone_number: "0771111111"
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.user).toHaveProperty('full_name', 'Updated Name');
        expect(res.body.user).toHaveProperty('phone_number', '0771111111');
    });

    test('GET /api/users/profile - Should fail without token', async () => {
        const res = await request(app).get('/api/users/profile');
        expect(res.statusCode).toBe(401);
    });
});
const request = require('supertest');
const { app, server, io } = require('../../src/server');
const mongoose = require('mongoose');
const User = require('../../src/models/User');

describe('Integration Test: Authentication API', () => {
    
    beforeAll(async () => {
        // Use test DB
        const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/routex_test";
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url);
        }
    });

    afterAll(async () => {
        // Cleanup: Delete test user
        await User.deleteOne({ email: "testuser@example.com" });
        await mongoose.connection.close();
        io.close();
        server.close();
    });

    beforeEach(async () => {
        // Ensure test user is removed before each test to prevent conflicts
        await User.deleteOne({ email: "testuser@example.com" });
    });

    test('POST /api/auth/register - Should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                full_name: "Test User",
                email: "testuser@example.com",
                phone_number: "0771234567",
                password: "password123",
                role: "entrepreneur"
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', 'testuser@example.com');
    });

    test('POST /api/auth/register - Should register a new driver successfully', async () => {
        await User.deleteOne({ email: "drivertest@example.com" });
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                full_name: "Test Driver",
                email: "drivertest@example.com",
                phone_number: "0777654321",
                password: "password123",
                role: "driver",
                vehicle_type: "bike",
                license_number: "LIC12345"
            });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.user).toHaveProperty('role', 'driver');
        expect(res.body.user).toHaveProperty('is_verified', false);
        await User.deleteOne({ email: "drivertest@example.com" });
    });

    test('POST /api/auth/register - Should fail if driver missing license', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                full_name: "Fail Driver",
                email: "faildriver@example.com",
                phone_number: "0770000000",
                password: "password123",
                role: "driver",
                vehicle_type: "bike"
            });
        
        expect(res.statusCode).toBe(400);
    });

    test('POST /api/auth/login - Should login and return a token', async () => {
        // First register the user
        await request(app)
            .post('/api/auth/register')
            .send({
                full_name: "Test User",
                email: "testuser@example.com",
                phone_number: "0771234567",
                password: "password123",
                role: "entrepreneur"
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: "testuser@example.com",
                password: "password123"
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.message).toBe("Login successful");
    });

    test('POST /api/auth/login - Should fail with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: "nonexistent@example.com",
                password: "wrongpassword"
            });
        
        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Invalid email or password");
    });
});
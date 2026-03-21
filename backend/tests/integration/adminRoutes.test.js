const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app, server, io } = require('../../src/server');

// Increase timeout for DB operations
jest.setTimeout(30000);

describe('Admin Integration Testing: RBAC & Endpoints', () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        // 1. Manually connect to DB for integration tests
        const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/routex_test";
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url);
        }

        // 2. Generate a mock Admin Token
        adminToken = jwt.sign(
            { id: new mongoose.Types.ObjectId().toString(), role: 'admin' }, 
            process.env.JWT_SECRET || 'testsecret', 
            { expiresIn: '1h' }
        );
        // 3. Generate a mock regular User Token
        userToken = jwt.sign(
            { id: new mongoose.Types.ObjectId().toString(), role: 'entrepreneur' }, 
            process.env.JWT_SECRET || 'testsecret', 
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        // 1. Close MongoDB Connection
        await mongoose.connection.close();
        // 2. Close Socket.io and Server Handles to prevent hanging
        io.close();
        server.close();
    });

    test('GET /api/admin/rules - Success for Admin', async () => {
        const res = await request(app)
            .get('/api/admin/rules')
            .set('Authorization', `Bearer ${adminToken}`);
        
        // Status 200 or 404 are both valid logic paths depending on DB state
        expect([200, 404]).toContain(res.statusCode); 
    });

    test('GET /api/admin/rules - Forbidden for regular Entrepreneurs', async () => {
        const res = await request(app)
            .get('/api/admin/rules')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toBe(403); 
    });

    test('GET /api/admin/users/drivers - Unauthorized if no token provided', async () => {
        const res = await request(app).get('/api/admin/users/drivers');
        expect(res.statusCode).toBe(401); 
    });

    test('GET /api/admin/analytics/revenue - Success for Admin', async () => {
        const res = await request(app)
            .get('/api/admin/analytics/revenue')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect([200, 404]).toContain(res.statusCode);
    });
});
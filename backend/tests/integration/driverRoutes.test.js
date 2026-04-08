const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { app, server, io } = require('../../src/server');
const User = require('../../src/models/User');
const Order = require('../../src/models/deliveryModel');
const DriverLocation = require('../../src/models/DriverLocation');

jest.setTimeout(30000);

describe('Driver Integration Testing: Endpoints', () => {
    let driverToken;
    let driverId = new mongoose.Types.ObjectId();

    beforeAll(async () => {
        const url = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/routex_test";
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(url);
        }

        driverToken = jwt.sign(
            { id: driverId.toString(), role: 'driver' }, 
            process.env.JWT_SECRET || 'testsecret', 
            { expiresIn: '1h' }
        );

        // Ensure driver exists and is verified
        await User.findOneAndUpdate(
            { _id: driverId },
            { 
              role: 'driver', 
              is_verified: true, 
              full_name: 'Test Driver',
              email: 'driver@test.com',
              password: 'hashedpassword'
            },
            { upsert: true, new: true }
        );
    });

    afterAll(async () => {
        await User.findByIdAndDelete(driverId);
        await mongoose.connection.close();
        io.close();
        server.close();
    });

    test('POST /api/driver/location - Success', async () => {
        const res = await request(app)
            .post('/api/driver/location')
            .set('Authorization', `Bearer ${driverToken}`)
            .send({
                driver_id: driverId.toString(),
                lat: 6.9,
                lng: 79.9,
                driver_status: 'online'
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('GET /api/driver/orders/available - Success', async () => {
        const res = await request(app)
            .get('/api/driver/orders/available?vehicle_type=bike')
            .set('Authorization', `Bearer ${driverToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('POST /api/driver/orders/accept - Failure if order invalid', async () => {
        const res = await request(app)
            .post('/api/driver/orders/accept')
            .set('Authorization', `Bearer ${driverToken}`)
            .send({
                order_id: new mongoose.Types.ObjectId(),
                driver_id: driverId.toString()
            });
        
        expect(res.statusCode).toBe(400);
    });

    test('GET /api/driver/orders/active - Success', async () => {
        const res = await request(app)
            .get('/api/driver/orders/active')
            .set('Authorization', `Bearer ${driverToken}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

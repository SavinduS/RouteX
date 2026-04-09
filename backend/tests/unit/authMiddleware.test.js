const authMiddleware = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Unit Test: Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    test('Should return 401 if no Authorization header is provided', () => {
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing' });
    });

    test('Should return 401 if Authorization header does not start with Bearer ', () => {
        req.headers.authorization = 'InvalidToken';

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token format' });
    });

    test('Should return 401 if token is invalid or expired', () => {
        req.headers.authorization = 'Bearer invalidtoken';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    });

    test('Should call next() if token is valid', () => {
        const mockUser = { id: 'user123', role: 'entrepreneur' };
        req.headers.authorization = 'Bearer validtoken';
        jwt.verify.mockReturnValue(mockUser);
        
        // Mocking process.env.JWT_SECRET
        process.env.JWT_SECRET = 'testsecret';

        authMiddleware(req, res, next);

        expect(req.user).toEqual({ id: 'user123', role: 'entrepreneur' });
        expect(next).toHaveBeenCalled();
    });
});
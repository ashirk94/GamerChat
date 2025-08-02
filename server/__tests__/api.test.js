import request from 'supertest';
import express from 'express';

// Mock express app for testing
const createTestApp = () => {
    const app = express();
    app.use(express.json());
    
    // Mock routes
    app.get('/api/health', (req, res) => {
        res.status(200).json({ status: 'OK', message: 'Server is running' });
    });
    
    app.post('/api/test', (req, res) => {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        res.status(200).json({ received: message });
    });
    
    return app;
};

describe('Server API Tests', () => {
    let app;
    
    beforeEach(() => {
        app = createTestApp();
    });
    
    test('GET /api/health returns server status', async () => {
        const response = await request(app)
            .get('/api/health')
            .expect(200);
        
        expect(response.body).toEqual({
            status: 'OK',
            message: 'Server is running'
        });
    });
    
    test('POST /api/test with valid data', async () => {
        const testMessage = 'Hello, test!';
        
        const response = await request(app)
            .post('/api/test')
            .send({ message: testMessage })
            .expect(200);
        
        expect(response.body).toEqual({
            received: testMessage
        });
    });
    
    test('POST /api/test without message returns error', async () => {
        const response = await request(app)
            .post('/api/test')
            .send({})
            .expect(400);
        
        expect(response.body).toEqual({
            error: 'Message is required'
        });
    });
    
    test('GET unknown route returns 404', async () => {
        await request(app)
            .get('/api/unknown')
            .expect(404);
    });
});

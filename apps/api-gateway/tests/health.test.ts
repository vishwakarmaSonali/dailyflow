import request from 'supertest';
import app from '../src/main';

describe('Health Router', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBeLessThanOrEqual(503);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should have services array in response', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('services');
    expect(Array.isArray(response.body.services)).toBe(true);
  });
});

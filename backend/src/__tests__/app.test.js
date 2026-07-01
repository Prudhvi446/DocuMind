const request = require('supertest');
const app = require('../index');

describe('App', () => {
  it('should return 200 OK on health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

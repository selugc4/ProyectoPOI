const request = require('supertest');
const app = require('./app');

describe('App Routes', () => {
    test("app should be defined", () => {
        expect(app).toBeDefined();
    }
    );
});
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { dbURI } = require('../environment/environment');

beforeAll(async () => {
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Rutas /locations', () => {

  let createdLocationId;
  test('POST /locations - debe crear una location', () => {
    return request(app)
      .post('/locations/')
      .send({
        name: 'Parque Central',
        address: 'Calle Falsa 123',
        locality: 'Madrid',
        region: 'Madrid',
        country: 'España',
        Otherlng: -3.7038,
        Otherlat: 40.4168,
        Ownlng: -3.7040,
        Ownlat: 40.4170,
        image: 'https://example.com/image.jpg'
      }, 10000)
      .expect(201)
      .then(res => {
        expect(res.body.name).toBe('Parque Central');
        createdLocationId = res.body._id;
      });
  });
  test('POST /locations - error por datos faltantes', () => {
    return request(app)
      .post('/locations/')
      .send({ name: '' })
      .expect(500); 
  });
  test('GET /locations?name=Parque - debe devolver resultados', () => {
    return request(app)
      .get('/locations/?name=Parque')
      .expect(200)
      .then(res => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
  test('GET /locations con múltiples filtros - error 400', () => {
    return request(app)
      .get('/locations?name=Parque&date=2025-06-01')
      .expect(400);
  });
  test('PUT /locations/:id - actualiza una location', () => {
    return request(app)
      .put(`/locations/${createdLocationId}`)
      .send({
        name: 'Parque Renovado',
        address: 'Calle Nueva 456',
        locality: 'Madrid',
        region: 'Madrid',
        country: 'España',
        Otherlng: -3.70,
        Otherlat: 40.41,
        Ownlng: -3.71,
        Ownlat: 40.42,
        image: 'https://example.com/otra.jpg'
      })
      .expect(200)
      .then(res => {
        expect(res.body.name).toBe('Parque Renovado');
      });
  });
  test('PUT /locations/:id - error por ID inválido', () => {
    return request(app)
      .put('/locations/invalid-id')
      .send({ name: 'Algo' })
      .expect(400);
  });
  test('DELETE /locations/:id - elimina una location', () => {
    return request(app)
      .delete(`/locations/${createdLocationId}`)
      .expect(204);
  });
  test('DELETE /locations/:id - error por ID inexistente', () => {
    return request(app)
      .delete(`/locations/${createdLocationId}`) 
      .expect(404);
  });
  test('GET /locationsApi?name=museum - resultados de Foursquare', () => {
    return request(app)
      .get('/locationsApi?name=museum')
      .expect(200)
      .then(res => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
  test('GET /locationsApi con name y region - error 400', () => {
    return request(app)
      .get('/locationsApi?name=foo&region=bar')
      .expect(400);
  });
});
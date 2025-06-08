const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { dbURI, firebaseConfig} = require('../environment/environment');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET} = require('../environment/environment');

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
let customJwt;
beforeAll(async () => {
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const userCredential = await signInWithEmailAndPassword(auth, 'paco123@gmail.com', 'contraseña');
  const firebaseUser = userCredential.user;
  customJwt = jwt.sign({ uid: firebaseUser.uid }, JWT_SECRET, { expiresIn: '1h' });
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
      })
      .expect(201)
      .set('Authorization', `Bearer ${customJwt}`)
      .then(res => {
        expect(res.body.name).toBe('Parque Central');
        createdLocationId = res.body._id;
      });
  }, 20000);
  test('POST /locations - error por datos faltantes', () => {
    return request(app)
      .post('/locations/')
      .set('Authorization', `Bearer ${customJwt}`)
      .send({ name: '' })
      .expect(500); 
  });
  test('POST /locations/many - debe crear varias locations', () => {
    return request(app)
      .post('/locations/many')
      .send([{
        name: 'Parque Central',
        address: 'Calle Falsa 123',
        locality: 'Madrid',
        region: 'Madrid',
        country: 'España',
        Otherlng: -3.7038,
        Otherlat: 40.4168,
        Ownlng: -3.7040,
        Ownlat: 40.4170,
        image: 'https://cdn-icons-png.flaticon.com/512/15/15470.png'
      },
      {
        name: 'Lugar B',
        address: 'Calle B',
        locality: 'Localidad B',
        region: 'Región B',
        country: 'España',
        fsq_id: 'idfsq2',
        Otherlng: -3.7048,
        Otherlat: 40.4178,
        Ownlng: -3.7049,
        Ownlat: 40.4179,
        image: 'https://cdn-icons-png.flaticon.com/512/15/15470.png'
      }
      ]
    )
      .expect(201)
      .set('Authorization', `Bearer ${customJwt}`)
  }, 20000);
    test('POST /locations/many - error por datos faltantes', () => {
    return request(app)
      .post('/locations/many')
      .set('Authorization', `Bearer ${customJwt}`)
      .send([{ name: '' }, { name: '' }])
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
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(200)
      .then(res => {
        expect(res.body.name).toBe('Parque Renovado');
      });
  });
  test('PUT /locations/:id - error por ID inválido', () => {
    return request(app)
      .put('/locations/invalid-id')
      .set('Authorization', `Bearer ${customJwt}`)
      .send({ name: 'Algo' })
      .expect(400);
  });
  test('DELETE /locations/:id - elimina una location', () => {
    return request(app)
      .delete(`/locations/${createdLocationId}`)
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(204);
  });
  test('DELETE /locations/:id - error por ID inexistente', () => {
    const fakeId = '60d21b4667d0d8992e610c99'; 
    return request(app)
      .delete(`/locations/${fakeId}`)
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(404);
  });
  test('GET /locationsApi?name=museum&lat=41.3851&lng=2.1734- resultados de Foursquare', () => {
    return request(app)
      .get('/locationsApi?name=museum&lat=41.3851&lng=2.1734')
      .expect(200)
      .set('Authorization', `Bearer ${customJwt}`)
      .then(res => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
  test('GET /locationsApi con name y region - error 400', () => {
    return request(app)
      .get('/locationsApi?name=foo&region=bar')
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(400);
  });
  test('debe devolver la location si el id es válido y existe', async () => {
    const locData = {
      name: 'Lugar Test',
      address: 'Calle Test 123',
      locality: 'Testville',
      region: 'TestRegion',
      country: 'Testland',
      Otherlng: -3.7,
      Otherlat: 40.4,
      Ownlng: -3.7,
      Ownlat: 40.4,
      image: 'https://cdn-icons-png.flaticon.com/512/15/15470.png'
    };
    const resCreate = await request(app)
      .post('/locations/')
      .send(locData)
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(201);

    const id = resCreate.body._id;
    const res = await request(app)
      .get(`/locations/${id}`)
      .expect(200);

    expect(res.body).toHaveProperty('name', 'Lugar Test');
    await request(app)
      .delete(`/locations/${id}`)
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(204);
  }, 20000);

  test('debe devolver 404 si la location no existe', () => {
    const fakeId = '507f1f77bcf86cd799439011';
    return request(app)
      .get(`/locations/${fakeId}`)
      .expect(404);
  });
});
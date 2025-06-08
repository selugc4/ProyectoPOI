const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Loc = mongoose.model('Location');
const { dbURI, firebaseConfig} = require('../environment/environment');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const jwt = require('jsonwebtoken');
const { JWT_SECRET} = require('../environment/environment');

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
let customJwt;
let createdLocationId = null;
let createdReviewId = null;

beforeAll(async () => {
  await mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const userCredential = await signInWithEmailAndPassword(auth, 'paco123@gmail.com', 'contraseña');
  const firebaseUser = userCredential.user;
  customJwt = jwt.sign({ uid: firebaseUser.uid }, JWT_SECRET, { expiresIn: '1h' });
  const location = await Loc.create({
    name: 'Review Location Test',
    address: 'Somewhere 123',
    locality: 'Testville',
    region: 'TestRegion',
    country: 'Testland',
    locationCoords: { type: 'Point', coordinates: [0, 0] },
    ownCoords: { type: 'Point', coordinates: [0, 0] },
    image: 'image.jpg'
  });

  createdLocationId = location._id.toString();
});

afterAll(async () => {
  await Loc.findByIdAndDelete(createdLocationId);
  await mongoose.connection.close();
});

describe('Review routes', () => {
  test('POST /locations/:locationid/reviews - éxito', async () => {
    const response = await request(app)
      .post(`/locations/${createdLocationId}/reviews`)
      .send({
        author: 'Test Author',
        rating: 5,
        reviewText: 'Excelente lugar'
      })
      .expect(201);

    expect(response.body.author).toBe('Test Author');
    createdReviewId = response.body._id;
  });

  test('POST /locations/:locationid/reviews - error (ID inválido)', async () => {
    await request(app)
      .post('/locations/invalidid/reviews')
      .send({
        author: 'Test Author',
        rating: 4,
        reviewText: 'Texto'
      })
      .expect(500);
  });

  test('GET /locations/:locationid/reviews - éxito', async () => {
    const res = await request(app)
      .get(`/locations/${createdLocationId}/reviews`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /locations/:locationid/reviews - error (ID inválido)', async () => {
    await request(app)
      .get('/locations/invalidid/reviews')
      .expect(500);
  });

  test('DELETE /locations/:locationid/reviews/:reviewid - éxito', async () => {
    await request(app)
      .delete(`/locations/${createdLocationId}/reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(204);
  });

  test('DELETE /locations/:locationid/reviews/:reviewid - error (review no encontrada)', async () => {
    await request(app)
      .delete(`/locations/${createdLocationId}/reviews/000000000000000000000000`)
      .set('Authorization', `Bearer ${customJwt}`)
      .expect(404);
  });
});
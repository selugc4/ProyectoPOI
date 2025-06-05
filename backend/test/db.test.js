const mongoose = require('mongoose');
const { dbURI } = require('../environment/environment');
require('../models/location');

describe('Conexión a la base de datos', () => {

  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  test('Debe conectarse exitosamente a MongoDB con URI válida', async () => {
    const uriValida = dbURI;
    console.log('Conectando a MongoDB con URI:', uriValida);
    await expect(mongoose.connect(uriValida, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })).resolves.toBeDefined();
  });

  test('Debe fallar la conexión con URI inválida', async () => {
    const uriInvalida = 'mongodb://localhost:12345/fake-db';
    await expect(mongoose.connect(uriInvalida, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 1000
    })).rejects.toThrow();
  });
});
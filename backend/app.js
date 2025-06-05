const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./models/db');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Configuración Swagger ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Locations y Reviews',
      version: '1.0.0',
      description: 'Documentación de la API para Locations y Reviews'
    },
    servers: [
      {
        url: 'http://localhost:3000', // Cambia el puerto si es necesario
        description: 'Servidor local'
      }
    ]
  },
  apis: [path.join(__dirname, './routes/*.js')]  // Aquí lee los comentarios swagger en la carpeta routes
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

// Ruta para la UI de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Tus rutas
app.use('/', indexRouter);

// Catch 404 y forward al handler de errores
app.use(function(req, res, next) {
  res.status(404).json({ message: 'Not Found' });
});

// Handler de errores
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
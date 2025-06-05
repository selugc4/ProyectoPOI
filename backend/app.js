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
        url: 'https://twm-a0gahqe6exa7fxh6.westeurope-01.azurewebsites.net',
        description: 'Servidor local'
      }
    ]
  },
  apis: [path.join(__dirname, './routes/*.js')]
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/', indexRouter);

app.use(function(req, res) {
  res.status(404).json({ message: 'Not Found' });
});
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
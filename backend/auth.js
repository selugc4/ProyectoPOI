const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('./environment/environment');
const authorizeJWT = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token inválido:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = authorizeJWT;
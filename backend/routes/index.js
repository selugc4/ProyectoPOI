const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/location');
const ctrlReviews = require('../controllers/review');

router.get('/locations/', ctrlLocations.locationsReadByNameDatePlace);
router.post('/locations/', ctrlLocations.locationsCreate);
router.post('/locations/many', ctrlLocations.locationsCreateMany);
router.delete('/locations/:locationid', ctrlLocations.locationsDeleteOne);
router.put('/locations/:locationid', ctrlLocations.locationsUpdateOne);
router.get('/locationsApi/', ctrlLocations.foursquareSearch);

router.get('/locations/:locationid/reviews', ctrlReviews.getReviewsByLocationId);
router.post('/locations/:locationid/reviews', ctrlReviews.addReview);
router.delete('/locations/:locationid/reviews/:reviewid', ctrlReviews.deleteReview);
module.exports = router;
/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: Operaciones relacionadas con ubicaciones
 *   - name: Reviews
 *     description: Operaciones relacionadas con reseñas

 * /locations/:
 *   get:
 *     tags: [Locations]
 *     summary: Obtener ubicaciones por nombre, fecha o lugar
 *     responses:
 *       200:
 *         description: Lista de ubicaciones
 *   post:
 *     tags: [Locations]
 *     summary: Crear una nueva ubicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Ubicación creada

 * /locations/many:
 *   post:
 *     tags: [Locations]
 *     summary: Crear varias ubicaciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *     responses:
 *       201:
 *         description: Ubicaciones creadas

 * /locations/{locationid}:
 *   delete:
 *     tags: [Locations]
 *     summary: Eliminar una ubicación por ID
 *     parameters:
 *       - in: path
 *         name: locationid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Ubicación eliminada
 *   put:
 *     tags: [Locations]
 *     summary: Actualizar una ubicación por ID
 *     parameters:
 *       - in: path
 *         name: locationid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Ubicación actualizada

 * /locationsApi/:
 *   get:
 *     tags: [Locations]
 *     summary: Buscar ubicaciones usando la API de Foursquare
 *     responses:
 *       200:
 *         description: Resultados de búsqueda de Foursquare

 * /locations/{locationid}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas de una ubicación
 *     parameters:
 *       - in: path
 *         name: locationid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reseñas
 *   post:
 *     tags: [Reviews]
 *     summary: Agregar una reseña a una ubicación
 *     parameters:
 *       - in: path
 *         name: locationid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Reseña agregada

 * /locations/{locationid}/reviews/{reviewid}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Eliminar una reseña por ID
 *     parameters:
 *       - in: path
 *         name: locationid
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reviewid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Reseña eliminada
 */
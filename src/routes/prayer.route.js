// routes/prayerRequest.route.js
const express = require('express');
const router = express.Router();
const prayerRequestController = require('../controllers/prayer.controller');
const prayerRequestValidation = require('../middleware/prayerRequestValidation');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.get('/prayer-requests/public', prayerRequestController.getPublicPrayerRequests);
router.patch('/prayer-requests/:id/pray', prayerRequestController.incrementPrayerCount);

// Routes protégées
router.use(authMiddleware);

// CRUD des demandes de prière
router.post('/prayer-requests', prayerRequestValidation.create, prayerRequestController.createPrayerRequest);
router.get('/prayer-requests', prayerRequestController.getAllPrayerRequests);
router.get('/prayer-requests/:id', prayerRequestController.getPrayerRequestById);
router.put('/prayer-requests/:id', prayerRequestValidation.update, prayerRequestController.updatePrayerRequest);
router.delete('/prayer-requests/:id', prayerRequestController.deletePrayerRequest);

module.exports = router;
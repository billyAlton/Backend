// routes/sermonRoutes.js
const express = require('express');
const router = express.Router();
const sermonController = require('../controllers/sermon.controller');
const sermonValidation = require('../middleware/validation');
const authMiddleware = require('../middleware/auth'); // Votre middleware d'authentification
router.get('/sermons', sermonController.getAllSermons);
router.get('/sermons/:id', sermonController.getSermonById);

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware);

// Routes pour les sermons
router.post('/sermons', sermonValidation.create, sermonController.createSermon);

router.put('/sermons/:id', sermonValidation.update, sermonController.updateSermon);
router.delete('/sermons/:id', sermonController.deleteSermon);

module.exports = router;
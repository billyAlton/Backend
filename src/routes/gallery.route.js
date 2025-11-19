// routes/gallery.route.js
const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery.controller');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.get('/albums', galleryController.getAlbums);
router.get('/albums/:id', galleryController.getAlbumById);
router.get('/videos', galleryController.getVideos);
router.get('/videos/:id', galleryController.getVideoById);
router.patch('/videos/:id/views', galleryController.incrementViews);

// Routes protégées (admin)
router.use(authMiddleware);

router.post('/albums', galleryController.createAlbum);
router.put('/albums/:id', galleryController.updateAlbum);
router.delete('/albums/:id', galleryController.deleteAlbum);

router.post('/videos', galleryController.createVideo);
router.put('/videos/:id', galleryController.updateVideo);
router.delete('/videos/:id', galleryController.deleteVideo);

module.exports = router;
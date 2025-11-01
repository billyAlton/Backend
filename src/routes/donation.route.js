// routes/donation.route.js
const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const donationValidation = require('../middleware/donationValidation');
const authMiddleware = require('../middleware/auth');

// Routes publiques (pour les dons anonymes)
router.post('/donations', donationValidation.create, donationController.createDonation);

// Routes protégées
router.use(authMiddleware);

// CRUD des dons
router.get('/donations', donationController.getAllDonations);
router.get('/donations/stats', donationController.getDonationStats);
router.get('/donations/user/:id', donationController.getUserDonations);
router.get('/donations/:id', donationController.getDonationById);
router.put('/donations/:id', donationValidation.update, donationController.updateDonation);
router.delete('/donations/:id', donationController.deleteDonation);

module.exports = router;
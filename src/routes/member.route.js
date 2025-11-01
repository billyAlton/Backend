// routes/member.route.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const memberValidation = require('../middleware/memberValidation');
const authMiddleware = require('../middleware/auth');

// Appliquer l'authentification à toutes les routes
router.use(authMiddleware);

// CRUD des membres
router.post('/members', memberValidation.create, memberController.createMember);
router.get('/members', memberController.getAllMembers);
router.get('/members/stats', memberController.getMemberStats);
router.get('/members/email/:email', memberController.getMemberByEmail);
router.get('/members/:id', memberController.getMemberById);
router.put('/members/:id', memberValidation.update, memberController.updateMember);
router.patch('/members/:id/activity', memberController.updateLastActivity);
router.delete('/members/:id', memberController.deleteMember);

module.exports = router;
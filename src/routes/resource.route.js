const express = require('express');
const {
  // Public
  getPublishedResources,
  getResourceById,
  incrementDownloadCount,
  getFAQs,
  
  // Admin
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  getResourceStats
} = require('../controllers/resource.controller');
const authMiddleware = require('../middleware/auth');
const {
  validateResource,
  validateResourceQuery,
  validateResourceId,
  handleValidationErrors
} = require('../middleware/resourceValidation');

const router = express.Router();

// === ROUTES PUBLIQUES ===
router.get(
  '/public',
  validateResourceQuery,
  handleValidationErrors,
  getPublishedResources
);

router.get(
  '/public/faqs',
  getFAQs
);

router.get(
  '/public/:id',
  validateResourceId,
  handleValidationErrors,
  getResourceById
);

router.put(
  '/public/:id/download',
  validateResourceId,
  handleValidationErrors,
  incrementDownloadCount
);

// === ROUTES ADMIN ===
router.get(
  '/admin',
 /*  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  }, */
  validateResourceQuery,
  handleValidationErrors,
  getAllResources
);

router.post(
  '/admin',
  authMiddleware,
 /*  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  }, */
  validateResource,
  handleValidationErrors,
  createResource
);

router.put(
  '/admin/:id',
  authMiddleware,
  /* (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  }, */
  validateResourceId,
  validateResource,
  handleValidationErrors,
  updateResource
);

router.delete(
  '/admin/:id',
  authMiddleware,
/*   (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  }, */
  validateResourceId,
  handleValidationErrors,
  deleteResource
);

router.get(
  '/admin/stats',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  },
  getResourceStats
);

module.exports = router;
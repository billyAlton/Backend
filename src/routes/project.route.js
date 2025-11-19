const express = require('express');
const {
  // Public
  getPublishedProjects,
  getProjectById,
  
  // Admin
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/project.controller');
const authMiddleware = require('../middleware/auth');
const {
  validateProject,
  validateProjectQuery,
  validateProjectId,
  handleValidationErrors
} = require('../middleware/projectValidation');

const router = express.Router();

// === ROUTES PUBLIQUES ===
router.get(
  '/public',
  validateProjectQuery,
  handleValidationErrors,
  getPublishedProjects
);

router.get(
  '/public/:id',
  validateProjectId,
  handleValidationErrors,
  getProjectById
);

// === ROUTES ADMIN ===
router.get(
  '/admin',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  },
  validateProjectQuery,
  handleValidationErrors,
  getAllProjects
);

router.post(
  '/admin',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  },
  validateProject,
  handleValidationErrors,
  createProject
);

router.put(
  '/admin/:id',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  },
  validateProjectId,
  validateProject,
  handleValidationErrors,
  updateProject
);

router.delete(
  '/admin/:id',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  },
  validateProjectId,
  handleValidationErrors,
  deleteProject
);

router.get(
  '/admin/stats',
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'master_admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }
    next();
  },
  getProjectStats
);

module.exports = router;
// routes/testimony.route.js (version simplifiée)
const express = require("express");
const {
  submitTestimony,
  getApprovedTestimonies,
  getAllTestimonies,
  updateTestimonyStatus,
  deleteTestimony,
  getTestimonyStats,getTestimonyById,
} = require("../controllers/testimony.controller");
const authMiddleware = require("../middleware/auth");
const uploadTestimony = require("../middleware/uploadTestimony");
const {
  validateTestimonySubmission,
  validateTestimonyStatusUpdate,
  validatePublicQueryParams,
  validateAdminQueryParams,
  validateTestimonyId,
  handleValidationErrors,
} = require("../middleware/testimonyValidation");

const router = express.Router();

// Routes publiques
router.post(
  "/submit",
  uploadTestimony.array("images", 3),
  validateTestimonySubmission,
  handleValidationErrors,
  submitTestimony
);

router.get(
  "/public",
  validatePublicQueryParams,
  handleValidationErrors,
  getApprovedTestimonies
);

// Routes admin - version avec vérification de rôle intégrée
router.get(
  "/admin",
  authMiddleware,
  /* (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }
    next();
  }, */
  validateAdminQueryParams,
  handleValidationErrors,
  getAllTestimonies
);

router.get(
  "/admin/stats",
  authMiddleware,
  /* (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }
    next();
  }, */
  getTestimonyStats
);

router.put(
  "/admin/:id/status",
  authMiddleware,
  /* (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }
    next();
  }, */
  validateTestimonyStatusUpdate,
  handleValidationErrors,
  updateTestimonyStatus
);

router.delete(
  "/admin/:id",
  authMiddleware,
  /* (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }
    next();
  }, */
  validateTestimonyId,
  handleValidationErrors,
  deleteTestimony
);

// Ajouter cette route avec les autres routes admin
router.get(
  "/admin/:id",
  authMiddleware,
  /* (req, res, next) => {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Accès non autorisé",
      });
    }
    next();
  }, */
  validateTestimonyId, // Vous devrez créer cette validation
  handleValidationErrors,
  getTestimonyById // Le nouveau contrôleur
);

module.exports = router;

// routes/testimony.route.js (version simplifiée)
const express = require("express");
const {
  submitTestimony,
  getApprovedTestimonies,
  getAllTestimonies,
  updateTestimonyStatus,
  deleteTestimony,
  getTestimonyStats,
  getTestimonyById,
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
  checkAndConsumeClientToken,
  isValidClientToken,
} = require("../middleware/testimonyValidation");

const router = express.Router();

// Routes publiques
router.post(
  "/submit",
  uploadTestimony.array("images", 3),
  validateTestimonySubmission,
  handleValidationErrors,
  // token check middleware (inline) -> verifies clientToken before submitTestimony
  async (req, res, next) => {
    try {
      // extract clientToken depending on parser
      const token =
        (req.body && req.body.clientToken) ||
        (req.fields && req.fields.clientToken);
      const clientIp =
        req.ip ||
        req.headers["x-forwarded-for"] ||
        (req.connection && req.connection.remoteAddress);

      if (!token) {
        return res
          .status(400)
          .json({ success: false, message: "clientToken missing" });
      }

      const tokenCheck = await checkAndConsumeClientToken(token, clientIp);
      if (!tokenCheck.ok) {
        if (tokenCheck.reason === "invalid_token") {
          return res
            .status(400)
            .json({ success: false, message: "Invalid client token" });
        }
        if (tokenCheck.reason === "rate_limited") {
          return res.status(429).json({
            success: false,
            message: "Too many submissions with this token",
          });
        }
        return res
          .status(500)
          .json({ success: false, message: "Token validation error" });
      }

      // attach tokenCheck info for controller if needed
      req.clientTokenInfo = tokenCheck;
      next();
    } catch (err) {
      console.error("Token check error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Token validation error" });
    }
  },
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

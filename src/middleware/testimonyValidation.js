// middleware/validation.js
// middleware/validation.js
const { body, param, query, validationResult } = require("express-validator");

// Middleware pour parser FormData avant validation
// middleware/testimonyValidation.js
// --- clientToken protection helpers ---
let redisClient = null;
const REDIS_URL = process.env.REDIS_URL || null;
if (REDIS_URL) {
  try {
    const IORedis = require("ioredis");
    redisClient = new IORedis(REDIS_URL);
  } catch (err) {
    console.warn("ioredis non disponible, fallback mémoire activé", err);
    redisClient = null;
  }
}

const CLIENT_TOKEN_PREFIX = process.env.CLIENT_TOKEN_PREFIX || "client_token:";
const CLIENT_TOKEN_COUNT_SUFFIX = ":count";
const TOKEN_TTL_SECONDS = parseInt(process.env.CLIENT_TOKEN_TTL || "86400", 10); // 24h
const MAX_SUBMISSIONS_PER_TOKEN = parseInt(
  process.env.CLIENT_TOKEN_MAX_SUBMISSIONS || "10",
  10
);

// Memory fallback store
const memoryTokenStore = new Map();

function isValidClientToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9]{40,64}$/.test(token);
}

async function checkAndConsumeClientToken(token, ip) {
  if (!isValidClientToken(token)) {
    return { ok: false, reason: "invalid_token" };
  }

  if (redisClient) {
    try {
      const countKey = CLIENT_TOKEN_PREFIX + token + CLIENT_TOKEN_COUNT_SUFFIX;
      const count = await redisClient.incr(countKey);
      if (count === 1) {
        await redisClient.expire(countKey, TOKEN_TTL_SECONDS);
        await redisClient.set(
          CLIENT_TOKEN_PREFIX + token,
          ip || "unknown",
          "EX",
          TOKEN_TTL_SECONDS
        );
      }
      if (count > MAX_SUBMISSIONS_PER_TOKEN) {
        return { ok: false, reason: "rate_limited" };
      }
      return { ok: true, count };
    } catch (err) {
      console.error("Redis check token error:", err);
      // fallback to memory below
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryTokenStore.get(token);
  if (entry) {
    if (entry.expiresAt <= now) {
      memoryTokenStore.set(token, {
        count: 1,
        expiresAt: now + TOKEN_TTL_SECONDS * 1000,
        ips: new Set([ip]),
      });
      return { ok: true, count: 1 };
    } else {
      if (entry.count + 1 > MAX_SUBMISSIONS_PER_TOKEN) {
        return { ok: false, reason: "rate_limited" };
      }
      entry.count += 1;
      if (ip) entry.ips.add(ip);
      memoryTokenStore.set(token, entry);
      return { ok: true, count: entry.count };
    }
  } else {
    memoryTokenStore.set(token, {
      count: 1,
      expiresAt: now + TOKEN_TTL_SECONDS * 1000,
      ips: new Set([ip]),
    });
    return { ok: true, count: 1 };
  }
}
const handleFormData = (req, res, next) => {
  // Vérifier si req.body existe
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Données de formulaire manquantes",
    });
  }

  // Si des fichiers sont uploadés, req.body contient les champs texte
  // On s'assure que les champs sont bien traités comme des strings
  if (req.is("multipart/form-data")) {
    // Vérifier chaque champ individuellement
    const fields = [
      "title",
      "content",
      "author_name",
      "author_email",
      "author_location",
      "category",
    ];

    fields.forEach((field) => {
      if (req.body[field]) {
        req.body[field] = req.body[field].toString();
      }
    });
  }
  next();
};

// Validation pour la soumission d'un témoignage (support FormData)
const validateTestimonySubmission = [
  handleFormData, // Ajouter ce middleware en premier
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Le titre est obligatoire")
    .isLength({ max: 100 })
    .withMessage("Le titre ne peut pas dépasser 100 caractères")
    ,

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Le contenu du témoignage est obligatoire")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Le témoignage doit contenir entre 10 et 2000 caractères")
    ,

  body("author_name")
    .trim()
    .notEmpty()
    .withMessage("Le nom est obligatoire")
    .isLength({ max: 50 })
    .withMessage("Le nom ne peut pas dépasser 50 caractères")
    ,

  body("author_email")
    .trim()
    .notEmpty()
    .withMessage("L'email est obligatoire")
    .isEmail()
    .withMessage("Format d'email invalide")
    .normalizeEmail(),

  body("author_location")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("La localisation ne peut pas dépasser 50 caractères")
    ,

  body("category")
    .optional()
    .isIn([
      "guerison",
      "famille",
      "finances",
      "delivrance",
      "miracle",
      "transformation",
      "autre",
    ])
    .withMessage("Catégorie invalide"),
];

// ... le reste de votre code validation reste inchangé

// Validation pour la mise à jour du statut (admin)
const validateTestimonyStatusUpdate = [
  param("id").isMongoId().withMessage("ID de témoignage invalide"),

  body("status")
    .isIn(["pending", "approved", "scheduled", "archived", "rejected"])
    .withMessage("Statut invalide"),

  body("scheduled_date")
    .optional()
    .isISO8601()
    .withMessage("Format de date invalide")
    .custom((value, { req }) => {
      if (req.body.status === "scheduled" && !value) {
        throw new Error(
          'La date de programmation est requise pour le statut "scheduled"'
        );
      }
      return true;
    }),

  body("is_featured")
    .optional()
    .isBoolean()
    .withMessage("La valeur featured doit être un booléen"),
];

// Validation pour les paramètres de requête (public)
const validatePublicQueryParams = [
  query("category")
    .optional()
    .isIn([
      "guerison",
      "famille",
      "finances",
      "delivrance",
      "miracle",
      "transformation",
      "autre",
      "all",
    ])
    .withMessage("Catégorie invalide"),

  query("featured")
    .optional()
    .isIn(["true", "false"])
    .withMessage('Le paramètre featured doit être "true" ou "false"'),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("La limite doit être un nombre entre 1 et 50"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La page doit être un nombre positif"),
];

// Validation pour les paramètres de requête (admin)
const validateAdminQueryParams = [
  query("status")
    .optional()
    .isIn(["pending", "approved", "scheduled", "archived", "rejected", "all"])
    .withMessage("Statut invalide"),

  query("category")
    .optional()
    .isIn([
      "guerison",
      "famille",
      "finances",
      "delivrance",
      "miracle",
      "transformation",
      "autre",
      "all",
    ])
    .withMessage("Catégorie invalide"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("La limite doit être un nombre entre 1 et 100"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La page doit être un nombre positif"),
];

// Validation pour la suppression
const validateTestimonyId = [
  param("id").isMongoId().withMessage("ID de témoignage invalide"),
];

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Données de validation invalides",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateTestimonySubmission,
  validateTestimonyStatusUpdate,
  validatePublicQueryParams,
  validateAdminQueryParams,
  validateTestimonyId,
  handleValidationErrors,
  // Export token helpers for routes
  checkAndConsumeClientToken,
  isValidClientToken,
};

// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Validation pour la soumission d'un témoignage
const validateTestimonySubmission = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est obligatoire')
    .isLength({ max: 100 })
    .withMessage('Le titre ne peut pas dépasser 100 caractères')
    .escape(),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Le contenu du témoignage est obligatoire')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Le témoignage doit contenir entre 10 et 2000 caractères')
    .escape(),

  body('author_name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est obligatoire')
    .isLength({ max: 50 })
    .withMessage('Le nom ne peut pas dépasser 50 caractères')
    .escape(),

  body('author_email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est obligatoire')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),

  body('author_location')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La localisation ne peut pas dépasser 50 caractères')
    .escape(),

  body('category')
    .optional()
    .isIn(['guerison', 'famille', 'finances', 'delivrance', 'miracle', 'transformation', 'autre'])
    .withMessage('Catégorie invalide')
];

// Validation pour la mise à jour du statut (admin)
const validateTestimonyStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('ID de témoignage invalide'),

  body('status')
    .isIn(['pending', 'approved', 'scheduled', 'archived', 'rejected'])
    .withMessage('Statut invalide'),

  body('scheduled_date')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide')
    .custom((value, { req }) => {
      if (req.body.status === 'scheduled' && !value) {
        throw new Error('La date de programmation est requise pour le statut "scheduled"');
      }
      return true;
    }),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('La valeur featured doit être un booléen')
];

// Validation pour les paramètres de requête (public)
const validatePublicQueryParams = [
  query('category')
    .optional()
    .isIn(['guerison', 'famille', 'finances', 'delivrance', 'miracle', 'transformation', 'autre', 'all'])
    .withMessage('Catégorie invalide'),

  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Le paramètre featured doit être "true" ou "false"'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être un nombre entre 1 et 50'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un nombre positif')
];

// Validation pour les paramètres de requête (admin)
const validateAdminQueryParams = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'scheduled', 'archived', 'rejected', 'all'])
    .withMessage('Statut invalide'),

  query('category')
    .optional()
    .isIn(['guerison', 'famille', 'finances', 'delivrance', 'miracle', 'transformation', 'autre', 'all'])
    .withMessage('Catégorie invalide'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être un nombre entre 1 et 100'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un nombre positif')
];

// Validation pour la suppression
const validateTestimonyId = [
  param('id')
    .isMongoId()
    .withMessage('ID de témoignage invalide')
];

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données de validation invalides',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
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
  handleValidationErrors
};
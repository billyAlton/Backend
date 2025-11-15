const { body, param, query, validationResult } = require('express-validator');

// Validation pour la création/mise à jour
const validateResource = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est obligatoire')
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères')
    .escape(),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est obligatoire')
    .isLength({ max: 1000 })
    .withMessage('La description ne peut pas dépasser 1000 caractères')
    .escape(),

  body('category')
    .isIn(['book', 'brochure', 'song', 'faq', 'other'])
    .withMessage('Catégorie invalide'),

  body('file_type')
    .isIn(['pdf', 'audio', 'video', 'text', 'image', 'none'])
    .withMessage('Type de fichier invalide'),

  body('file_url')
    .optional()
    .isURL()
    .withMessage('URL de fichier invalide'),

  body('file_size')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La taille du fichier doit être un nombre positif'),

  body('pages')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le nombre de pages doit être un nombre positif'),

  body('duration')
    .optional()
    .matches(/^([0-9]{1,2}:)?[0-9]{1,2}:[0-9]{1,2}$/)
    .withMessage('Format de durée invalide (HH:MM:SS ou MM:SS)'),

  body('artist')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom de l'artiste ne peut pas dépasser 100 caractères")
    .escape(),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('Le statut de publication doit être un booléen'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage("L'ordre doit être un nombre positif")
];

// Validation pour les paramètres de requête
const validateResourceQuery = [
  query('category')
    .optional()
    .isIn(['book', 'brochure', 'song', 'faq', 'other', 'all'])
    .withMessage('Catégorie invalide'),

  query('published')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Le paramètre published doit être "true" ou "false"'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être un nombre entre 1 et 100'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un nombre positif'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères')
];

// Validation pour l'ID
const validateResourceId = [
  param('id')
    .isMongoId()
    .withMessage('ID de ressource invalide')
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
  validateResource,
  validateResourceQuery,
  validateResourceId,
  handleValidationErrors
};
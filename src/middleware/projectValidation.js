const { body, param, query, validationResult } = require('express-validator');

// Validation pour la création/mise à jour
const validateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Le titre est obligatoire')
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères')
    ,

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est obligatoire')
    ,

  body('short_description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description courte ne peut pas dépasser 500 caractères')
    ,

  body('category')
    .isIn(['construction', 'humanitarian', 'education', 'health', 'spiritual', 'other'])
    .withMessage('Catégorie invalide'),

  body('goal_amount')
    .isFloat({ min: 0 })
    .withMessage('Le montant objectif doit être un nombre positif'),

  body('current_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le montant actuel doit être un nombre positif'),

  body('status')
    .isIn(['planning', 'in_progress', 'completed', 'paused'])
    .withMessage('Statut invalide'),

  body('image_url')
    .optional()
    .isURL()
    .withMessage('URL d\'image invalide'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('Le statut featured doit être un booléen'),

  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('Le statut de publication doit être un booléen'),

  body('steps')
    .optional()
    .isArray()
    .withMessage('Les étapes doivent être un tableau'),

  body('impact_points')
    .optional()
    .isArray()
    .withMessage('Les points d\'impact doivent être un tableau'),

  body('donation_examples')
    .optional()
    .isArray()
    .withMessage('Les exemples de dons doivent être un tableau'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau'),

  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage("L'ordre doit être un nombre positif")
];

// Validation pour les paramètres de requête
const validateProjectQuery = [
  query('category')
    .optional()
    .isIn(['construction', 'humanitarian', 'education', 'health', 'spiritual', 'other', 'all'])
    .withMessage('Catégorie invalide'),

  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Le paramètre featured doit être "true" ou "false"'),

  query('published')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Le paramètre published doit être "true" ou "false"'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être un nombre entre 1 et 50'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un nombre positif')
];

// Validation pour l'ID
const validateProjectId = [
  param('id')
    .isMongoId()
    .withMessage('ID de projet invalide')
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
  validateProject,
  validateProjectQuery,
  validateProjectId,
  handleValidationErrors
};
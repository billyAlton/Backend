// middleware/prayerRequestValidation.js
const { body } = require('express-validator');

const prayerRequestValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Le titre est requis')
      .isLength({ max: 255 })
      .withMessage('Le titre ne doit pas dépasser 255 caractères'),
    
    body('description')
      .notEmpty()
      .withMessage('La description est requise')
      .isLength({ min: 10 })
      .withMessage('La description doit contenir au moins 10 caractères'),
    
    body('status')
      .optional()
      .isIn(['active', 'answered', 'archived'])
      .withMessage('Le statut doit être active, answered ou archived'),
    
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('is_anonymous doit être un booléen'),
    
    body('is_public')
      .optional()
      .isBoolean()
      .withMessage('is_public doit être un booléen'),
  ],

  update: [
    body('title')
      .optional()
      .notEmpty()
      .withMessage('Le titre ne peut pas être vide')
      .isLength({ max: 255 })
      .withMessage('Le titre ne doit pas dépasser 255 caractères'),
    
    body('description')
      .optional()
      .notEmpty()
      .withMessage('La description ne peut pas être vide')
      .isLength({ min: 10 })
      .withMessage('La description doit contenir au moins 10 caractères'),
    
    body('status')
      .optional()
      .isIn(['active', 'answered', 'archived'])
      .withMessage('Le statut doit être active, answered ou archived'),
    
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('is_anonymous doit être un booléen'),
    
    body('is_public')
      .optional()
      .isBoolean()
      .withMessage('is_public doit être un booléen'),
  ],
};

module.exports = prayerRequestValidation;
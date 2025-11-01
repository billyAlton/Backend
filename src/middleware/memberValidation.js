// middleware/memberValidation.js
const { body } = require('express-validator');

const memberValidation = {
  create: [
    body('email')
      .isEmail()
      .withMessage('L\'email doit être valide')
      .normalizeEmail(),
    
    body('full_name')
      .notEmpty()
      .withMessage('Le nom complet est requis')
      .isLength({ max: 100 })
      .withMessage('Le nom ne doit pas dépasser 100 caractères')
      .trim(),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Le numéro de téléphone doit être valide'),
    
    body('address')
      .optional()
      .isLength({ max: 255 })
      .withMessage('L\'adresse ne doit pas dépasser 255 caractères')
      .trim(),
    
    body('membership_status')
      .optional()
      .isIn(['active', 'inactive', 'pending', 'suspended'])
      .withMessage('Le statut de membre doit être active, inactive, pending ou suspended'),
    
    body('role')
      .optional()
      .isIn(['admin', 'pastor', 'leader', 'member', 'volunteer'])
      .withMessage('Le rôle doit être admin, pastor, leader, member ou volunteer'),
    
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('La date de naissance doit être une date valide'),
    
    body('baptism_date')
      .optional()
      .isISO8601()
      .withMessage('La date de baptême doit être une date valide'),
    
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'avatar doit être valide'),
  ],

  update: [
    body('email')
      .optional()
      .isEmail()
      .withMessage('L\'email doit être valide')
      .normalizeEmail(),
    
    body('full_name')
      .optional()
      .notEmpty()
      .withMessage('Le nom complet ne peut pas être vide')
      .isLength({ max: 100 })
      .withMessage('Le nom ne doit pas dépasser 100 caractères')
      .trim(),
    
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Le numéro de téléphone doit être valide'),
    
    body('address')
      .optional()
      .isLength({ max: 255 })
      .withMessage('L\'adresse ne doit pas dépasser 255 caractères')
      .trim(),
    
    body('membership_status')
      .optional()
      .isIn(['active', 'inactive', 'pending', 'suspended'])
      .withMessage('Le statut de membre doit être active, inactive, pending ou suspended'),
    
    body('role')
      .optional()
      .isIn(['admin', 'pastor', 'leader', 'member', 'volunteer'])
      .withMessage('Le rôle doit être admin, pastor, leader, member ou volunteer'),
    
    body('date_of_birth')
      .optional()
      .isISO8601()
      .withMessage('La date de naissance doit être une date valide'),
    
    body('baptism_date')
      .optional()
      .isISO8601()
      .withMessage('La date de baptême doit être une date valide'),
    
    body('avatar_url')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'avatar doit être valide'),
  ],
};

module.exports = memberValidation;
// middleware/donationValidation.js
const { body } = require('express-validator');

const donationValidation = {
  create: [
    body('donor_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Le nom du donateur ne doit pas dépasser 100 caractères'),
    
    body('donor_email')
      .optional()
      .isEmail()
      .withMessage('L\'email du donateur doit être valide'),
    
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Le montant doit être un nombre supérieur à 0'),
    
    body('currency')
      .optional()
      .isIn(['USD', 'EUR', 'CAD', 'XAF'])
      .withMessage('La devise doit être USD, EUR, CAD ou XAF'),
    
    body('donation_type')
      .isIn(['tithe', 'offering', 'mission', 'building', 'other'])
      .withMessage('Le type de don doit être tithe, offering, mission, building ou other'),
    
    body('payment_method')
      .isIn(['card', 'bank', 'cash', 'check', 'mobile'])
      .withMessage('La méthode de paiement doit être card, bank, cash, check ou mobile'),
    
    body('payment_status')
      .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
      .withMessage('Le statut du paiement doit être pending, completed, failed, refunded ou cancelled'),
    
    body('is_recurring')
      .optional()
      .isBoolean()
      .withMessage('is_recurring doit être un booléen'),
    
    body('recurrence_frequency')
      .optional()
      .isIn(['weekly', 'monthly', 'quarterly', 'yearly', null])
      .withMessage('La fréquence de récurrence doit être weekly, monthly, quarterly, yearly ou null'),
    
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('is_anonymous doit être un booléen'),
  ],

  update: [
    body('donor_name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Le nom du donateur ne doit pas dépasser 100 caractères'),
    
    body('donor_email')
      .optional()
      .isEmail()
      .withMessage('L\'email du donateur doit être valide'),
    
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Le montant doit être un nombre supérieur à 0'),
    
    body('donation_type')
      .optional()
      .isIn(['tithe', 'offering', 'mission', 'building', 'other'])
      .withMessage('Le type de don doit être tithe, offering, mission, building ou other'),
    
    body('payment_method')
      .optional()
      .isIn(['card', 'bank', 'cash', 'check', 'mobile'])
      .withMessage('La méthode de paiement doit être card, bank, cash, check ou mobile'),
    
    body('payment_status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
      .withMessage('Le statut du paiement doit être pending, completed, failed, refunded ou cancelled'),
    
    body('is_recurring')
      .optional()
      .isBoolean()
      .withMessage('is_recurring doit être un booléen'),
    
    body('recurrence_frequency')
      .optional()
      .isIn(['weekly', 'monthly', 'quarterly', 'yearly', null])
      .withMessage('La fréquence de récurrence doit être weekly, monthly, quarterly, yearly ou null'),
    
    body('is_anonymous')
      .optional()
      .isBoolean()
      .withMessage('is_anonymous doit être un booléen'),
  ],
};

module.exports = donationValidation;
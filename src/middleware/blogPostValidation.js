// middleware/blogPostValidation.js
const { body } = require('express-validator');

const blogPostValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Le titre est requis')
      .isLength({ max: 255 })
      .withMessage('Le titre ne doit pas dépasser 255 caractères'),
    
    body('slug')
      .notEmpty()
      .withMessage('Le slug est requis')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
    
    body('content')
      .notEmpty()
      .withMessage('Le contenu est requis')
      .isLength({ min: 100 })
      .withMessage('Le contenu doit contenir au moins 100 caractères'),
    
    body('excerpt')
      .optional()
      .isLength({ max: 300 })
      .withMessage('L\'extrait ne doit pas dépasser 300 caractères'),
    
    body('featured_image')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'image doit être valide'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Le statut doit être draft, published ou archived'),
    
    body('tags')
      .optional()
      .isString()
      .withMessage('Les tags doivent être une chaîne de caractères'),
  ],

  update: [
    body('title')
      .optional()
      .notEmpty()
      .withMessage('Le titre ne peut pas être vide')
      .isLength({ max: 255 })
      .withMessage('Le titre ne doit pas dépasser 255 caractères'),
    
    body('slug')
      .optional()
      .notEmpty()
      .withMessage('Le slug ne peut pas être vide')
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .withMessage('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
    
    body('content')
      .optional()
      .notEmpty()
      .withMessage('Le contenu ne peut pas être vide')
      .isLength({ min: 100 })
      .withMessage('Le contenu doit contenir au moins 100 caractères'),
    
    body('excerpt')
      .optional()
      .isLength({ max: 300 })
      .withMessage('L\'extrait ne doit pas dépasser 300 caractères'),
    
    body('featured_image')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'image doit être valide'),
    
    body('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Le statut doit être draft, published ou archived'),
    
    body('tags')
      .optional()
      .isString()
      .withMessage('Les tags doivent être une chaîne de caractères'),
  ],
};

module.exports = blogPostValidation;
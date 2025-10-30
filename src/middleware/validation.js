// middleware/validation.js
const { body } = require('express-validator');

const sermonValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Le titre est requis')
      .isLength({ max: 255 })
      .withMessage('Le titre ne doit pas dépasser 255 caractères'),
    
    body('pastor_name')
      .notEmpty()
      .withMessage('Le nom du pasteur est requis')
      .isLength({ max: 100 })
      .withMessage('Le nom du pasteur ne doit pas dépasser 100 caractères'),
    
    body('sermon_date')
      .isISO8601()
      .withMessage('La date du sermon doit être une date valide (YYYY-MM-DD)'),
    
    body('video_url')
      .optional()
      .isURL()
      .withMessage('L\'URL de la vidéo doit être valide'),
    
    body('audio_url')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'audio doit être valide'),
    
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
    
    body('pastor_name')
      .optional()
      .notEmpty()
      .withMessage('Le nom du pasteur ne peut pas être vide')
      .isLength({ max: 100 })
      .withMessage('Le nom du pasteur ne doit pas dépasser 100 caractères'),
    
    body('sermon_date')
      .optional()
      .isISO8601()
      .withMessage('La date du sermon doit être une date valide (YYYY-MM-DD)'),
    
    body('video_url')
      .optional()
      .isURL()
      .withMessage('L\'URL de la vidéo doit être valide'),
    
    body('audio_url')
      .optional()
      .isURL()
      .withMessage('L\'URL de l\'audio doit être valide'),
  ],
};

module.exports = sermonValidation;
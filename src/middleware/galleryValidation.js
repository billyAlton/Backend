// middleware/galleryValidation.js
const { body } = require('express-validator');

exports.createAlbumValidation = [
  body('title')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères'),
  
  body('description')
    .notEmpty().withMessage('La description est obligatoire')
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères'),
  
  body('date')
    .notEmpty().withMessage('La date est obligatoire'),
  
  body('coverImage')
    .notEmpty().withMessage("L'image de couverture est obligatoire"),
  
  body('category')
    .isIn(['Célébrations', 'Cérémonies', 'Retraites', 'Évangélisation', 'Pèlerinages', 'Cultes', 'Jeunesse', 'Humanitaire', 'Autre'])
    .withMessage('Catégorie non valide'),
  
  body('photoCount')
    .optional()
    .isInt({ min: 0 }).withMessage('Le nombre de photos doit être un nombre positif')
];

exports.createVideoValidation = [
  body('title')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 100 }).withMessage('Le titre ne peut pas dépasser 100 caractères'),
  
  body('thumbnail')
    .notEmpty().withMessage("La miniature est obligatoire"),
  
  body('videoUrl')
    .notEmpty().withMessage("L'URL de la vidéo est obligatoire"),
  
  body('duration')
    .notEmpty().withMessage('La durée est obligatoire'),
  
  body('category')
    .isIn(['Célébrations', 'Cérémonies', 'Retraites', 'Évangélisation', 'Pèlerinages', 'Cultes', 'Jeunesse', 'Humanitaire', 'Enseignements', 'Autre'])
    .withMessage('Catégorie non valide'),
  
  body('views')
    .optional()
    .isInt({ min: 0 }).withMessage('Le nombre de vues doit être un nombre positif')
];
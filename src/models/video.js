// models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  thumbnail: {
    type: String,
    required: [true, "La miniature est obligatoire"],
    trim: true
  },
  videoUrl: {
    type: String,
    required: [true, "L'URL de la vidéo est obligatoire"],
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'La durée est obligatoire'],
    trim: true
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de vues ne peut pas être négatif']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['Célébrations', 'Cérémonies', 'Retraites', 'Évangélisation', 'Pèlerinages', 'Cultes', 'Jeunesse', 'Humanitaire', 'Enseignements', 'Autre'],
      message: 'Catégorie non valide'
    },
    default: 'Autre'
  },
  is_published: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les recherches
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ category: 1 });
videoSchema.index({ is_published: 1 });
videoSchema.index({ order: 1 });

module.exports = mongoose.model('Video', videoSchema);
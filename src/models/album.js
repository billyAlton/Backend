// models/Album.js
const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  date: {
    type: String,
    required: [true, 'La date est obligatoire'],
    trim: true
  },
  photoCount: {
    type: Number,
    default: 0,
    min: [0, 'Le nombre de photos ne peut pas être négatif']
  },
  coverImage: {
    type: String,
    required: [true, "L'image de couverture est obligatoire"],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['Célébrations', 'Cérémonies', 'Retraites', 'Évangélisation', 'Pèlerinages', 'Cultes', 'Jeunesse', 'Humanitaire', 'Autre'],
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
albumSchema.index({ title: 'text', description: 'text' });
albumSchema.index({ category: 1 });
albumSchema.index({ is_published: 1 });
albumSchema.index({ order: 1 });

module.exports = mongoose.model('Album', albumSchema);
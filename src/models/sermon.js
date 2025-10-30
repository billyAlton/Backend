// models/Sermon.js
const mongoose = require('mongoose');

const sermonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    maxlength: [255, 'Le titre ne doit pas dépasser 255 caractères'],
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  pastor_name: {
    type: String,
    required: [true, 'Le nom du pasteur est requis'],
    maxlength: [100, 'Le nom du pasteur ne doit pas dépasser 100 caractères'],
    trim: true
  },
  sermon_date: {
    type: Date,
    required: [true, 'La date du sermon est requise']
  },
  scripture_reference: {
    type: String,
    default: null,
    trim: true
  },
  video_url: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: 'URL de vidéo invalide'
    }
  },
  audio_url: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: 'URL audio invalide'
    }
  },
  transcript: {
    type: String,
    default: null
  },
  series: {
    type: String,
    default: null,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  created_by: {
    type: String,
    required: [true, 'L\'utilisateur créateur est requis']
  }
}, {
  timestamps: true // Crée automatiquement createdAt et updatedAt
});

// Index pour optimiser les recherches
sermonSchema.index({ sermon_date: -1 });
sermonSchema.index({ pastor_name: 1 });
sermonSchema.index({ series: 1 });
sermonSchema.index({ tags: 1 });

module.exports = mongoose.model('Sermon', sermonSchema);
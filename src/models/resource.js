const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['book', 'brochure', 'song', 'faq', 'other'],
      message: 'Catégorie invalide'
    }
  },
  file_type: {
    type: String,
    required: [true, 'Le type de fichier est obligatoire'],
    enum: {
      values: ['pdf', 'audio', 'video', 'text', 'image', 'none'],
      message: 'Type de fichier invalide'
    }
  },
  file_url: {
    type: String,
    trim: true
  },
  file_size: {
    type: Number, // Taille en bytes
    default: 0
  },
  pages: {
    type: Number,
    min: 0
  },
  duration: {
    type: String, // Pour les audio/vidéo
    trim: true
  },
  artist: {
    type: String,
    trim: true,
    maxlength: [100, "Le nom de l'artiste ne peut pas dépasser 100 caractères"]
  },
  download_count: {
    type: Number,
    default: 0
  },
  is_published: {
    type: Boolean,
    default: false
  },
  published_at: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour les recherches
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1, is_published: 1 });
resourceSchema.index({ order: 1 });

// Middleware pour gérer published_at
resourceSchema.pre('save', function(next) {
  if (this.is_published && !this.published_at) {
    this.published_at = new Date();
  }
  next();
});

module.exports = mongoose.model('Resource', resourceSchema);
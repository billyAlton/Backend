// models/BlogPost.js
const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    maxlength: [255, 'Le titre ne doit pas dépasser 255 caractères'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Le slug est requis'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
      },
      message: 'Le slug doit être une URL valide'
    }
  },
  content: {
    type: String,
    required: [true, 'Le contenu est requis'],
    trim: true
  },
  excerpt: {
    type: String,
    maxlength: [300, 'L\'extrait ne doit pas dépasser 300 caractères'],
    default: null,
    trim: true
  },
  featured_image: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: 'URL d\'image invalide'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    required: [true, 'L\'auteur est requis'],
  },
  published_at: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  reading_time: {
    type: Number, // en minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ author_id: 1 });
blogPostSchema.index({ published_at: -1 });
blogPostSchema.index({ tags: 1 });

// Middleware pour calculer le temps de lecture avant sauvegarde
blogPostSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Estimation: 200 mots par minute
    const wordCount = this.content.split(/\s+/).length;
    this.reading_time = Math.ceil(wordCount / 200);
  }
  
  // Définir published_at si le statut passe à "published"
  if (this.isModified('status') && this.status === 'published' && !this.published_at) {
    this.published_at = new Date();
  }
  
  next();
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
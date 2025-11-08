// models/Testimony.js
const mongoose = require('mongoose');

const testimonySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  content: {
    type: String,
    required: [true, 'Le contenu du témoignage est obligatoire'],
    trim: true,
    maxlength: [2000, 'Le témoignage ne peut pas dépasser 2000 caractères']
  },
  author_name: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  author_email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    trim: true,
    lowercase: true
  },
  author_location: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['guerison', 'famille', 'finances', 'delivrance', 'miracle', 'transformation', 'autre'],
    default: 'autre'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'scheduled', 'archived', 'rejected'],
    default: 'pending'
  },
  scheduled_date: {
    type: Date
  },
  images: [{
    type: String // URLs des images
  }],
  is_featured: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
testimonySchema.index({ status: 1, scheduled_date: 1 });
testimonySchema.index({ category: 1, status: 1 });
testimonySchema.index({ is_featured: 1, status: 1 });

module.exports = mongoose.model('Testimony', testimonySchema);
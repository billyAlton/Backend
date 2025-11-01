// models/PrayerRequest.js
const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    maxlength: [255, 'Le titre ne doit pas dépasser 255 caractères'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true
  },
  requester_name: {
    type: String,
    default: null,
    trim: true
  },
  requester_id: {
    type: String,
    required: [true, 'L\'ID du demandeur est requis'],
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'answered', 'archived'],
    default: 'active'
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },
  is_public: {
    type: Boolean,
    default: true
  },
  prayer_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
prayerRequestSchema.index({ status: 1 });
prayerRequestSchema.index({ is_public: 1 });
prayerRequestSchema.index({ requester_id: 1 });
prayerRequestSchema.index({ created_at: -1 });

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);
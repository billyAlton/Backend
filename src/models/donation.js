// models/Donation.js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor_name: {
    type: String,
    default: null,
    trim: true
  },
  donor_email: {
    type: String,
    default: null,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email du donateur invalide'
    }
  },
  donor_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'User'
  },
  amount: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: [0.01, 'Le montant doit être supérieur à 0']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'CAD', 'XAF'],
    uppercase: true,
    trim: true
  },
  donation_type: {
    type: String,
    required: [true, 'Le type de don est requis'],
    enum: ['tithe', 'offering', 'mission', 'building', 'other'],
    default: 'tithe'
  },
  payment_method: {
    type: String,
    required: [true, 'La méthode de paiement est requise'],
    enum: ['card', 'bank', 'cash', 'check', 'mobile'],
    default: 'card'
  },
  payment_status: {
    type: String,
    required: [true, 'Le statut du paiement est requis'],
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  payment_id: {
    type: String,
    default: null,
    trim: true
  },
  notes: {
    type: String,
    default: null,
    trim: true
  },
  is_recurring: {
    type: Boolean,
    default: false
  },
  recurrence_frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', null],
    default: null
  },
  next_recurrence_date: {
    type: Date,
    default: null
  },
  is_anonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
donationSchema.index({ donor_id: 1 });
donationSchema.index({ payment_status: 1 });
donationSchema.index({ donation_type: 1 });
donationSchema.index({ created_at: -1 });
donationSchema.index({ is_recurring: 1 });

// Middleware pour générer un ID de paiement
donationSchema.pre('save', function(next) {
  if (this.isNew && !this.payment_id) {
    this.payment_id = `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Méthode statique pour calculer les statistiques
donationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: {
        payment_status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);

  return stats[0] || { totalAmount: 0, totalDonations: 0, averageAmount: 0 };
};

module.exports = mongoose.model('Donation', donationSchema);
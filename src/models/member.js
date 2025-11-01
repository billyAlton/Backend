// models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email invalide'
    }
  },
  full_name: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    maxlength: [100, 'Le nom ne doit pas dépasser 100 caractères'],
    trim: true
  },
  phone: {
    type: String,
    default: null,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Numéro de téléphone invalide'
    }
  },
  address: {
    type: String,
    default: null,
    trim: true,
    maxlength: [255, 'L\'adresse ne doit pas dépasser 255 caractères']
  },
  membership_status: {
    type: String,
    required: [true, 'Le statut de membre est requis'],
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  role: {
    type: String,
    required: [true, 'Le rôle est requis'],
    enum: ['admin', 'pastor', 'leader', 'member', 'volunteer'],
    default: 'member'
  },
  date_of_birth: {
    type: Date,
    default: null
  },
  baptism_date: {
    type: Date,
    default: null
  },
  join_date: {
    type: Date,
    default: Date.now
  },
  emergency_contact: {
    name: {
      type: String,
      default: null,
      trim: true
    },
    phone: {
      type: String,
      default: null,
      trim: true
    },
    relationship: {
      type: String,
      default: null,
      trim: true
    }
  },
  spiritual_gifts: [{
    type: String,
    trim: true
  }],
  ministries: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: null,
    trim: true
  },
  avatar_url: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
      },
      message: 'URL d\'avatar invalide'
    }
  },
  is_email_verified: {
    type: Boolean,
    default: false
  },
  last_activity: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
memberSchema.index({ email: 1 });
memberSchema.index({ membership_status: 1 });
memberSchema.index({ role: 1 });
memberSchema.index({ full_name: 'text' });
memberSchema.index({ join_date: -1 });

// Méthode virtuelle pour l'âge
memberSchema.virtual('age').get(function() {
  if (!this.date_of_birth) return null;
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Méthode pour mettre à jour la dernière activité
memberSchema.methods.updateLastActivity = function() {
  this.last_activity = new Date();
  return this.save();
};

// Méthode statique pour les statistiques
memberSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$membership_status',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = await this.countDocuments();
  const active = await this.countDocuments({ membership_status: 'active' });
  
  return {
    total,
    active,
    byStatus: stats
  };
};

module.exports = mongoose.model('Member', memberSchema);
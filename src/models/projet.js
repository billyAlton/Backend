const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true
  },
  short_description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description courte ne peut pas dépasser 500 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['construction', 'humanitarian', 'education', 'health', 'spiritual', 'other'],
      message: 'Catégorie invalide'
    }
  },
  image_url: {
    type: String,
    trim: true
  },
  goal_amount: {
    type: Number,
    required: [true, 'Le montant objectif est obligatoire'],
    min: [0, 'Le montant objectif doit être positif']
  },
  current_amount: {
    type: Number,
    default: 0,
    min: [0, 'Le montant actuel doit être positif']
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Le progrès doit être entre 0 et 100'],
    max: [100, 'Le progrès doit être entre 0 et 100']
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['planning', 'in_progress', 'completed', 'paused'],
      message: 'Statut invalide'
    },
    default: 'planning'
  },
  steps: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    },
    order: {
      type: Number,
      required: true
    }
  }],
  impact_points: [{
    type: String,
    trim: true
  }],
  donation_examples: [{
    amount: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  }],
  is_featured: {
    type: Boolean,
    default: false
  },
  is_published: {
    type: Boolean,
    default: false
  },
  published_at: {
    type: Date
  },
  start_date: {
    type: Date
  },
  estimated_end_date: {
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
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });
projectSchema.index({ category: 1, is_published: 1, is_featured: 1 });
projectSchema.index({ status: 1, is_published: 1 });

// Middleware pour calculer automatiquement le progrès
projectSchema.pre('save', function(next) {
  if (this.goal_amount > 0) {
    this.progress = Math.min(100, Math.round((this.current_amount / this.goal_amount) * 100));
  }
  
  if (this.is_published && !this.published_at) {
    this.published_at = new Date();
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
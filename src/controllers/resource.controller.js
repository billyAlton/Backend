const Resource = require('../models/Resource');
const { validationResult } = require('express-validator');

// Récupérer toutes les ressources (public)
const getPublishedResources = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: errors.array()
      });
    }

    const { category, limit = 50, page = 1, search } = req.query;
    
    // Construire la requête pour les ressources publiées
    const query = { is_published: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: resources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération ressources:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des ressources'
    });
  }
};

// Récupérer une ressource par ID (public)
const getResourceById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de ressource invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const resource = await Resource.findOne({ 
      _id: id, 
      is_published: true 
    }).select('-__v');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée'
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    console.error('Erreur récupération ressource:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la ressource'
    });
  }
};

// Incrémenter le compteur de téléchargements
const incrementDownloadCount = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de ressource invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const resource = await Resource.findOneAndUpdate(
      { _id: id, is_published: true },
      { $inc: { download_count: 1 } },
      { new: true }
    ).select('-__v');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Compteur de téléchargement mis à jour',
      data: resource
    });
  } catch (error) {
    console.error('Erreur mise à jour téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du compteur'
    });
  }
};

// Récupérer les FAQ (public)
const getFAQs = async (req, res) => {
  try {
    const faqs = await Resource.find({ 
      category: 'faq', 
      is_published: true 
    })
    .sort({ order: 1, createdAt: -1 })
    .select('title description');

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Erreur récupération FAQ:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des FAQ'
    });
  }
};

// === ROUTES ADMIN ===

// Récupérer toutes les ressources (admin)
const getAllResources = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: errors.array()
      });
    }

    const { category, published, limit = 20, page = 1, search } = req.query;
    
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (published === 'true') {
      query.is_published = true;
    } else if (published === 'false') {
      query.is_published = false;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const resources = await Resource.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: resources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération ressources admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des ressources'
    });
  }
};

// Créer une ressource (admin)
const createResource = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors: errors.array()
      });
    }

    const resourceData = req.body;

    const resource = new Resource(resourceData);
    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Ressource créée avec succès',
      data: resource
    });
  } catch (error) {
    console.error('Erreur création ressource:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la ressource'
    });
  }
};

// Mettre à jour une ressource (admin)
const updateResource = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const resource = await Resource.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Ressource mise à jour avec succès',
      data: resource
    });
  } catch (error) {
    console.error('Erreur mise à jour ressource:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la ressource'
    });
  }
};

// Supprimer une ressource (admin)
const deleteResource = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de ressource invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Ressource non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Ressource supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression ressource:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la ressource'
    });
  }
};

// Récupérer les statistiques (admin)
const getResourceStats = async (req, res) => {
  try {
    const stats = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$is_published', true] }, 1, 0] }
          },
          totalDownloads: { $sum: '$download_count' }
        }
      }
    ]);

    const total = await Resource.countDocuments();
    const totalDownloads = await Resource.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$download_count' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byCategory: stats,
        total,
        totalDownloads: totalDownloads[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
};

module.exports = {
  // Public
  getPublishedResources,
  getResourceById,
  incrementDownloadCount,
  getFAQs,
  
  // Admin
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
  getResourceStats
};
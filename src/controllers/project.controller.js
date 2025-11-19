const Project = require('../models/projet');
const { validationResult } = require('express-validator');

// Récupérer les projets publiés (public)
const getPublishedProjects = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: errors.array()
      });
    }

    const { category, featured, limit = 10, page = 1 } = req.query;
    
    // Construire la requête pour les projets publiés
    const query = { is_published: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.is_featured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .sort({ order: 1, is_featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des projets'
    });
  }
};

// Récupérer un projet par ID (public)
const getProjectById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const project = await Project.findOne({ 
      _id: id, 
      is_published: true 
    }).select('-__v');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du projet'
    });
  }
};

// === ROUTES ADMIN ===

// Récupérer tous les projets (admin)
const getAllProjects = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: errors.array()
      });
    }

    const { category, published, featured, limit = 20, page = 1 } = req.query;
    
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (published === 'true') {
      query.is_published = true;
    } else if (published === 'false') {
      query.is_published = false;
    }
    
    if (featured === 'true') {
      query.is_featured = true;
    } else if (featured === 'false') {
      query.is_featured = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .sort({ order: 1, is_featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération projets admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des projets'
    });
  }
};

// Créer un projet (admin)
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors: errors.array()
      });
    }

    const projectData = req.body;

    const project = new Project(projectData);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: project
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du projet'
    });
  }
};

// Mettre à jour un projet (admin)
const updateProject = async (req, res) => {
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

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: project
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du projet'
    });
  }
};

// Supprimer un projet (admin)
const deleteProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de projet invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du projet'
    });
  }
};

// Récupérer les statistiques (admin)
const getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$is_published', true] }, 1, 0] }
          },
          totalGoal: { $sum: '$goal_amount' },
          totalCurrent: { $sum: '$current_amount' }
        }
      }
    ]);

    const total = await Project.countDocuments();
    const totalPublished = await Project.countDocuments({ is_published: true });
    const totalGoal = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$goal_amount' }
        }
      }
    ]);
    const totalCurrent = await Project.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$current_amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byCategory: stats,
        total,
        totalPublished,
        totalGoal: totalGoal[0]?.total || 0,
        totalCurrent: totalCurrent[0]?.total || 0
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
  getPublishedProjects,
  getProjectById,
  
  // Admin
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
};
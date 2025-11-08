// controllers/testimonyController.js
const Testimony = require('../models/testimony');
const { validationResult } = require('express-validator');

const path = require('path');

// Soumettre un témoignage (public) - VERSION MODIFIÉE
const submitTestimony = async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Si il y a des erreurs de validation, supprimer les fichiers uploadés
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Données de validation invalides',
        errors: errors.array()
      });
    }

    const {
      title,
      content,
      author_name,
      author_email,
      author_location,
      category
    } = req.body;

    // Vérifier si l'email a déjà soumis trop de témoignages (limite anti-spam)
    const recentSubmissions = await Testimony.countDocuments({
      author_email,
      createdAt: { 
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 heures
      }
    });

    if (recentSubmissions >= 3) {
      // Supprimer les fichiers uploadés si limite atteinte
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(429).json({
        success: false,
        message: 'Vous avez soumis trop de témoignages récemment. Veuillez réessayer demain.'
      });
    }

    // Traiter les images uploadées
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // Retourner le chemin relatif ou l'URL selon votre configuration
        return `/uploads/testimonies/${path.basename(file.filename)}`;
      });
    }

    const testimony = new Testimony({
      title,
      content,
      author_name,
      author_email,
      author_location,
      category: category || 'autre',
      status: 'pending',
      images // Ajouter les images au témoignage
    });

    await testimony.save();

    res.status(201).json({
      success: true,
      message: 'Témoignage soumis avec succès. Il sera publié après modération.',
      data: {
        id: testimony._id,
        title: testimony.title,
        status: testimony.status,
        images: testimony.images
      }
    });
  } catch (error) {
    // En cas d'erreur, supprimer les fichiers uploadés
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    console.error('Erreur soumission témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la soumission du témoignage'
    });
  }
};

// Récupérer les témoignages approuvés (public) - VERSION MODIFIÉE
const getApprovedTestimonies = async (req, res) => {
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
    
    const query = { status: 'approved' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.is_featured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const testimonies = await Testimony.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-author_email -approved_by');

    // Transformer les chemins d'images en URLs complètes si nécessaire
    const testimoniesWithFullImageUrls = testimonies.map(testimony => {
      const testimonyObj = testimony.toObject();
      if (testimonyObj.images && testimonyObj.images.length > 0) {
        testimonyObj.images = testimonyObj.images.map(image => {
          // Si c'est un chemin relatif, le convertir en URL absolue
          if (image.startsWith('/uploads/')) {
            return `${req.protocol}://${req.get('host')}${image}`;
          }
          return image;
        });
      }
      return testimonyObj;
    });

    const total = await Testimony.countDocuments(query);

    res.json({
      success: true,
      data: testimoniesWithFullImageUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération témoignages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des témoignages'
    });
  }
};

// Admin: Récupérer tous les témoignages - VERSION MODIFIÉE
const getAllTestimonies = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres de requête invalides',
        errors: errors.array()
      });
    }

    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const testimonies = await Testimony.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Transformer les chemins d'images en URLs complètes
    const testimoniesWithFullImageUrls = testimonies.map(testimony => {
      const testimonyObj = testimony.toObject();
      if (testimonyObj.images && testimonyObj.images.length > 0) {
        testimonyObj.images = testimonyObj.images.map(image => {
          if (image.startsWith('/uploads/')) {
            return `${req.protocol}://${req.get('host')}${image}`;
          }
          return image;
        });
      }
      return testimonyObj;
    });

    const total = await Testimony.countDocuments(query);

    res.json({
      success: true,
      data: testimoniesWithFullImageUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur récupération témoignages admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des témoignages'
    });
  }
};


// Admin: Modifier le statut d'un témoignage
const updateTestimonyStatus = async (req, res) => {
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
    const { status, scheduled_date, is_featured } = req.body;

    const updateData = { status };
    
    if (status === 'approved') {
      updateData.approved_by = req.user.id;
      updateData.approved_at = new Date();
    }
    
    if (status === 'scheduled' && scheduled_date) {
      updateData.scheduled_date = new Date(scheduled_date);
    }
    
    if (is_featured !== undefined) {
      updateData.is_featured = is_featured;
    }

    const testimony = await Testimony.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('approved_by', 'name email');

    if (!testimony) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Statut mis à jour avec succès',
      data: testimony
    });
  } catch (error) {
    console.error('Erreur mise à jour statut témoignage:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Supprimer un témoignage
const deleteTestimony = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'ID de témoignage invalide',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const testimony = await Testimony.findByIdAndDelete(id);

    if (!testimony) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du témoignage'
    });
  }
};

// Récupérer les statistiques (admin)
const getTestimonyStats = async (req, res) => {
  try {
    const stats = await Testimony.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Testimony.countDocuments();
    const featured = await Testimony.countDocuments({ is_featured: true, status: 'approved' });

    res.json({
      success: true,
      data: {
        byStatus: stats,
        total,
        featured
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
  submitTestimony,
  getApprovedTestimonies,
  getAllTestimonies,
  updateTestimonyStatus,
  deleteTestimony,
  getTestimonyStats
};
// controllers/gallery.controller.js
const Album = require('../models/album');
const Video = require('../models/video');

// ===== ALBUMS =====

// Récupérer tous les albums
exports.getAlbums = async (req, res) => {
  try {
    const {
      category,
      published,
      page = 1,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    // Construction de la requête
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (published !== undefined) {
      query.is_published = published === 'true';
    }

    // Options de pagination et tri
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const albums = await Album.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Album.countDocuments(query);

    res.json({
      success: true,
      data: albums,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des albums',
      error: error.message
    });
  }
};

// Récupérer un album par ID
exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    
    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album non trouvé'
      });
    }

    res.json({
      success: true,
      data: album
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de l\'album',
      error: error.message
    });
  }
};

// Créer un nouvel album
exports.createAlbum = async (req, res) => {
  try {
    const albumData = {
      ...req.body,
      // S'assurer que photoCount est un nombre
      photoCount: parseInt(req.body.photoCount) || 0
    };

    const album = await Album.create(albumData);

    res.status(201).json({
      success: true,
      data: album,
      message: 'Album créé avec succès'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'album',
      error: error.message
    });
  }
};

// Mettre à jour un album
exports.updateAlbum = async (req, res) => {
  try {
    const albumData = { ...req.body };
    
    // Convertir photoCount en nombre si présent
    if (albumData.photoCount !== undefined) {
      albumData.photoCount = parseInt(albumData.photoCount);
    }

    const album = await Album.findByIdAndUpdate(
      req.params.id,
      albumData,
      { new: true, runValidators: true }
    );

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album non trouvé'
      });
    }

    res.json({
      success: true,
      data: album,
      message: 'Album mis à jour avec succès'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'album',
      error: error.message
    });
  }
};

// Supprimer un album
exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Album supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'album',
      error: error.message
    });
  }
};

// ===== VIDEOS =====

// Récupérer toutes les vidéos
exports.getVideos = async (req, res) => {
  try {
    const {
      category,
      published,
      page = 1,
      limit = 10,
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    // Construction de la requête
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (published !== undefined) {
      query.is_published = published === 'true';
    }

    // Options de pagination et tri
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const videos = await Video.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des vidéos',
      error: error.message
    });
  }
};

// Récupérer une vidéo par ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la vidéo',
      error: error.message
    });
  }
};

// Créer une nouvelle vidéo
exports.createVideo = async (req, res) => {
  try {
    const videoData = {
      ...req.body,
      // S'assurer que views est un nombre
      views: parseInt(req.body.views) || 0
    };

    const video = await Video.create(videoData);

    res.status(201).json({
      success: true,
      data: video,
      message: 'Vidéo créée avec succès'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la vidéo',
      error: error.message
    });
  }
};

// Mettre à jour une vidéo
exports.updateVideo = async (req, res) => {
  try {
    const videoData = { ...req.body };
    
    // Convertir views en nombre si présent
    if (videoData.views !== undefined) {
      videoData.views = parseInt(videoData.views);
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      videoData,
      { new: true, runValidators: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    res.json({
      success: true,
      data: video,
      message: 'Vidéo mise à jour avec succès'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la vidéo',
      error: error.message
    });
  }
};

// Supprimer une vidéo
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Vidéo supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la vidéo',
      error: error.message
    });
  }
};

// Incrémenter le compteur de vues
exports.incrementViews = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    res.json({
      success: true,
      data: video,
      message: 'Compteur de vues mis à jour'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des vues',
      error: error.message
    });
  }
};
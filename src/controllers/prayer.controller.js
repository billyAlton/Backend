// controllers/prayerRequest.controller.js
const PrayerRequest = require('../models/prayerRequest');
const { validationResult } = require('express-validator');

class PrayerRequestController {
  // Créer une nouvelle demande de prière
  async createPrayerRequest(req, res) {
    try {
      // Validation des données
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array(),
        });
      }

      const {
        title,
        description,
        requester_name,
        status,
        is_anonymous,
        is_public,
      } = req.body;
      const { id } = req.params;

      // Vérifier si l'utilisateur est authentifié
      /* if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      } */

      // Créer la demande de prière
      const prayerRequest = new PrayerRequest({
        title,
        description,
        requester_name: is_anonymous ? null : (requester_name || null),
        requester_id: req.user?.email,
        status: status || 'active',
        is_anonymous: is_anonymous || false,
        is_public: is_public !== undefined ? is_public : true,
      });

      await prayerRequest.save();

      return res.status(201).json({
        success: true,
        message: 'Demande de prière créée avec succès',
        data: prayerRequest,
      });

    } catch (error) {
      console.error('Erreur création demande de prière:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de la demande de prière',
        error: error.message,
      });
    }
  }

  // 🟠 Mettre à jour une demande de prière
  async updatePrayerRequest(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const {
        title,
        description,
        requester_name,
        status,
        is_anonymous,
        is_public,
      } = req.body;

      // Trouver la demande de prière
      const prayerRequest = await PrayerRequest.findById(id);
      if (!prayerRequest) {
        return res.status(404).json({
          success: false,
          message: 'Demande de prière non trouvée',
        });
      }

      // Vérifier les permissions (seul le créateur ou un admin peut modifier)
      if (prayerRequest.requester_id.toString() !== req.user.email && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à modifier cette demande de prière',
        });
      }

      // Mettre à jour les champs
      const updateData = {
        title: title !== undefined ? title : prayerRequest.title,
        description: description !== undefined ? description : prayerRequest.description,
        requester_name: is_anonymous ? null : (requester_name !== undefined ? requester_name : prayerRequest.requester_name),
        status: status !== undefined ? status : prayerRequest.status,
        is_anonymous: is_anonymous !== undefined ? is_anonymous : prayerRequest.is_anonymous,
        is_public: is_public !== undefined ? is_public : prayerRequest.is_public,
      };

      // Mettre à jour la demande de prière
      const updatedPrayerRequest = await PrayerRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Demande de prière mise à jour avec succès',
        data: updatedPrayerRequest,
      });

    } catch (error) {
      console.error('Erreur mise à jour demande de prière:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors,
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de demande de prière invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour de la demande de prière',
        error: error.message,
      });
    }
  }

  //  Récupérer toutes les demandes de prière
  async getAllPrayerRequests(req, res) {
    try {
      const { status, is_public, page = 1, limit = 10 } = req.query;
      
      let filter = {};
      
      // Filtres optionnels
      if (status) filter.status = status;
      if (is_public !== undefined) filter.is_public = is_public === 'true';
      
      const prayerRequests = await PrayerRequest.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const total = await PrayerRequest.countDocuments(filter);

      return res.json({
        success: true,
        data: prayerRequests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération demandes de prière:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des demandes de prière',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer une demande de prière par ID
  async getPrayerRequestById(req, res) {
    try {
      const { id } = req.params;
      
      const prayerRequest = await PrayerRequest.findById(id)

      if (!prayerRequest) {
        return res.status(404).json({
          success: false,
          message: 'Demande de prière non trouvée',
        });
      }

      return res.json({
        success: true,
        data: prayerRequest,
      });

    } catch (error) {
      console.error('Erreur récupération demande de prière:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de demande de prière invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération de la demande de prière',
        error: error.message,
      });
    }
  }

  // 🔴 Supprimer une demande de prière
  async deletePrayerRequest(req, res) {
    try {
      const { id } = req.params;

      const prayerRequest = await PrayerRequest.findById(id);
      if (!prayerRequest) {
        return res.status(404).json({
          success: false,
          message: 'Demande de prière non trouvée',
        });
      }

      // Vérifier les permissions
      if (prayerRequest.requester_id.toString() !== req.user.email && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à supprimer cette demande de prière',
        });
      }

      await PrayerRequest.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Demande de prière supprimée avec succès',
      });

    } catch (error) {
      console.error('Erreur suppression demande de prière:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de demande de prière invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression de la demande de prière',
        error: error.message,
      });
    }
  }

  // 🔵 Incrémenter le compteur de prières
  async incrementPrayerCount(req, res) {
    try {
      const { id } = req.params;

      const prayerRequest = await PrayerRequest.findByIdAndUpdate(
        id,
        { $inc: { prayer_count: 1 } },
        { new: true }
      );

      if (!prayerRequest) {
        return res.status(404).json({
          success: false,
          message: 'Demande de prière non trouvée',
        });
      }

      return res.json({
        success: true,
        message: 'Compteur de prières incrémenté',
        data: prayerRequest,
      });

    } catch (error) {
      console.error('Erreur incrémentation compteur:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de demande de prière invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de l\'incrémentation du compteur',
        error: error.message,
      });
    }
  }

  // 🟡 Récupérer les demandes de prière publiques
  async getPublicPrayerRequests(req, res) {
    try {
      const { status = 'active', page = 1, limit = 10 } = req.query;
      
      const prayerRequests = await PrayerRequest.find({
        is_public: true,
        status: status
      })
        .select('-requester_id') // Ne pas inclure les infos du demandeur
        .sort({ prayer_count: -1, createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await PrayerRequest.countDocuments({
        is_public: true,
        status: status
      });

      return res.json({
        success: true,
        data: prayerRequests,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération demandes publiques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des demandes publiques',
        error: error.message,
      });
    }
  }
}

module.exports = new PrayerRequestController();
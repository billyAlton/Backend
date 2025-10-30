// controllers/sermon.controller.js
const Sermon = require('../models/sermon');
const { validationResult } = require('express-validator');

class SermonController {
  // Créer un nouveau sermon
  async createSermon(req, res) {
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
        pastor_name,
        sermon_date,
        scripture_reference,
        video_url,
        audio_url,
        transcript,
        series,
        tags,
      } = req.body;

      // Vérifier si l'utilisateur est authentifié
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Créer le sermon
      const sermon = new Sermon({
        title,
        description: description || null,
        pastor_name,
        sermon_date,
        scripture_reference: scripture_reference || null,
        video_url: video_url || null,
        audio_url: audio_url || null,
        transcript: transcript || null,
        series: series || null,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        created_by: req.user.id,
      });

      await sermon.save();

      return res.status(201).json({
        success: true,
        message: 'Sermon créé avec succès',
        data: sermon,
      });

    } catch (error) {
      console.error('Erreur création sermon:', error);
      
      // Gestion des erreurs Mongoose
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
        message: 'Erreur serveur lors de la création du sermon',
        error: error.message,
      });
    }
  }

  // Mettre à jour un sermon
  async updateSermon(req, res) {
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
        pastor_name,
        sermon_date,
        scripture_reference,
        video_url,
        audio_url,
        transcript,
        series,
        tags,
      } = req.body;

      // Trouver le sermon
      const sermon = await Sermon.findById(id);
      if (!sermon) {
        return res.status(404).json({
          success: false,
          message: 'Sermon non trouvé',
        });
      }

      // Vérifier les permissions (optionnel)
      if (sermon.created_by.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à modifier ce sermon',
        });
      }

      // Mettre à jour les champs
      const updateData = {
        title: title !== undefined ? title : sermon.title,
        description: description !== undefined ? description : sermon.description,
        pastor_name: pastor_name !== undefined ? pastor_name : sermon.pastor_name,
        sermon_date: sermon_date !== undefined ? sermon_date : sermon.sermon_date,
        scripture_reference: scripture_reference !== undefined ? scripture_reference : sermon.scripture_reference,
        video_url: video_url !== undefined ? video_url : sermon.video_url,
        audio_url: audio_url !== undefined ? audio_url : sermon.audio_url,
        transcript: transcript !== undefined ? transcript : sermon.transcript,
        series: series !== undefined ? series : sermon.series,
        tags: tags !== undefined ? tags.split(',').map(tag => tag.trim()) : sermon.tags,
      };

      // Mettre à jour le sermon
      const updatedSermon = await Sermon.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Sermon mis à jour avec succès',
        data: updatedSermon,
      });

    } catch (error) {
      console.error('Erreur mise à jour sermon:', error);
      
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
          message: 'ID de sermon invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour du sermon',
        error: error.message,
      });
    }
  }

  // Récupérer tous les sermons
  async getAllSermons(req, res) {
    try {
      const sermons = await Sermon.find()
        .sort({ sermon_date: -1 })
        .populate('created_by', 'name email'); // Optionnel: peupler les infos utilisateur

      return res.json({
        success: true,
        data: sermons,
        count: sermons.length,
      });

    } catch (error) {
      console.error('Erreur récupération sermons:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des sermons',
        error: error.message,
      });
    }
  }

  // Récupérer un sermon par ID
  async getSermonById(req, res) {
    try {
      const { id } = req.params;
      
      const sermon = await Sermon.findById(id)
        .populate('created_by', 'name email'); // Optionnel

      if (!sermon) {
        return res.status(404).json({
          success: false,
          message: 'Sermon non trouvé',
        });
      }

      return res.json({
        success: true,
        data: sermon,
      });

    } catch (error) {
      console.error('Erreur récupération sermon:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de sermon invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du sermon',
        error: error.message,
      });
    }
  }

  // Supprimer un sermon
  async deleteSermon(req, res) {
    try {
      const { id } = req.params;

      const sermon = await Sermon.findById(id);
      if (!sermon) {
        return res.status(404).json({
          success: false,
          message: 'Sermon non trouvé',
        });
      }

      // Vérifier les permissions
      if (sermon.created_by.toString() !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à supprimer ce sermon',
        });
      }

      await Sermon.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Sermon supprimé avec succès',
      });

    } catch (error) {
      console.error('Erreur suppression sermon:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de sermon invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression du sermon',
        error: error.message,
      });
    }
  }

  // Rechercher des sermons (optionnel)
  async searchSermons(req, res) {
    try {
      const { query, pastor, series, tags, startDate, endDate } = req.query;
      
      let filter = {};

      // Recherche par texte
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { transcript: { $regex: query, $options: 'i' } }
        ];
      }

      // Filtres supplémentaires
      if (pastor) filter.pastor_name = { $regex: pastor, $options: 'i' };
      if (series) filter.series = { $regex: series, $options: 'i' };
      if (tags) filter.tags = { $in: tags.split(',') };
      
      // Filtre par date
      if (startDate || endDate) {
        filter.sermon_date = {};
        if (startDate) filter.sermon_date.$gte = new Date(startDate);
        if (endDate) filter.sermon_date.$lte = new Date(endDate);
      }

      const sermons = await Sermon.find(filter).sort({ sermon_date: -1 });

      return res.json({
        success: true,
        data: sermons,
        count: sermons.length,
      });

    } catch (error) {
      console.error('Erreur recherche sermons:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche des sermons',
        error: error.message,
      });
    }
  }
}

module.exports = new SermonController();
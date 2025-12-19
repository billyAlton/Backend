// controllers/donation.controller.js
const Donation = require('../models/donation');
const { validationResult } = require('express-validator');

class DonationController {
  // 🟢 Créer un nouveau don
  async createDonation(req, res) {
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
        donor_name,
        donor_email,
        amount,
        currency,
        donation_type,
        payment_method,
        payment_status,
        notes,
        is_recurring,
        recurrence_frequency,
        is_anonymous
      } = req.body;

      // Vérifier si l'utilisateur est authentifié (optionnel pour les dons)
      let donor_id = null;
      if (req.user && req.user.id) {
        donor_id = req.user.id;
      }

      // Calculer la date de prochaine récurrence si c'est un don récurrent
      let next_recurrence_date = null;
      if (is_recurring && recurrence_frequency) {
        next_recurrence_date = new Date();
        switch (recurrence_frequency) {
          case 'weekly':
            next_recurrence_date.setDate(next_recurrence_date.getDate() + 7);
            break;
          case 'monthly':
            next_recurrence_date.setMonth(next_recurrence_date.getMonth() + 1);
            break;
          case 'quarterly':
            next_recurrence_date.setMonth(next_recurrence_date.getMonth() + 3);
            break;
          case 'yearly':
            next_recurrence_date.setFullYear(next_recurrence_date.getFullYear() + 1);
            break;
        }
      }

      // Créer le don
      const donation = new Donation({
        donor_name: is_anonymous ? null : donor_name,
        donor_email: is_anonymous ? null : donor_email,
        donor_id,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        donation_type,
        payment_method,
        payment_status,
        notes: notes || null,
        is_recurring: is_recurring || false,
        recurrence_frequency: is_recurring ? recurrence_frequency : null,
        next_recurrence_date,
        is_anonymous: is_anonymous || false
      });

      await donation.save();

      return res.status(201).json({
        success: true,
        message: 'Don enregistré avec succès',
        data: donation,
      });

    } catch (error) {
      console.error('Erreur création don:', error);
      
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
        message: 'Erreur serveur lors de l\'enregistrement du don',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer tous les dons
  async getAllDonations(req, res) {
    try {
      const { 
        payment_status, 
        donation_type, 
        payment_method,
        is_recurring,
        start_date,
        end_date,
        page = 1, 
        limit = 10
      } = req.query;
      
      let filter = {};
      
      // Filtres optionnels
      if (payment_status) filter.payment_status = payment_status;
      if (donation_type) filter.donation_type = donation_type;
      if (payment_method) filter.payment_method = payment_method;
      if (is_recurring !== undefined) filter.is_recurring = is_recurring === 'true';
      
      // Filtre par date
      if (start_date || end_date) {
        filter.createdAt = {};
        if (start_date) filter.createdAt.$gte = new Date(start_date);
        if (end_date) filter.createdAt.$lte = new Date(end_date);
      }

      const donations = await Donation.find(filter)
        // .populate('donor_id', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Donation.countDocuments(filter);

      return res.json({
        success: true,
        data: donations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération dons:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des dons',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer un don par ID
  async getDonationById(req, res) {
    try {
      const { id } = req.params;
      
      const donation = await Donation.findById(id)
        // .populate('donor_id', 'name email');

      if (!donation) {
        return res.status(404).json({
          success: false,
          message: 'Don non trouvé',
        });
      }

      return res.json({
        success: true,
        data: donation,
      });

    } catch (error) {
      console.error('Erreur récupération don:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de don invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du don',
        error: error.message,
      });
    }
  }

  // 🟠 Mettre à jour un don
  async updateDonation(req, res) {
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
        donor_name,
        donor_email,
        amount,
        donation_type,
        payment_method,
        payment_status,
        notes,
        is_recurring,
        recurrence_frequency,
        is_anonymous
      } = req.body;

      // Trouver le don
      const donation = await Donation.findById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: 'Don non trouvé',
        });
      }

      // Calculer la nouvelle date de récurrence si nécessaire
      let next_recurrence_date = donation.next_recurrence_date;
      if (is_recurring && recurrence_frequency && recurrence_frequency !== donation.recurrence_frequency) {
        next_recurrence_date = new Date();
        switch (recurrence_frequency) {
          case 'weekly':
            next_recurrence_date.setDate(next_recurrence_date.getDate() + 7);
            break;
          case 'monthly':
            next_recurrence_date.setMonth(next_recurrence_date.getMonth() + 1);
            break;
          case 'quarterly':
            next_recurrence_date.setMonth(next_recurrence_date.getMonth() + 3);
            break;
          case 'yearly':
            next_recurrence_date.setFullYear(next_recurrence_date.getFullYear() + 1);
            break;
        }
      }

      // Mettre à jour les champs
      const updateData = {
        donor_name: is_anonymous ? null : (donor_name !== undefined ? donor_name : donation.donor_name),
        donor_email: is_anonymous ? null : (donor_email !== undefined ? donor_email : donation.donor_email),
        amount: amount !== undefined ? parseFloat(amount) : donation.amount,
        donation_type: donation_type !== undefined ? donation_type : donation.donation_type,
        payment_method: payment_method !== undefined ? payment_method : donation.payment_method,
        payment_status: payment_status !== undefined ? payment_status : donation.payment_status,
        notes: notes !== undefined ? notes : donation.notes,
        is_recurring: is_recurring !== undefined ? is_recurring : donation.is_recurring,
        recurrence_frequency: is_recurring ? (recurrence_frequency !== undefined ? recurrence_frequency : donation.recurrence_frequency) : null,
        next_recurrence_date,
        is_anonymous: is_anonymous !== undefined ? is_anonymous : donation.is_anonymous
      };

      // Mettre à jour le don
      const updatedDonation = await Donation.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Don mis à jour avec succès',
        data: updatedDonation,
      });

    } catch (error) {
      console.error('Erreur mise à jour don:', error);
      
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
          message: 'ID de don invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour du don',
        error: error.message,
      });
    }
  }

  // 🔴 Supprimer un don
  async deleteDonation(req, res) {
    try {
      const { id } = req.params;

      const donation = await Donation.findById(id);
      if (!donation) {
        return res.status(404).json({
          success: false,
          message: 'Don non trouvé',
        });
      }

      await Donation.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Don supprimé avec succès',
      });

    } catch (error) {
      console.error('Erreur suppression don:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de don invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression du don',
        error: error.message,
      });
    }
  }

  // 📊 Récupérer les statistiques des dons
  async getDonationStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      let matchStage = { payment_status: 'completed' };
      
      // Filtre par date
      if (start_date || end_date) {
        matchStage.createdAt = {};
        if (start_date) matchStage.createdAt.$gte = new Date(start_date);
        if (end_date) matchStage.createdAt.$lte = new Date(end_date);
      }

      const stats = await Donation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalDonations: { $sum: 1 },
            averageAmount: { $avg: '$amount' },
            maxAmount: { $max: '$amount' },
            minAmount: { $min: '$amount' }
          }
        }
      ]);

      // Statistiques par type de don
      const statsByType = await Donation.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$donation_type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);

      const result = stats[0] || { 
        totalAmount: 0, 
        totalDonations: 0, 
        averageAmount: 0, 
        maxAmount: 0, 
        minAmount: 0 
      };
      
      result.byType = statsByType;

      return res.json({
        success: true,
        data: result,
      });

    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des statistiques',
        error: error.message,
      });
    }
  }

  // 🔵 Récupérer les dons d'un utilisateur
  async getUserDonations(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const donations = await Donation.find({ donor_id: id })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Donation.countDocuments({ donor_id: id });

      return res.json({
        success: true,
        data: donations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération dons utilisateur:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des dons utilisateur',
        error: error.message,
      });
    }
  }
}

module.exports = new DonationController();
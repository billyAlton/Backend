// controllers/member.controller.js
const Member = require('../models/member');
const { validationResult } = require('express-validator');

class MemberController {
  // 🟢 Créer un nouveau membre
  async createMember(req, res) {
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
        email,
        full_name,
        phone,
        address,
        membership_status,
        role,
        date_of_birth,
        baptism_date,
        emergency_contact,
        spiritual_gifts,
        ministries,
        notes,
        avatar_url
      } = req.body;

      // Vérifier si l'email existe déjà
      const existingMember = await Member.findOne({ email: email.toLowerCase() });
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Un membre avec cet email existe déjà',
        });
      }

      // Préparer les données d'urgence
      let emergencyContactData = null;
      if (emergency_contact && emergency_contact.name) {
        emergencyContactData = {
          name: emergency_contact.name,
          phone: emergency_contact.phone || null,
          relationship: emergency_contact.relationship || null
        };
      }

      // Créer le membre
      const member = new Member({
        email: email.toLowerCase(),
        full_name,
        phone: phone || null,
        address: address || null,
        membership_status: membership_status || 'pending',
        role: role || 'member',
        date_of_birth: date_of_birth || null,
        baptism_date: baptism_date || null,
        emergency_contact: emergencyContactData,
        spiritual_gifts: spiritual_gifts ? spiritual_gifts.split(',').map(gift => gift.trim()) : [],
        ministries: ministries ? ministries.split(',').map(ministry => ministry.trim()) : [],
        notes: notes || null,
        avatar_url: avatar_url || null
      });

      await member.save();

      return res.status(201).json({
        success: true,
        message: 'Membre créé avec succès',
        data: member,
      });

    } catch (error) {
      console.error('Erreur création membre:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors,
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Un membre avec cet email existe déjà',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création du membre',
        error: error.message,
      });
    }
  }

  // 🟠 Mettre à jour un membre
  async updateMember(req, res) {
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
        email,
        full_name,
        phone,
        address,
        membership_status,
        role,
        date_of_birth,
        baptism_date,
        emergency_contact,
        spiritual_gifts,
        ministries,
        notes,
        avatar_url
      } = req.body;

      // Trouver le membre
      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
        });
      }

      // Vérifier si l'email existe déjà (pour un autre membre)
      if (email && email.toLowerCase() !== member.email) {
        const existingMember = await Member.findOne({ 
          email: email.toLowerCase(),
          _id: { $ne: id }
        });
        if (existingMember) {
          return res.status(400).json({
            success: false,
            message: 'Un autre membre avec cet email existe déjà',
          });
        }
      }

      // Préparer les données d'urgence
      let emergencyContactData = member.emergency_contact;
      if (emergency_contact) {
        emergencyContactData = {
          name: emergency_contact.name || member.emergency_contact?.name,
          phone: emergency_contact.phone || member.emergency_contact?.phone || null,
          relationship: emergency_contact.relationship || member.emergency_contact?.relationship || null
        };
      }

      // Mettre à jour les champs
      const updateData = {
        email: email ? email.toLowerCase() : member.email,
        full_name: full_name !== undefined ? full_name : member.full_name,
        phone: phone !== undefined ? phone : member.phone,
        address: address !== undefined ? address : member.address,
        membership_status: membership_status !== undefined ? membership_status : member.membership_status,
        role: role !== undefined ? role : member.role,
        date_of_birth: date_of_birth !== undefined ? date_of_birth : member.date_of_birth,
        baptism_date: baptism_date !== undefined ? baptism_date : member.baptism_date,
        emergency_contact: emergencyContactData,
        spiritual_gifts: spiritual_gifts !== undefined ? spiritual_gifts.split(',').map(gift => gift.trim()) : member.spiritual_gifts,
        ministries: ministries !== undefined ? ministries.split(',').map(ministry => ministry.trim()) : member.ministries,
        notes: notes !== undefined ? notes : member.notes,
        avatar_url: avatar_url !== undefined ? avatar_url : member.avatar_url
      };

      // Mettre à jour le membre
      const updatedMember = await Member.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Membre mis à jour avec succès',
        data: updatedMember,
      });

    } catch (error) {
      console.error('Erreur mise à jour membre:', error);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: errors,
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Un autre membre avec cet email existe déjà',
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour du membre',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer tous les membres
  async getAllMembers(req, res) {
    try {
      const { 
        membership_status, 
        role, 
        search,
        page = 1, 
        limit = 10,
        sort = 'full_name'
      } = req.query;
      
      let filter = {};
      
      // Filtres optionnels
      if (membership_status) filter.membership_status = membership_status;
      if (role) filter.role = role;
      
      // Recherche textuelle
      if (search) {
        filter.$or = [
          { full_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const members = await Member.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-__v');

      const total = await Member.countDocuments(filter);

      return res.json({
        success: true,
        data: members,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération membres:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des membres',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer un membre par ID
  async getMemberById(req, res) {
    try {
      const { id } = req.params;
      
      const member = await Member.findById(id);

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
        });
      }

      return res.json({
        success: true,
        data: member,
      });

    } catch (error) {
      console.error('Erreur récupération membre:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du membre',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer un membre par email
  async getMemberByEmail(req, res) {
    try {
      const { email } = req.params;
      
      const member = await Member.findOne({ email: email.toLowerCase() });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
        });
      }

      return res.json({
        success: true,
        data: member,
      });

    } catch (error) {
      console.error('Erreur récupération membre par email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération du membre',
        error: error.message,
      });
    }
  }

  // 🔴 Supprimer un membre
  async deleteMember(req, res) {
    try {
      const { id } = req.params;

      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
        });
      }

      await Member.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Membre supprimé avec succès',
      });

    } catch (error) {
      console.error('Erreur suppression membre:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression du membre',
        error: error.message,
      });
    }
  }

  // 📊 Récupérer les statistiques des membres
  async getMemberStats(req, res) {
    try {
      const stats = await Member.getStats();
      
      return res.json({
        success: true,
        data: stats,
      });

    } catch (error) {
      console.error('Erreur récupération statistiques membres:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des statistiques',
        error: error.message,
      });
    }
  }

  // 🔵 Mettre à jour la dernière activité
  async updateLastActivity(req, res) {
    try {
      const { id } = req.params;

      const member = await Member.findById(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: 'Membre non trouvé',
        });
      }

      await member.updateLastActivity();

      return res.json({
        success: true,
        message: 'Dernière activité mise à jour',
        data: member,
      });

    } catch (error) {
      console.error('Erreur mise à jour activité:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID de membre invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour de l\'activité',
        error: error.message,
      });
    }
  }
}

module.exports = new MemberController();
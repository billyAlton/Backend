// controllers/blogPost.controller.js
const BlogPost = require('../models/blogPost');
const { validationResult } = require('express-validator');

class BlogController {
  // Créer un nouvel article
  async createBlogPost(req, res) {
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
        slug,
        content,
        excerpt,
        featured_image,
        status,
        tags,
      } = req.body;

      // Vérifier si l'utilisateur est authentifié
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Vérifier si le slug existe déjà
      const existingPost = await BlogPost.findOne({ slug });
      if (existingPost) {
        return res.status(400).json({
          success: false,
          message: 'Un article avec ce slug existe déjà',
        });
      }

      // Créer l'article
      const blogPost = new BlogPost({
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featured_image: featured_image || null,
        status: status || 'draft',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        author: req.user.email,
      });

      await blogPost.save();

      return res.status(201).json({
        success: true,
        message: 'Article créé avec succès',
        data: blogPost,
      });

    } catch (error) {
      console.error('Erreur création article:', error);
      
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
          message: 'Un article avec ce slug existe déjà',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de l\'article',
        error: error.message,
      });
    }
  }

  // Mettre à jour un article
  async updateBlogPost(req, res) {
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
        slug,
        content,
        excerpt,
        featured_image,
        status,
        tags,
      } = req.body;

      // Trouver l'article
      const blogPost = await BlogPost.findById(id);
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé',
        });
      }

      // Vérifier les permissions (seul l'auteur ou un admin peut modifier)
      if (blogPost.author.toString() !== req.user.email && req.user.role !== "master_admin") {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à modifier cet article',
        });
      }

      // Vérifier si le slug existe déjà (pour un autre article)
      if (slug && slug !== blogPost.slug) {
        const existingPost = await BlogPost.findOne({ slug, _id: { $ne: id } });
        if (existingPost) {
          return res.status(400).json({
            success: false,
            message: 'Un autre article avec ce slug existe déjà',
          });
        }
      }

      // Mettre à jour les champs
      const updateData = {
        title: title !== undefined ? title : blogPost.title,
        slug: slug !== undefined ? slug : blogPost.slug,
        content: content !== undefined ? content : blogPost.content,
        excerpt: excerpt !== undefined ? excerpt : blogPost.excerpt,
        featured_image: featured_image !== undefined ? featured_image : blogPost.featured_image,
        status: status !== undefined ? status : blogPost.status,
        tags: tags !== undefined ? tags.split(',').map(tag => tag.trim()) : blogPost.tags,
      };

      // Mettre à jour l'article
      const updatedBlogPost = await BlogPost.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.json({
        success: true,
        message: 'Article mis à jour avec succès',
        data: updatedBlogPost,
      });

    } catch (error) {
      console.error('Erreur mise à jour article:', error);
      
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
          message: 'Un autre article avec ce slug existe déjà',
        });
      }

      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID d\'article invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la mise à jour de l\'article',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer tous les articles
  async getAllBlogPosts(req, res) {
    try {
      const { 
        status, 
        author, 
        tag, 
        page = 1, 
        limit = 10,
        sort = '-createdAt'
      } = req.query;
      
      let filter = {};
      
      // Filtres optionnels
      if (status) filter.status = status;
      if (author) filter.author = author;
      if (tag) filter.tags = { $in: [tag] };
      
      const blogPosts = await BlogPost.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await BlogPost.countDocuments(filter);

      return res.json({
        success: true,
        data: blogPosts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération articles:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des articles',
        error: error.message,
      });
    }
  }

  // 🟣 Récupérer un article par ID
  async getBlogPostById(req, res) {
    try {
      const { id } = req.params;
      console.log("ID ", id)
      
      const blogPost = await BlogPost.findById(id)

      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé',
        });
      }

      // Incrémenter le compteur de vues
      blogPost.views += 1;
      await blogPost.save();

      return res.json({
        success: true,
        data: blogPost,
      });

    } catch (error) {
      console.error('Erreur récupération article:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID d\'article invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération de l\'article',
        error: error.message,
      });
    }
  }

  //  Récupérer un article par slug
  async getBlogPostBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      const blogPost = await BlogPost.findOne({ slug });

      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé',
        });
      }

      // Incrémenter le compteur de vues
      blogPost.views += 1;
      await blogPost.save();

      return res.json({
        success: true,
        data: blogPost,
      });

    } catch (error) {
      console.error('Erreur récupération article par slug:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération de l\'article',
        error: error.message,
      });
    }
  }

  // 🔴 Supprimer un article
  async deleteBlogPost(req, res) {
    try {
      const { id } = req.params;

      const blogPost = await BlogPost.findById(id);
      if (!blogPost) {
        return res.status(404).json({
          success: false,
          message: 'Article non trouvé',
        });
      }

      // Vérifier les permissions
      if (blogPost.author.toString() !== req.user.email && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Non autorisé à supprimer cet article',
        });
      }

      await BlogPost.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Article supprimé avec succès',
      });

    } catch (error) {
      console.error('Erreur suppression article:', error);
      
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'ID d\'article invalide',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la suppression de l\'article',
        error: error.message,
      });
    }
  }

  // 🔵 Récupérer les articles publiés (publique)
  async getPublishedBlogPosts(req, res) {
    try {
      const { 
        tag, 
        page = 1, 
        limit = 10,
        sort = '-published_at'
      } = req.query;
      
      let filter = {
        status: 'published'
      };
      
      if (tag) filter.tags = { $in: [tag] };

      const blogPosts = await BlogPost.find(filter)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await BlogPost.countDocuments(filter);

      return res.json({
        success: true,
        data: blogPosts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });

    } catch (error) {
      console.error('Erreur récupération articles publiés:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la récupération des articles publiés',
        error: error.message,
      });
    }
  }
}

module.exports = new BlogController();
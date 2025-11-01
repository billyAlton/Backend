// routes/blogPost.route.js
const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blog.controller');
const blogPostValidation = require('../middleware/blogPostValidation');
const authMiddleware = require('../middleware/auth');

// Routes publiques
router.get('/blog/posts/published', BlogController.getPublishedBlogPosts);
router.get('/blog/posts/slug/:slug', BlogController.getBlogPostBySlug);

// Routes protégées
router.use(authMiddleware);

// CRUD des articles de blog
router.post('/blog/posts', blogPostValidation.create, BlogController.createBlogPost);
router.get('/blog/posts', BlogController.getAllBlogPosts);
router.get('/blog/posts/:id', BlogController.getBlogPostById);
router.put('/blog/posts/:id', blogPostValidation.update, BlogController.updateBlogPost);
router.delete('/blog/posts/:id', BlogController.deleteBlogPost);

module.exports = router;
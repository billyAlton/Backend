const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  trackPageView,
  getSummary,
  getTopPages,
  getDailyViews,
  getDevices,
  getReferrers,
} = require('../controllers/analytics.controller');

// Public — no auth required (called from the site visitor's browser)
router.post('/pageview', trackPageView);

// Protected — require admin token
router.get('/summary', authMiddleware, getSummary);
router.get('/top-pages', authMiddleware, getTopPages);
router.get('/daily', authMiddleware, getDailyViews);
router.get('/devices', authMiddleware, getDevices);
router.get('/referrers', authMiddleware, getReferrers);

module.exports = router;

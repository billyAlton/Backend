const PageView = require('../models/pageView');

/**
 * Detect device type from User-Agent string
 */
const detectDevice = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/.test(ua)) return 'mobile';
  return 'desktop';
};

/**
 * Normalize referrer to a readable source label
 */
const normalizeReferrer = (referrer = '') => {
  if (!referrer || referrer === '' || referrer === 'null') return 'Direct';
  if (/google\./.test(referrer)) return 'Google';
  if (/facebook\.|fb\./.test(referrer)) return 'Facebook';
  if (/instagram\./.test(referrer)) return 'Instagram';
  if (/youtube\./.test(referrer)) return 'YouTube';
  if (/twitter\.|t\.co/.test(referrer)) return 'Twitter/X';
  if (/whatsapp\./.test(referrer)) return 'WhatsApp';
  try {
    const url = new URL(referrer);
    return url.hostname.replace('www.', '');
  } catch {
    return 'Autre';
  }
};

// ─── POST /api/analytics/pageview (public — no auth) ─────────────────────────
const trackPageView = async (req, res) => {
  try {
    const { path, sessionId, referrer } = req.body;

    if (!path || !sessionId) {
      return res.status(400).json({ success: false, message: 'path et sessionId requis' });
    }

    // Ignore admin routes
    if (path.startsWith('/admin')) {
      return res.status(200).json({ success: true, ignored: true });
    }

    const userAgent = req.headers['user-agent'] || '';
    const device = detectDevice(userAgent);
    const normalizedReferrer = normalizeReferrer(referrer);

    await PageView.create({
      path,
      sessionId,
      referrer: normalizedReferrer,
      userAgent,
      device,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Analytics trackPageView error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─── GET /api/analytics/summary (protected) ──────────────────────────────────
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const startOf30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalViews, viewsToday, views7Days, views30Days, uniqueSessionsTotal, uniqueSessions30Days] = await Promise.all([
      PageView.countDocuments(),
      PageView.countDocuments({ timestamp: { $gte: startOfToday } }),
      PageView.countDocuments({ timestamp: { $gte: startOf7Days } }),
      PageView.countDocuments({ timestamp: { $gte: startOf30Days } }),
      PageView.distinct('sessionId'),
      PageView.distinct('sessionId', { timestamp: { $gte: startOf30Days } }),
    ]);

    res.json({
      success: true,
      data: {
        totalViews,
        viewsToday,
        views7Days,
        views30Days,
        uniqueVisitors: uniqueSessionsTotal.length,
        uniqueVisitors30Days: uniqueSessions30Days.length,
      },
    });
  } catch (error) {
    console.error('Analytics getSummary error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─── GET /api/analytics/top-pages (protected) ────────────────────────────────
const getTopPages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const topPages = await PageView.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$path', views: { $sum: 1 }, uniqueVisitors: { $addToSet: '$sessionId' } } },
      { $project: { path: '$_id', views: 1, uniqueVisitors: { $size: '$uniqueVisitors' }, _id: 0 } },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]);

    res.json({ success: true, data: topPages });
  } catch (error) {
    console.error('Analytics getTopPages error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─── GET /api/analytics/daily (protected) ────────────────────────────────────
const getDailyViews = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const daily = await PageView.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' },
          },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$sessionId' },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          views: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Fill missing days with 0
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toISOString().split('T')[0];
      const found = daily.find((row) => row.date.toISOString().split('T')[0] === label);
      result.push({ date: label, views: found?.views || 0, uniqueVisitors: found?.uniqueVisitors || 0 });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Analytics getDailyViews error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─── GET /api/analytics/devices (protected) ──────────────────────────────────
const getDevices = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const devices = await PageView.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$device', count: { $sum: 1 } } },
      { $project: { device: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    res.json({ success: true, data: devices });
  } catch (error) {
    console.error('Analytics getDevices error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─── GET /api/analytics/referrers (protected) ────────────────────────────────
const getReferrers = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const referrers = await PageView.aggregate([
      { $match: { timestamp: { $gte: since } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $project: { source: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ success: true, data: referrers });
  } catch (error) {
    console.error('Analytics getReferrers error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  trackPageView,
  getSummary,
  getTopPages,
  getDailyViews,
  getDevices,
  getReferrers,
};

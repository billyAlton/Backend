// middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier avec la clé secrète Supabase JWT
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // Le payload JWT de Supabase contient les infos utilisateur
    req.user = {
      id: decoded.sub, // L'ID utilisateur Supabase
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Erreur vérification token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Erreur d\'authentification',
    });
  }
};

module.exports = authMiddleware;
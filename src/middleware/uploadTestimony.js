// middleware/uploadTestimony.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Créer le dossier uploads pour les témoignages s'il n'existe pas
const uploadDir = "./uploads/testimonies";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "testimony-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées !"), false);
  }
};

// Configuration de multer pour les témoignages
const uploadTestimony = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max par fichier
  },
  fileFilter: fileFilter,
});

module.exports = uploadTestimony;
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connexion à MongoDB avec la variable d’environnement MONGO_URI
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
    process.exit(1); // Arrête le serveur si la connexion échoue
  }
};

module.exports = connectDB;

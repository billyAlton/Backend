const express = require ('express');
const  cors = require ('cors');
const dotenv = require ('dotenv');

dotenv.config();
const app = express();
const connectDB = require('./config/db');
connectDB();

app.use(cors());
app.use(express.json());

// --- Import des routes ---
const eventRoutes = require("./src/routes/event.route");
app.use("/api/events", eventRoutes);

// Exemple de route
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le backend Node.js 🚀' });
});

// Port depuis .env ou 5000 par défaut
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

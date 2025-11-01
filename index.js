const express = require ('express');
const  cors = require ('cors');
const dotenv = require ('dotenv');
const path = require("path");
dotenv.config();
const app = express();
const connectDB = require('./config/db');
connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Import des routes ---
const eventRoutes = require("./src/routes/event.route");
const sermonRoutes = require('./src/routes/sermon.route');
const prayerRoutes = require('./src/routes/prayer.route');
const blogRoutes = require('./src/routes/blog.route');


app.use("/api/events", eventRoutes);
app.use("/api/sermons", sermonRoutes);
app.use("/api/prayers", prayerRoutes);
app.use("/api/blogs", blogRoutes);

// Exemple de route
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur le backend Node.js 🚀' });
});

// Port depuis .env ou 5000 par défaut
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

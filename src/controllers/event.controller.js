const Event = require("../models/event");


const fs = require("fs");

// 🟢 Créer un événement
exports.createEvent = async (req, res) => {
  console.log("=== BACKEND DEBUG ===");
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  
  try {
    // Préparer les données
    const eventData = {
      title: req.body.title,
      description: req.body.description || null,
      event_type: req.body.event_type,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      location: req.body.location || null,
      max_attendees: req.body.max_attendees ? Number(req.body.max_attendees) : null,
      created_by: req.body.created_by,
    };

    console.log("EventData préparé:", eventData);

    // Ajouter les images si présentes
    if (req.files && req.files.length > 0) {
      eventData.images = req.files.map(file => `/uploads/events/${file.filename}`);
      console.log("Images ajoutées:", eventData.images);
    }

    // Créer l'événement
    const newEvent = await Event.create(eventData);
    console.log("Event créé:", newEvent);
    
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("=== ERREUR BACKEND ===");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    
    // Nettoyer les fichiers uploadés en cas d'erreur
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Erreur suppression:", unlinkErr);
        });
      });
    }
    
    res.status(400).json({ 
      message: err.message,
      details: err.errors || {}
    });
  }
};

//  Modifier un événement
exports.updateEvent = async (req, res) => {
  try {
    const eventData = { ...req.body };

    // Ajouter les nouvelles images si présentes
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/events/${file.filename}`);
      
      // Option 1 : Remplacer toutes les images
      eventData.images = newImages;
      
      // Option 2 : Ajouter aux images existantes
      // const existingEvent = await Event.findById(req.params.id);
      // eventData.images = [...(existingEvent.images || []), ...newImages];
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  Lister tous les événements
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ creaatedAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Récupérer un seul événement
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Supprimer un événement
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import { create, findByIdAndUpdate, find, findById, findByIdAndDelete } from "../models/event";

// 🟢 Créer un événement
export async function createEvent(req, res) {
  try {
    const event = await create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// 🟡 Modifier un événement
export async function updateEvent(req, res) {
  try {
    const event = await findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// 🔵 Lister tous les événements
export async function getEvents(req, res) {
  try {
    const events = await find().sort({ start_date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 🟠 Récupérer un seul événement
export async function getEventById(req, res) {
  try {
    const event = await findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// 🔴 Supprimer un événement
export async function deleteEvent(req, res) {
  try {
    const event = await findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

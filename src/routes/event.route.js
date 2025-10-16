const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

// CRUD
router.post("/create", eventController.createEvent);
router.get("/get", eventController.getEvents);
router.get("/getone/:id", eventController.getEventById);
router.put("/update/:id", eventController.updateEvent);
router.delete("/delete/:id", eventController.deleteEvent);

module.exports = router;

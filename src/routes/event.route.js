const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const upload = require("../middleware/upload");

// CRUD
router.post("/create",upload.array("images", 10), eventController.createEvent);
router.get("/get", eventController.getEvents);
router.get("/getone/:id", eventController.getEventById);
router.put("/update/:id",upload.array("images", 10), eventController.updateEvent);
router.delete("/delete/:id", eventController.deleteEvent);

module.exports = router;

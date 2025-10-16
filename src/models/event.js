import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    event_type: {
      type: String,
      enum: ["service", "meeting", "special", "youth", "prayer"],
      default: "service",
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    location: { type: String },
    max_attendees: { type: Number },
    created_by: { type: String, required: true }, // ou ObjectId si tu veux relier à un User
  },
  { timestamps: true }
);

export default model("Event", eventSchema);

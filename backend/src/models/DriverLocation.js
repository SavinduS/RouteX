const mongoose = require("mongoose");

const driverLocationSchema = new mongoose.Schema({
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  recorded_at: { type: Date, default: Date.now },
  driver_status: {
    type: String,
    enum: ["online", "offline"],
    default: "offline",
  },
});

module.exports = mongoose.model("DriverLocation", driverLocationSchema);

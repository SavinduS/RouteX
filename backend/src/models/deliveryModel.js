const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  status: {
    type: String,
    enum: ["available", "assigned", "picked_up", "in_transit"],
    default: "available",
  },
  vehicle_type: { type: String, required: true },
  package_size: {
    type: String,
    enum: ["small", "medium", "large"],
    required: true,
  },
  pickup_address: { type: String, required: true },
  pickup_lat: { type: Number, required: true },
  pickup_lng: { type: Number, required: true },
  dropoff_address: { type: String, required: true },
  dropoff_lat: { type: Number, required: true },
  dropoff_lng: { type: Number, required: true },
  distance_km: { type: Number, required: true },
  total_cost: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);

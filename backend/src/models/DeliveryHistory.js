const mongoose = require("mongoose");

const deliveryHistorySchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  final_status: {
    type: String,
    enum: ["delivered", "cancelled"],
    required: true,
  },
  total_cost: { type: Number, required: true },
  driver_earnings: { type: Number, required: true },
  platform_earnings: { type: Number, required: true },
  completed_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeliveryHistory", deliveryHistorySchema);

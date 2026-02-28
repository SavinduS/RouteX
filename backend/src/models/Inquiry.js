const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "replied", "closed"], 
    default: "pending" 
  },
  admin_reply: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Inquiry", inquirySchema);
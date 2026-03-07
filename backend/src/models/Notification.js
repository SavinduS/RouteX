const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["new_entrepreneur", "new_driver", "new_inquiry"],
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedModel",
    },
    relatedModel: {
      type: String,
      enum: ["User", "Inquiry"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);

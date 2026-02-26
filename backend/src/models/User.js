const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone_number: {
      type: String,
      required: true,
      trim: true,
    },

    // Never store plain password
    password_hash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["entrepreneur", "driver", "admin"],
      required: true,
      default: "entrepreneur",
    },

    // Driver-only fields
    vehicle_type: {
      type: String,
      enum: ["bike", "tuktuk", "van", "truck"],
      required: function () {
        return this.role === "driver";
      },
    },

    license_number: {
      type: String,
      required: function () {
        return this.role === "driver";
      },
      unique: true,
      sparse: true, // important: avoids unique conflict for non-drivers (null values)
      trim: true,
    },

    is_verified: {
      type: Boolean,
      default: false, // driver register => false (admin verify later)
    },
  },
  { timestamps: true }
);

//  Fix for OverwriteModelError with nodemon/hot reload
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
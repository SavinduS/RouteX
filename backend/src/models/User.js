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

    // Optional for Google users
    phone_number: {
      type: String,
      required: function () {
        return this.auth_provider !== "google";
      },
      trim: true,
    },

    // Optional for Google users
    password_hash: {
      type: String,
      required: function () {
        return this.auth_provider !== "google";
      },
    },

    // Track how user signed up
    auth_provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      required: true,
    },

    //Google unique id (sub)
    google_id: {
      type: String,
      unique: true,
      sparse: true,
    },

    //Optional avatar
    avatar: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["entrepreneur", "driver", "admin"],
      required: true,
      default: "entrepreneur",
    },

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
      sparse: true,
      trim: true,
    },

    is_verified: {
      type: Boolean,
      default: false,
    },

    user_id: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
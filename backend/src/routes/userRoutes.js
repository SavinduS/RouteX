const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

// Validators
const updateProfileValidator = [
  body("full_name").optional().isLength({ min: 2 }).withMessage("Full name too short"),
  body("email").optional().isEmail().withMessage("Valid email required"),
  body("phone_number").optional().notEmpty().withMessage("Phone number required"),
];

const changePasswordValidator = [
  body("current_password").notEmpty().withMessage("Current password required"),
  body("new_password").isLength({ min: 6 }).withMessage("New password min 6 characters"),
];

// GET /api/users/profile (Read)
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/users/update (Update profile)
router.put("/update", auth, updateProfileValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const userId = req.user.id;

    // Allow only these fields to be updated by the logged-in user
    const allowed = ["full_name", "email", "phone_number"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Block privilege changes (ignore if user tries to send them)
    // role, is_verified, vehicle_type, license_number should be admin-only
    if ("role" in req.body || "is_verified" in req.body || "vehicle_type" in req.body || "license_number" in req.body) {
      // not an error; just ignore them for safety
    }

    // If email changed, check uniqueness
    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (exists) return res.status(409).json({ message: "Email already exists" });
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password_hash");

    return res.json({ message: "Profile updated", user: updated });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/users/password (Update password)
router.put("/password", auth, changePasswordValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { current_password, new_password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(current_password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Current password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/users/delete (Delete own account)
router.delete("/delete", auth, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.user.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });

    return res.json({ message: "Account deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
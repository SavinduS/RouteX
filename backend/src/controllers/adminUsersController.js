const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/admin/users?role=driver&search=abc&page=1&limit=10
exports.listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10"), 1), 50);

    const filter = {};
    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone_number: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select("-password_hash")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/admin/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password_hash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/admin/users (admin creates user)
exports.createUserByAdmin = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      password,
      role,
      vehicle_type,
      license_number,
      is_verified,
    } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    if (role === "driver" && (!vehicle_type || !license_number)) {
      return res.status(400).json({ message: "Driver must have vehicle_type and license_number" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      email,
      phone_number,
      password_hash,
      role,
      vehicle_type: role === "driver" ? vehicle_type : undefined,
      license_number: role === "driver" ? license_number : undefined,
      is_verified: role === "driver" ? !!is_verified : true,
    });

    res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/admin/users/:id
exports.updateUserByAdmin = async (req, res) => {
  try {
    const userId = req.params.id;

    // Admin can update these (include role + driver fields)
    const allowed = [
      "full_name",
      "email",
      "phone_number",
      "role",
      "vehicle_type",
      "license_number",
      "is_verified",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.email) {
      const exists = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (exists) return res.status(409).json({ message: "Email already exists" });
    }

    // If role is changed away from driver -> clear driver-only fields
    const current = await User.findById(userId);
    if (!current) return res.status(404).json({ message: "User not found" });

    if (updates.role && updates.role !== "driver") {
      updates.vehicle_type = undefined;
      updates.license_number = undefined;
      updates.is_verified = true;
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password_hash");

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUserByAdmin = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/admin/users/:id/verify-driver  { is_verified: true/false }
exports.verifyDriver = async (req, res) => {
  try {
    const { is_verified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "driver") {
      return res.status(400).json({ message: "Only drivers can be verified" });
    }

    user.is_verified = !!is_verified;
    await user.save();

    res.json({ message: "Driver verification updated", is_verified: user.is_verified });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
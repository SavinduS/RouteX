const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    full_name,
    email,
    phone_number,
    password,
    role,
    vehicle_type,
    license_number,
  } = req.body;

  try {
    // Check email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // If driver, check required fields
    if (role === "driver") {
      if (!vehicle_type || !license_number) {
        return res.status(400).json({
          message: "Driver must provide vehicle type and license number",
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      full_name,
      email,
      phone_number,
      password_hash,
      role,
      vehicle_type: role === "driver" ? vehicle_type : undefined,
      license_number: role === "driver" ? license_number : undefined,
      is_verified: role === "driver" ? false : true,
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        is_verified: newUser.is_verified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 1) User exists?
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2) Password match?
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3) Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4) Response
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
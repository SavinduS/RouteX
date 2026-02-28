const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

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
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already exists" });

    if (role === "driver") {
      if (!vehicle_type || !license_number) {
        return res.status(400).json({
          message: "Driver must provide vehicle type and license number",
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      full_name,
      email,
      phone_number,
      password_hash,
      role,
      vehicle_type: role === "driver" ? vehicle_type : undefined,
      license_number: role === "driver" ? license_number : undefined,
      is_verified: role === "driver" ? false : true,
      auth_provider: "local",
    });

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
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    //  Google users cannot login with password
    if (user.auth_provider === "google") {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please continue with Google.",
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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

//  Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Missing Google credential token" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const googleId = payload?.sub;
    const picture = payload?.picture;

    if (!email || !googleId) {
      return res.status(401).json({ message: "Google token invalid" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        full_name: name || "Google User",
        email,
        auth_provider: "google",
        google_id: googleId,
        avatar: picture,
        role: "entrepreneur",
        is_verified: true,
      });
    } else {
      if (!user.google_id) user.google_id = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      user.auth_provider = "google";
      user.is_verified = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Google login successful",
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
    console.error("Google Login Error:", error);
    return res.status(401).json({ message: "Google authentication failed" });
  }
};
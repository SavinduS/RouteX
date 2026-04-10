const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createFirstAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@routex.com";

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const password_hash = await bcrypt.hash("Admin12345", 10);

    const admin = await User.create({
      full_name: "System Admin",
      email: "admin@routex.com",
      phone_number: "0771234567",
      password_hash,
      auth_provider: "local",
      role: "admin",
      is_verified: true,
      user_id: "ADM0001"
    });

    console.log("🔥 First admin created successfully");
    console.log(admin);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createFirstAdmin();
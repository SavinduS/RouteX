const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const driver = await User.findById(req.user.id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (driver.is_verified !== true) {
      return res.status(403).json({
        message: "Driver account not verified by admin",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
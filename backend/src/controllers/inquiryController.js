const Inquiry = require('../models/Inquiry');

const sendInquiry = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // Validation: දත්ත ලැබී ඇත්දැයි බැලීම
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and Message are required" });
    }

    // User ID එක Auth middleware එකෙන් ලැබෙනවාදැයි බැලීම
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const inquiry = new Inquiry({
      user_id: userId,
      subject,
      message
    });

    const savedInquiry = await inquiry.save();
    res.status(201).json({ success: true, data: savedInquiry });
    
  } catch (error) {
    console.error("Backend Inquiry Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = { sendInquiry };
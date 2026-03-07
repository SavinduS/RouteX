const Inquiry = require('../models/Inquiry');

const sendInquiry = async (req, res) => {
  try {
    const { subject, message } = req.body;

    // req.user.id ලැබෙන්නේ Auth middleware එකෙනි
    const inquiry = new Inquiry({
      user_id: req.user.id, 
      subject,
      message
    });

    const savedInquiry = await inquiry.save();

    const { sendNotification } = require("../utils/notificationService");
    await sendNotification({
      type: "new_inquiry",
      message: `New Inquiry from user: ${subject}`,
      relatedId: savedInquiry._id,
      relatedModel: "Inquiry",
    });

    res.status(201).json({ success: true, data: savedInquiry });
    
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = { sendInquiry };
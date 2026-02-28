const express = require("express");
const router = express.Router();
const { sendInquiry } = require("../controllers/inquiryController");
const auth = require("../middleware/auth"); // ඔබේ Middleware එකේ path එක නිවැරදිව දෙන්න

// POST /api/inquiries
router.post("/", auth, sendInquiry);

module.exports = router;
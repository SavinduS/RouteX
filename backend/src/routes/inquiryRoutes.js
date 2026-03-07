const express = require("express");
const router = express.Router();
const { sendInquiry } = require("../controllers/inquiryController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");


router.post("/", auth, role('entrepreneur'), sendInquiry);

module.exports = router;
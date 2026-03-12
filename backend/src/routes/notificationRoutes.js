const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { getNotifications, markAsRead, markAllAsRead } = require("../controllers/notificationController");

router.get("/", auth, role("admin"), getNotifications);
router.put("/:id/read", auth, role("admin"), markAsRead);
router.put("/read-all", auth, role("admin"), markAllAsRead);

module.exports = router;

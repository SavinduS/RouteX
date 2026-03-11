const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const role = require("../middleware/role");
const verifiedDriver = require("../middleware/verifiedDriver");

const {
  updateLocation,
  getAvailableOrders,
  getActiveOrders,
  acceptOrder,
  updateOrderStatus,
} = require("../controllers/driverController");

router.use(auth, role("driver"), verifiedDriver);

// 1. Update Driver Location (POST /api/driver/location)
router.route("/location").post(updateLocation);

// 2. Fetch Available Orders for Drivers (GET /api/driver/orders/available?vehicle_type=bike)
router.route("/orders/available").get(getAvailableOrders);

// Fetch Active Orders (assigned/picked_up)
router.route("/orders/active").get(getActiveOrders);

// 3. Accept an Order (POST /api/driver/orders/accept)
router.route("/orders/accept").post(acceptOrder);

// 4. Update Order Status to picked_up / in_transit / delivered (POST /api/driver/orders/status)
router.route("/orders/status").post(updateOrderStatus);

module.exports = router;

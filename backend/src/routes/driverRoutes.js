const express = require("express");
const router = express.Router();
const {
  updateLocation,
  getAvailableOrders,
  acceptOrder,
  updateOrderStatus,
} = require("../controllers/driverController");

// 1. Update Driver Location (POST /api/driver/location)
router.route("/location").post(updateLocation);

// 2. Fetch Available Orders for Drivers (GET /api/driver/orders/available?vehicle_type=bike)
// Make sure this comes BEFORE any route with /:id if you add ID routes later
router.route("/orders/available").get(getAvailableOrders);

// 3. Accept an Order (POST /api/driver/orders/accept)
router.route("/orders/accept").post(acceptOrder);

// 4. Update Order Status to picked_up / in_transit / delivered (POST /api/driver/orders/status)
router.route("/orders/status").post(updateOrderStatus);

module.exports = router;

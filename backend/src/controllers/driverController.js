const DriverLocation = require("../models/DriverLocation");
const Order = require("../models/deliveryModel");
const DeliveryHistory = require("../models/DeliveryHistory");
const BusinessRule = require("../models/BusinessRule");

// 1. Update Driver Location & Status (Called every 5 seconds)
exports.updateLocation = async (req, res) => {
  try {
    const { driver_id, lat, lng, driver_status } = req.body;

    // Upsert: Keeps only the latest location. Replaces old location.
    const location = await DriverLocation.findOneAndUpdate(
      { driver_id },
      { lat, lng, driver_status, recorded_at: new Date() },
      { new: true, upsert: true },
    );

    res
      .status(200)
      .json({ success: true, message: "Location updated", data: location });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Fetch Nearby Available Orders
exports.getAvailableOrders = async (req, res) => {
  try {
    const { vehicle_type } = req.query;

    // Find available orders matching the driver's vehicle type
    const orders = await Order.find({
      status: "available",
      vehicle_type: vehicle_type,
    }).sort({ created_at: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Accept/Confirm an Order
exports.acceptOrder = async (req, res) => {
  try {
    const { order_id, driver_id } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: order_id, status: "available" },
      { driver_id, status: "assigned" },
      { new: true },
    );

    if (!order)
      return res
        .status(400)
        .json({ success: false, message: "Order already taken or invalid" });

    res.status(200).json({
      success: true,
      message: "Order accepted successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Update Order Status (Assigned -> Picked Up -> Delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    if (status === "delivered") {
      // 1. Fetch the active order (which ALREADY has the total_cost)
      const order = await Order.findById(order_id);
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });

      // 2. Fetch the dynamic business rules just to get the cut percentages
      const rule = await BusinessRule.findOne({
        vehicle_type: order.vehicle_type,
      });
      if (!rule) {
        return res.status(400).json({
          success: false,
          message: "Pricing rule not found for this vehicle type",
        });
      }

      // 3. Calculate strictly the Driver & Platform cuts based on order.total_cost
      const driverEarnings = (order.total_cost * rule.driver_cut_percent) / 100;
      const platformEarnings =
        (order.total_cost * rule.platform_cut_percent) / 100;

      // 4. Move to Delivery History
      // ParseFloat is used with toFixed(2) to ensure clean 2-decimal numbers in MongoDB
      const historyRecord = new DeliveryHistory({
        order_id: order._id,
        user_id: order.user_id,
        driver_id: order.driver_id,
        final_status: "delivered",
        total_cost: order.total_cost, // Keep the exact cost generated at order creation
        driver_earnings: parseFloat(driverEarnings.toFixed(2)),
        platform_earnings: parseFloat(platformEarnings.toFixed(2)),
        completed_at: new Date(),
      });
      await historyRecord.save();

      // 5. Remove from Active Orders collection
      await Order.findByIdAndDelete(order_id);

      return res.status(200).json({
        success: true,
        message: "Order delivered & archived",
        data: historyRecord,
      });
    } else {
      // Just update the status normally (e.g., 'picked_up', 'in_transit')
      const updatedOrder = await Order.findByIdAndUpdate(
        order_id,
        { status },
        { new: true },
      );
      return res.status(200).json({
        success: true,
        message: `Status updated to ${status}`,
        data: updatedOrder,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

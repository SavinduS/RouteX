const DriverLocation = require("../models/DriverLocation");
const Order = require("../models/deliveryModel"); // Ensure this is the correct path to your Order model
const DeliveryHistory = require("../models/DeliveryHistory");
const BusinessRule = require("../models/BusinessRule");
const User = require("../models/User"); // Path to User model
const sendEmail = require("../utils/sendEmail"); // Path to email utility

// 1. Update Driver Location & Status
exports.updateLocation = async (req, res) => {
  try {
    const { driver_id, lat, lng, driver_status } = req.body;
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
    res
      .status(200)
      .json({
        success: true,
        message: "Order accepted successfully",
        data: order,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Update Order Status & Send Emails (Assigned -> Picked Up -> Delivered)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    // ==========================================
    // STATUS: DELIVERED (Email Entrepreneur)
    // ==========================================
    if (status === "delivered") {
      const order = await Order.findById(order_id);
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });

      const rule = await BusinessRule.findOne({
        vehicle_type: order.vehicle_type,
      });
      if (!rule)
        return res
          .status(400)
          .json({ success: false, message: "Pricing rule not found" });

      const driverEarnings = (order.total_cost * rule.driver_cut_percent) / 100;
      const platformEarnings =
        (order.total_cost * rule.platform_cut_percent) / 100;

      const historyRecord = new DeliveryHistory({
        order_id: order._id,
        readable_order_id: order.order_id, // e.g. ODR-260227-001
        user_id: order.user_id,
        driver_id: order.driver_id,
        final_status: "delivered",
        total_cost: order.total_cost,
        driver_earnings: parseFloat(driverEarnings.toFixed(2)),
        platform_earnings: parseFloat(platformEarnings.toFixed(2)),
        completed_at: new Date(),
      });
      await historyRecord.save();
      await Order.findByIdAndDelete(order_id);

      // --- SEND EMAIL TO ENTREPRENEUR ---
      try {
        // Find Entrepreneur using the user_id saved in the Order
        const entrepreneur = await User.findById(order.user_id);

        if (entrepreneur && entrepreneur.email) {
          await sendEmail({
            email: entrepreneur.email, // e.g. "wishwadilshan628@gmail.com"
            subject: `Delivery Completed: Order ${order.order_id}`, // e.g. ODR-260227-001
            message: `Hello ${entrepreneur.full_name},\n\nGood news! Your package heading to ${order.dropoff_address} has been successfully delivered by our driver.\n\nTotal Cost: LKR ${order.total_cost}\n\nThank you for using RouteX!`,
          });
          console.log(
            `Delivered email sent to Entrepreneur: ${entrepreneur.email}`,
          );
        }
      } catch (emailError) {
        console.log(
          "Email to entrepreneur failed to send:",
          emailError.message,
        );
      }

      return res
        .status(200)
        .json({
          success: true,
          message: "Order delivered & archived",
          data: historyRecord,
        });
    }
    // ==========================================
    // STATUS: PICKED UP (Email End User)
    // ==========================================
    else {
      // Update the status in DB
      const updatedOrder = await Order.findByIdAndUpdate(
        order_id,
        { status },
        { new: true },
      );

      // If status is specifically "picked_up", email the receiver
      if (status === "picked_up") {
        try {
          if (updatedOrder.receiver_email) {
            await sendEmail({
              email: updatedOrder.receiver_email, // e.g. "sarath123@gmail.com"
              subject: `Your RouteX Package is on the way! (${updatedOrder.order_id})`,
              message: `Hello ${updatedOrder.receiver_name},\n\nYour package has just been picked up from ${updatedOrder.pickup_address} by our driver.\n\nIt is now on its way to you at ${updatedOrder.dropoff_address}.\n\nPlease be ready to receive it soon!\n\nThank you,\nRouteX Team`,
            });
            console.log(
              `Picked up email sent to End User: ${updatedOrder.receiver_email}`,
            );
          }
        } catch (emailError) {
          console.log("Email to end user failed to send:", emailError.message);
        }
      }

      return res
        .status(200)
        .json({
          success: true,
          message: `Status updated to ${status}`,
          data: updatedOrder,
        });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

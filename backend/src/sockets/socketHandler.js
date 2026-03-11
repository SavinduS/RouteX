const DriverLocation = require("../models/DriverLocation");
const Order = require("../models/deliveryModel");
const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected to sockets:", socket.id);

    // Driver joins their own room when they start service
    socket.on("driver_go_online", async (data) => {
      try {
        const { driver_id } = data;

        const driverRoom = `driver:${driver_id}`;
        socket.join(driverRoom);

        await DriverLocation.findOneAndUpdate(
          { driver_id },
          {
            driver_status: "online",
            recorded_at: new Date(),
          },
          { upsert: true, new: true },
        );

        console.log(`Driver ${driver_id} joined room ${driverRoom}`);
      } catch (err) {
        console.error("driver_go_online error:", err.message);
      }
    });

    // Customer joins a specific driver's room
    socket.on("join_driver_room", async (data) => {
      try {
        const { driver_id, user_id } = data;

        const order = await Order.findOne({
          driver_id: driver_id,
          user_id: user_id,
          status: { $in: ["assigned", "picked_up", "in_transit"] },
        });

        if (!order) {
          console.log("Unauthorized room join attempt");
          return;
        }

        const driverRoom = `driver:${driver_id}`;
        socket.join(driverRoom);

        console.log(`Customer ${user_id} joined ${driverRoom}`);
      } catch (err) {
        console.error("join_driver_room error:", err.message);
      }
    });

    // Admin joins admin room to watch all drivers
    socket.on("join_admin_room", async (data) => {
      try {
        const { user_id } = data;

        if (!user_id) {
          return socket.emit("join_error", { message: "user_id is required" });
        }

        const user = await User.findById(user_id);

        if (!user || user.role !== "admin") {
          console.log("Unauthorized admin room join attempt");
          return socket.emit("join_error", {
            message: "Unauthorized admin access",
          });
        }

        socket.join("admins");
        console.log(`Admin socket ${socket.id} joined admins room`);
        socket.emit("join_success", { message: "Joined admins room" });
      } catch (err) {
        console.error("join_admin_room error:", err.message);
        socket.emit("join_error", { message: "Server error" });
      }
    });

    // Driver sends live location
    socket.on("driver_live_location", async (data) => {
      try {
        console.log("driver_live_location received:", data);

        const {
          driver_id,
          lat,
          lng,
          active_order_ids = [],
          driver_status = "online",
        } = data;

        const driverRoom = `driver:${driver_id}`;

        // Send to all customers tracking this driver
        io.to(driverRoom).emit("update_live_location", {
          driver_id,
          lat,
          lng,
          active_order_ids,
          driver_status,
          recorded_at: new Date(),
        });

        // Send to admin dashboard
        io.to("admins").emit("admin_driver_location_update", {
          driver_id,
          lat,
          lng,
          active_order_ids,
          driver_status,
          recorded_at: new Date(),
        });

        console.log(`Sent update to room ${driverRoom} and admins`);

        await DriverLocation.findOneAndUpdate(
          { driver_id },
          {
            lat,
            lng,
            active_order_ids,
            driver_status,
            recorded_at: new Date(),
          },
          { upsert: true, new: true },
        );

        console.log("Location saved to DB");
      } catch (err) {
        console.error("Failed to save location to DB:", err.message);
      }
    });

    socket.on("driver_go_offline", async (data) => {
      try {
        const { driver_id } = data;

        await DriverLocation.findOneAndUpdate(
          { driver_id },
          {
            driver_status: "offline",
            recorded_at: new Date(),
          },
          { new: true },
        );

        io.to("admins").emit("admin_driver_status_update", {
          driver_id,
          driver_status: "offline",
          recorded_at: new Date(),
        });

        console.log(`Driver ${driver_id} is now offline`);
      } catch (err) {
        console.error("driver_go_offline error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

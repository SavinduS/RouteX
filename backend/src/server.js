const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const { initNotification } = require("./utils/notificationService");
const socketHandler = require("./sockets/socketHandler");

// Configuration
dotenv.config();

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const PORT = process.env.PORT || 5003;

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize notification service
initNotification(io);

// Initialize other socket handlers
socketHandler(io);

// Basic socket connection log
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/inquiries", require("./routes/inquiryRoutes"));
app.use("/api/deliveries", require("./routes/deliveryRoutes"));
app.use("/api/orders", require("./routes/deliveryRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// Basic Route
app.get("/", (req, res) => {
  res.send("RouteX Backend API is Running...");
});

// Database Connection and Server Start
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB Connected Successfully");
      server.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB Connection Failed:", err.message);
    });
}

module.exports = { app, server, io };
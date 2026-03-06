const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./sockets/socketHandler");

// Configuration
dotenv.config();
const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  }),
);

// Middleware
app.use(express.json()); // Body parser
app.use("/api/test", require("./routes/testRoutes"));

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

const inquiryRoutes = require("./routes/inquiryRoutes");
app.use("/api/inquiries", inquiryRoutes);

const deliveryRoutes = require("./routes/deliveryRoutes");
app.use("/api/deliveries", deliveryRoutes);

const driverRoutes = require("./routes/driverRoutes");
app.use("/api/driver", driverRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("RouteX Backend API is Running...");
});

// 1. Initialize Socket.io on the server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// 2. Pass the 'io' object to your separate file
socketHandler(io);

// Database Connection and Server Start
const PORT = process.env.PORT || 5003;
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

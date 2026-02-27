const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Configuration
dotenv.config();
const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  })
);

// Middleware
app.use(cors());
app.use(express.json()); // Body parser (JSON data කියවන්න)
app.use("/api/test", require("./routes/testRoutes"));

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Basic Route (වැඩද කියලා බලන්න)
app.get("/", (req, res) => {
  res.send("RouteX Backend API is Running...");
});

// Database Connection
const PORT = process.env.PORT || 5003;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
  });

// API Routes
const deliveryRoutes = require("./routes/deliveryRoutes");
app.use("/api/deliveries", deliveryRoutes);

const driverRoutes = require("./routes/driverRoutes");
app.use("/api/driver", driverRoutes);

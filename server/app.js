// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit"); // ✅ new import

const app = express();

// ======================
// 📌 Middleware
// ======================
app.use(cors());
app.use(express.json());

const path = require("path");
// serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Apply global rate limiter (30 requests per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // limit each IP to 30 requests per minute
  message: { message: "Too many requests, please try again later." },
});
app.use(limiter);

// ======================
// 📌 Routes
// ======================
app.get("/", (req, res) => res.send("RAG Platform API is running"));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const universityRoutes = require("./routes/universities");
app.use("/api/universities", universityRoutes);

const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const analyticsRoutes = require("./routes/analytics");
app.use("/api/analytics", analyticsRoutes);

// ======================
// 📌 Database connection
// ======================
// --- NEW SOCKET.IO & HTTP SERVER SETUP ---
const http = require("http");
const { Server } = require("socket.io");

// Create an HTTP server from our Express app
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"],
  },
});

// Make the 'io' object accessible to our routes
app.set("socketio", io);

io.on("connection", (socket) => {
  console.log("A user connected with socket.io");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ragdb";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Start the new HTTP server
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));

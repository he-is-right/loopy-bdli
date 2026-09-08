// ==========================================
// MAIN APPLICATION ENTRY POINT (app.js)
// ==========================================

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// 1. Load Environment Variables from .env file
dotenv.config();

// 2. Connect to Database (MongoDB)
connectDB();

const app = express();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

// Parse incoming JSON payloads (Body Parser)
app.use(express.json());

// Custom Logger Middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} request to ${req.url}`);
  next();
};
app.use(logger);

// Serve static frontend files
const path = require("path");
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.static(__dirname));

// Simple CORS middleware for browser client interactions
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// ROUTE MOUNTING
// ==========================================
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");

// Mount Authentication routes under /api/auth
app.use("/api/auth", authRoutes);

// Mount Restaurant routes under /api/restaurants
app.use("/api/restaurants", restaurantRoutes);

// API Information route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to BDLI Loopy API - Module 8 Authentication & Database Integration",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me (Protected)",
      },
      restaurants: {
        getAll: "GET /api/restaurants",
        getOne: "GET /api/restaurants/:id",
        create: "POST /api/restaurants (Protected)",
        update: "PUT /api/restaurants/:id (Protected)",
        delete: "DELETE /api/restaurants/:id (Protected)",
      },
    },
  });
});


// ==========================================
// 404 NOT FOUND & ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on this server.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

module.exports = app;

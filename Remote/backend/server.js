require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/database");
const {
  securityHeaders,
  corsOptions,
  generalLimiter,
  sanitizeInput,
  securityLogger,
} = require("./middleware/security");

// Import routes
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const screenshotRoutes = require("./routes/screenshots");
const managerApprovalRoutes = require("./routes/managerApproval");
const emailRoutes = require("./routes/email");
const databaseRoutes = require("./routes/database");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(securityLogger);
app.use(sanitizeInput);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/screenshots", screenshotRoutes);
app.use("/api/manager", managerApprovalRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/database", databaseRoutes);

// Basic API info endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Productivity Tracker API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      health: "/health",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // CORS error
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
    });
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticate } = require("../middleware/auth");
const Screenshot = require("../models/Screenshot");

const router = express.Router();

// Configure multer for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/screenshots");

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const userId = req.user.id;
    const extension = path.extname(file.originalname) || ".jpg";
    const filename = `screenshot_${userId}_${timestamp}${extension}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * @route POST /api/screenshots/upload
 * @desc Upload a screenshot
 * @access Private
 */
router.post(
  "/upload",
  authenticate,
  upload.single("screenshot"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No screenshot file provided",
        });
      }

      // Create screenshot record in database
      const screenshot = new Screenshot({
        userId: req.user.id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        source: req.body.source || "browser", // 'browser' or 'desktop'
        timestamp: req.body.timestamp
          ? new Date(req.body.timestamp)
          : new Date(),
        metadata: {
          userAgent: req.headers["user-agent"],
          ip: req.ip,
          captureMethod: req.body.source || "browser",
        },
      });

      await screenshot.save();

      res.status(201).json({
        success: true,
        message: "Screenshot uploaded successfully",
        data: {
          id: screenshot._id,
          filename: screenshot.filename,
          timestamp: screenshot.timestamp,
          source: screenshot.source,
        },
      });
    } catch (error) {
      console.error("Screenshot upload error:", error);

      // Clean up uploaded file if database save failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload screenshot",
        error: error.message,
      });
    }
  }
);

/**
 * @route GET /api/screenshots
 * @desc Get screenshots for current user or all users (managers only)
 * @access Private
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, startDate, endDate } = req.query;

    // Build query
    let query = {};

    // If not manager, only show own screenshots
    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    } else if (userId) {
      // Manager can filter by specific user
      query.userId = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const screenshots = await Screenshot.find(query)
      .populate("userId", "firstName lastName email")
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-filePath"); // Don't expose file paths

    const total = await Screenshot.countDocuments(query);

    res.json({
      success: true,
      data: {
        screenshots,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get screenshots error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve screenshots",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/screenshots/:id
 * @desc Get specific screenshot file
 * @access Private
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const screenshot = await Screenshot.findById(req.params.id);

    if (!screenshot) {
      return res.status(404).json({
        success: false,
        message: "Screenshot not found",
      });
    }

    // Check permissions
    if (
      req.user.role !== "manager" &&
      screenshot.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Check if file exists
    if (!fs.existsSync(screenshot.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Screenshot file not found",
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", screenshot.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${screenshot.filename}"`
    );

    // Send file
    res.sendFile(path.resolve(screenshot.filePath));
  } catch (error) {
    console.error("Get screenshot error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve screenshot",
      error: error.message,
    });
  }
});

/**
 * @route DELETE /api/screenshots/:id
 * @desc Delete a screenshot
 * @access Private (Manager only)
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only managers can delete screenshots",
      });
    }

    const screenshot = await Screenshot.findById(req.params.id);

    if (!screenshot) {
      return res.status(404).json({
        success: false,
        message: "Screenshot not found",
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(screenshot.filePath)) {
      fs.unlinkSync(screenshot.filePath);
    }

    // Delete from database
    await Screenshot.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Screenshot deleted successfully",
    });
  } catch (error) {
    console.error("Delete screenshot error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete screenshot",
      error: error.message,
    });
  }
});

/**
 * @route GET /api/screenshots/stats/summary
 * @desc Get screenshot statistics
 * @access Private
 */
router.get("/stats/summary", authenticate, async (req, res) => {
  try {
    const { userId, days = 7 } = req.query;

    // Build query
    let query = {
      timestamp: {
        $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      },
    };

    // If not manager, only show own stats
    if (req.user.role !== "manager") {
      query.userId = req.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    const stats = await Screenshot.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalScreenshots: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          avgSize: { $avg: "$fileSize" },
          sources: { $push: "$source" },
        },
      },
    ]);

    const result = stats[0] || {
      totalScreenshots: 0,
      totalSize: 0,
      avgSize: 0,
      sources: [],
    };

    // Count by source
    const sourceCounts = result.sources.reduce((acc, source) => {
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalScreenshots: result.totalScreenshots,
        totalSize: result.totalSize,
        averageSize: Math.round(result.avgSize || 0),
        sourceCounts,
        period: `${days} days`,
      },
    });
  } catch (error) {
    console.error("Screenshot stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve screenshot statistics",
      error: error.message,
    });
  }
});

module.exports = router;

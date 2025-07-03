const mongoose = require("mongoose");

/**
 * Screenshot Model
 * Stores metadata for captured screenshots from browser or desktop
 */
const screenshotSchema = new mongoose.Schema(
  {
    // User who took the screenshot
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // File information
    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
      default: "image/jpeg",
    },

    // Capture information
    source: {
      type: String,
      enum: ["browser", "desktop", "manual"],
      default: "browser",
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Analysis and metadata
    metadata: {
      userAgent: String,
      ip: String,
      captureMethod: String,
      screenResolution: String,
      windowTitle: String,
    },

    // Analysis results (for future AI analysis)
    analysis: {
      isAnalyzed: {
        type: Boolean,
        default: false,
      },

      productivityScore: {
        type: Number,
        min: 0,
        max: 100,
      },

      categories: [
        {
          type: String,
          enum: ["productive", "neutral", "distracting", "break"],
        },
      ],

      applications: [String],

      websites: [String],

      textContent: String, // OCR extracted text

      analysisTimestamp: Date,
    },

    // Status and flags
    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    tags: [String],

    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
screenshotSchema.index({ userId: 1, timestamp: -1 });
screenshotSchema.index({ source: 1, timestamp: -1 });
screenshotSchema.index({ "analysis.isAnalyzed": 1 });
screenshotSchema.index({ isActive: 1, isDeleted: 1 });

// Virtual for file URL (don't expose actual file path)
screenshotSchema.virtual("fileUrl").get(function () {
  return `/api/screenshots/${this._id}`;
});

// Virtual for formatted file size
screenshotSchema.virtual("formattedSize").get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
});

// Virtual for time ago
screenshotSchema.virtual("timeAgo").get(function () {
  const now = new Date();
  const diff = now - this.timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "Just now";
});

// Static method to get user statistics
screenshotSchema.statics.getUserStats = async function (userId, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalScreenshots: { $sum: 1 },
        totalSize: { $sum: "$fileSize" },
        avgProductivityScore: { $avg: "$analysis.productivityScore" },
        sources: { $push: "$source" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalScreenshots: 0,
      totalSize: 0,
      avgProductivityScore: null,
      sources: [],
    }
  );
};

// Static method to get daily activity
screenshotSchema.statics.getDailyActivity = async function (userId, days = 7) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
        },
        count: { $sum: 1 },
        avgScore: { $avg: "$analysis.productivityScore" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);
};

// Instance method to analyze screenshot (placeholder for future AI integration)
screenshotSchema.methods.analyzeContent = async function () {
  // Placeholder for AI analysis
  // This would integrate with image recognition APIs

  this.analysis.isAnalyzed = true;
  this.analysis.analysisTimestamp = new Date();

  // Mock analysis for now
  this.analysis.productivityScore = Math.floor(Math.random() * 100);
  this.analysis.categories = ["productive"]; // Mock category

  await this.save();
  return this.analysis;
};

// Pre-save middleware
screenshotSchema.pre("save", function (next) {
  // Set default values
  if (!this.timestamp) {
    this.timestamp = new Date();
  }

  next();
});

// Pre-remove middleware to clean up files
screenshotSchema.pre("remove", function (next) {
  const fs = require("fs");

  // Delete physical file when document is removed
  if (this.filePath && fs.existsSync(this.filePath)) {
    try {
      fs.unlinkSync(this.filePath);
    } catch (error) {
      console.error("Error deleting screenshot file:", error);
    }
  }

  next();
});

module.exports = mongoose.model("Screenshot", screenshotSchema);

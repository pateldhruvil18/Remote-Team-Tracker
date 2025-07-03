const mongoose = require("mongoose");

const timeEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    type: {
      type: String,
      enum: ["manual", "pomodoro", "automatic"],
      required: [true, "Time entry type is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    duration: {
      type: Number, // in milliseconds
      min: [0, "Duration cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isPaused: {
      type: Boolean,
      default: false,
    },
    pausedDuration: {
      type: Number,
      default: 0, // in milliseconds
    },
    pomodoroSession: {
      sessionNumber: {
        type: Number,
        default: 0,
      },
      isBreak: {
        type: Boolean,
        default: false,
      },
      breakType: {
        type: String,
        enum: ["short", "long"],
        default: null,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
    productivity: {
      score: {
        type: Number,
        min: [0, "Productivity score cannot be negative"],
        max: [100, "Productivity score cannot exceed 100"],
        default: 0,
      },
      focusTime: {
        type: Number,
        default: 0, // in milliseconds
      },
      distractionCount: {
        type: Number,
        default: 0,
      },
    },
    screenshots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Screenshot",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
timeEntrySchema.index({ user: 1, startTime: -1 });
timeEntrySchema.index({ task: 1 });
timeEntrySchema.index({ type: 1 });
timeEntrySchema.index({ isActive: 1 });

// Virtual for actual duration (excluding paused time)
timeEntrySchema.virtual("actualDuration").get(function () {
  if (!this.duration) return 0;
  return Math.max(0, this.duration - this.pausedDuration);
});

// Virtual for formatted duration
timeEntrySchema.virtual("formattedDuration").get(function () {
  const duration = this.actualDuration;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours
    .toString()
    .padStart(
      2,
      "0"
    )}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

// Method to start time tracking
timeEntrySchema.methods.start = function () {
  this.isActive = true;
  this.isPaused = false;
  if (!this.startTime) {
    this.startTime = new Date();
  }
  return this;
};

// Method to pause time tracking
timeEntrySchema.methods.pause = function () {
  if (this.isActive && !this.isPaused) {
    this.isPaused = true;
    this.pauseStartTime = new Date();
  }
  return this;
};

// Method to resume time tracking
timeEntrySchema.methods.resume = function () {
  if (this.isActive && this.isPaused && this.pauseStartTime) {
    this.isPaused = false;
    this.pausedDuration += new Date() - this.pauseStartTime;
    delete this.pauseStartTime;
  }
  return this;
};

// Method to stop time tracking
timeEntrySchema.methods.stop = function () {
  if (this.isActive) {
    this.isActive = false;
    this.endTime = new Date();

    if (this.isPaused && this.pauseStartTime) {
      this.pausedDuration += new Date() - this.pauseStartTime;
      delete this.pauseStartTime;
    }

    this.duration = this.endTime - this.startTime;
    this.isPaused = false;
  }
  return this;
};

// Pre-save middleware to calculate duration
timeEntrySchema.pre("save", function (next) {
  if (this.endTime && this.startTime && !this.duration) {
    this.duration = this.endTime - this.startTime;
  }
  next();
});

module.exports = mongoose.model("TimeEntry", timeEntrySchema);

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task assignee is required"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task creator is required"],
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    estimatedHours: {
      type: Number,
      min: [0, "Estimated hours cannot be negative"],
      max: [100, "Estimated hours cannot exceed 100"],
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, "Actual hours cannot be negative"],
    },
    dueDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    position: {
      type: Number,
      default: 0,
    },
    pomodoroCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ team: 1, status: 1 });
taskSchema.index({ creator: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ position: 1 });

// Virtual for completion percentage
taskSchema.virtual("completionPercentage").get(function () {
  if (this.status === "done") return 100;
  if (this.status === "review") return 90;
  if (this.status === "in_progress") return 50;
  return 0;
});

// Virtual for overdue status
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "done") return false;
  return new Date() > this.dueDate;
});

// Method to add comment
taskSchema.methods.addComment = function (userId, content) {
  this.comments.push({
    user: userId,
    content: content,
    createdAt: new Date(),
  });
  return this;
};

// Method to update status
taskSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;

  if (newStatus === "done") {
    this.completedDate = new Date();
  } else if (newStatus === "in_progress" && !this.startDate) {
    this.startDate = new Date();
  }

  return this;
};

// Pre-save middleware to update actual hours
taskSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    this.status === "done" &&
    !this.completedDate
  ) {
    this.completedDate = new Date();
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);

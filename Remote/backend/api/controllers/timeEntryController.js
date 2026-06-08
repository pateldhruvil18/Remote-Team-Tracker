const { TimeEntry, Task } = require("../models");

/**
 * Create a new time entry (pomodoro, manual, or automatic)
 */
const createTimeEntry = async (req, res) => {
  try {
    const {
      type,
      startTime,
      endTime,
      task,
      description,
      pomodoroSession,
      productivity,
      tags
    } = req.body;

    const timeEntry = new TimeEntry({
      user: req.user.id,
      type,
      startTime: startTime ? new Date(startTime) : new Date(),
      endTime: endTime ? new Date(endTime) : undefined,
      task: task || null,
      description,
      pomodoroSession: pomodoroSession || undefined,
      productivity: productivity || undefined,
      tags
    });

    // If start and end times are both present, pre-calculate duration
    if (timeEntry.startTime && timeEntry.endTime) {
      timeEntry.duration = timeEntry.endTime - timeEntry.startTime;
    }

    await timeEntry.save();

    // If task exists, link or update task pomodoroCount
    if (task && type === "pomodoro" && pomodoroSession?.completed) {
      await Task.findByIdAndUpdate(task, {
        $inc: { pomodoroCount: 1 }
      });
    }

    res.status(201).json({
      success: true,
      message: "Time entry created successfully",
      data: timeEntry
    });
  } catch (error) {
    console.error("Create time entry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create time entry",
      error: error.message
    });
  }
};

/**
 * Get all time entries for the authenticated user
 */
const getTimeEntries = async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const timeEntries = await TimeEntry.find(query)
      .populate("task", "title status priority")
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TimeEntry.countDocuments(query);

    res.json({
      success: true,
      data: {
        timeEntries,
        pagination: {
          total,
          limit: parseInt(limit),
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("Get time entries error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve time entries",
      error: error.message
    });
  }
};

module.exports = {
  createTimeEntry,
  getTimeEntries
};

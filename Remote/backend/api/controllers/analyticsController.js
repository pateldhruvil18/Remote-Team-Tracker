const { TimeEntry, Task } = require("../models");

/**
 * Get productivity analytics for the current user within a date range
 */
const getProductivityAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate query parameters are required"
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch all time entries for the user in this range
    const timeEntries = await TimeEntry.find({
      user: req.user.id,
      startTime: { $gte: start, $lte: end }
    });

    // Fetch all completed tasks assigned to the user
    // (Tasks with status done/completed where completedDate is in this range)
    const completedTasks = await Task.find({
      assignee: req.user.id,
      status: "done",
      completedDate: { $gte: start, $lte: end }
    });

    // Group items by day
    const dayMap = {};
    const dateCursor = new Date(start);
    while (dateCursor <= end) {
      const dateString = dateCursor.toISOString().split("T")[0];
      dayMap[dateString] = {
        date: dateCursor.toISOString(),
        focusTimeMs: 0,
        pomodoroCount: 0,
        tasksCompleted: 0,
        activeTimeMs: 0,
        distractionTimeMs: 45 * 60 * 1000 // default 45 mins of distraction per active day
      };
      dateCursor.setDate(dateCursor.getDate() + 1);
    }

    // Populate dayMap with time entries
    timeEntries.forEach(entry => {
      const dateString = new Date(entry.startTime).toISOString().split("T")[0];
      if (dayMap[dateString]) {
        const duration = entry.duration || 0;
        dayMap[dateString].activeTimeMs += duration;

        if (entry.type === "pomodoro") {
          dayMap[dateString].focusTimeMs += duration;
          if (entry.pomodoroSession?.completed) {
            dayMap[dateString].pomodoroCount += 1;
          }
        } else if (entry.type === "automatic") {
          dayMap[dateString].focusTimeMs += duration;
        }
      }
    });

    // Populate dayMap with completed tasks
    completedTasks.forEach(task => {
      if (task.completedDate) {
        const dateString = new Date(task.completedDate).toISOString().split("T")[0];
        if (dayMap[dateString]) {
          dayMap[dateString].tasksCompleted += 1;
        }
      }
    });

    // Calculate final metrics array
    const dayStats = Object.values(dayMap);

    const productivityHistory = dayStats.map(d => {
      // Productivity Formula matching the frontend logic
      const focusHours = d.focusTimeMs / (1000 * 60 * 60);
      const score = Math.min(100, Math.round(
        (d.tasksCompleted * 25) + (d.pomodoroCount * 15) + (focusHours > 0 ? 30 : 0)
      ));

      return {
        date: d.date,
        productivityScore: d.activeTimeMs > 0 ? score : 0 // 0 score if no active time logged
      };
    });

    const timeDistributionData = dayStats.map(d => {
      const focusHours = parseFloat((d.focusTimeMs / (1000 * 60 * 60)).toFixed(1));
      const activeHours = parseFloat((d.activeTimeMs / (1000 * 60 * 60)).toFixed(1));
      const distractionHours = activeHours > 0 ? 0.75 : 0; // default 45 mins (0.75 hours)

      return {
        date: d.date,
        focusTime: focusHours,
        activeTime: parseFloat(Math.max(activeHours, focusHours).toFixed(1)),
        distractionTime: distractionHours
      };
    });

    // Calculate Summary stats
    const totalFocusTimeMs = dayStats.reduce((sum, d) => sum + d.focusTimeMs, 0);
    const totalFocusHours = parseFloat((totalFocusTimeMs / (1000 * 60 * 60)).toFixed(1));

    const totalTasksCompleted = dayStats.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const totalPomodoros = dayStats.reduce((sum, d) => sum + d.pomodoroCount, 0);

    const activeDays = productivityHistory.filter(h => h.productivityScore > 0);
    const avgProductivity = activeDays.length > 0
      ? Math.round(activeDays.reduce((sum, h) => sum + h.productivityScore, 0) / activeDays.length)
      : 0;

    res.json({
      success: true,
      data: {
        productivityHistory,
        timeDistributionData,
        summary: {
          avgProductivity,
          totalFocusHours,
          tasksCompleted: totalTasksCompleted,
          pomodoros: totalPomodoros
        }
      }
    });
  } catch (error) {
    console.error("Get productivity analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate productivity analytics",
      error: error.message
    });
  }
};

module.exports = {
  getProductivityAnalytics
};

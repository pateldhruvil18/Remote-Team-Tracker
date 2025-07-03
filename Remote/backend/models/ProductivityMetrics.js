const mongoose = require('mongoose');

const productivityMetricsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: [true, 'Period is required']
  },
  timeTracking: {
    totalTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    activeTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    idleTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    focusTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    breakTime: {
      type: Number,
      default: 0 // in milliseconds
    }
  },
  pomodoro: {
    sessionsCompleted: {
      type: Number,
      default: 0
    },
    sessionsStarted: {
      type: Number,
      default: 0
    },
    totalFocusTime: {
      type: Number,
      default: 0 // in milliseconds
    },
    averageSessionLength: {
      type: Number,
      default: 0 // in milliseconds
    },
    completionRate: {
      type: Number,
      default: 0 // percentage
    }
  },
  tasks: {
    created: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    overdue: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0 // percentage
    },
    averageCompletionTime: {
      type: Number,
      default: 0 // in milliseconds
    }
  },
  productivity: {
    overallScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    timeScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    focusScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    taskScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    },
    consistencyScore: {
      type: Number,
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
      default: 0
    }
  },
  activity: {
    screenshotsTaken: {
      type: Number,
      default: 0
    },
    applicationsUsed: [{
      name: String,
      timeSpent: Number, // in milliseconds
      category: {
        type: String,
        enum: ['productive', 'neutral', 'distracting'],
        default: 'neutral'
      }
    }],
    websitesVisited: [{
      domain: String,
      timeSpent: Number, // in milliseconds
      category: {
        type: String,
        enum: ['productive', 'neutral', 'distracting'],
        default: 'neutral'
      }
    }],
    keystrokes: {
      type: Number,
      default: 0
    },
    mouseClicks: {
      type: Number,
      default: 0
    }
  },
  goals: {
    dailyHoursTarget: {
      type: Number,
      default: 8
    },
    dailyHoursActual: {
      type: Number,
      default: 0
    },
    pomodoroTarget: {
      type: Number,
      default: 16
    },
    pomodoroActual: {
      type: Number,
      default: 0
    },
    tasksTarget: {
      type: Number,
      default: 5
    },
    tasksActual: {
      type: Number,
      default: 0
    }
  },
  trends: {
    compared_to_previous: {
      productivity_change: {
        type: Number,
        default: 0 // percentage change
      },
      time_change: {
        type: Number,
        default: 0 // percentage change
      },
      focus_change: {
        type: Number,
        default: 0 // percentage change
      }
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
productivityMetricsSchema.index({ user: 1, date: -1 });
productivityMetricsSchema.index({ team: 1, date: -1 });
productivityMetricsSchema.index({ user: 1, period: 1, date: -1 });
productivityMetricsSchema.index({ date: -1, period: 1 });

// Virtual for productivity grade
productivityMetricsSchema.virtual('productivityGrade').get(function() {
  const score = this.productivity.overallScore;
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
});

// Virtual for goal achievement percentage
productivityMetricsSchema.virtual('goalAchievement').get(function() {
  const goals = this.goals;
  let totalGoals = 0;
  let achievedGoals = 0;
  
  if (goals.dailyHoursTarget > 0) {
    totalGoals++;
    if (goals.dailyHoursActual >= goals.dailyHoursTarget) achievedGoals++;
  }
  
  if (goals.pomodoroTarget > 0) {
    totalGoals++;
    if (goals.pomodoroActual >= goals.pomodoroTarget) achievedGoals++;
  }
  
  if (goals.tasksTarget > 0) {
    totalGoals++;
    if (goals.tasksActual >= goals.tasksTarget) achievedGoals++;
  }
  
  return totalGoals > 0 ? (achievedGoals / totalGoals) * 100 : 0;
});

// Method to calculate overall productivity score
productivityMetricsSchema.methods.calculateProductivityScore = function() {
  const weights = {
    time: 0.3,
    focus: 0.3,
    task: 0.25,
    consistency: 0.15
  };
  
  this.productivity.overallScore = 
    (this.productivity.timeScore * weights.time) +
    (this.productivity.focusScore * weights.focus) +
    (this.productivity.taskScore * weights.task) +
    (this.productivity.consistencyScore * weights.consistency);
  
  return this.productivity.overallScore;
};

// Method to update time score based on active time vs target
productivityMetricsSchema.methods.calculateTimeScore = function() {
  const targetHours = this.goals.dailyHoursTarget;
  const actualHours = this.timeTracking.activeTime / (1000 * 60 * 60);
  
  if (targetHours === 0) {
    this.productivity.timeScore = 0;
    return 0;
  }
  
  const ratio = actualHours / targetHours;
  this.productivity.timeScore = Math.min(100, ratio * 100);
  
  return this.productivity.timeScore;
};

// Method to update focus score based on pomodoro completion
productivityMetricsSchema.methods.calculateFocusScore = function() {
  const targetPomodoros = this.goals.pomodoroTarget;
  const actualPomodoros = this.pomodoro.sessionsCompleted;
  
  if (targetPomodoros === 0) {
    this.productivity.focusScore = 0;
    return 0;
  }
  
  const completionRate = this.pomodoro.completionRate;
  const achievementRate = (actualPomodoros / targetPomodoros) * 100;
  
  // Combine completion rate and achievement rate
  this.productivity.focusScore = (completionRate * 0.6) + (Math.min(100, achievementRate) * 0.4);
  
  return this.productivity.focusScore;
};

// Method to update task score
productivityMetricsSchema.methods.calculateTaskScore = function() {
  const completionRate = this.tasks.completionRate;
  const targetTasks = this.goals.tasksTarget;
  const actualTasks = this.tasks.completed;
  
  if (targetTasks === 0) {
    this.productivity.taskScore = completionRate;
    return this.productivity.taskScore;
  }
  
  const achievementRate = Math.min(100, (actualTasks / targetTasks) * 100);
  
  // Combine completion rate and achievement rate
  this.productivity.taskScore = (completionRate * 0.7) + (achievementRate * 0.3);
  
  return this.productivity.taskScore;
};

// Static method to get user metrics for date range
productivityMetricsSchema.statics.getUserMetrics = function(userId, startDate, endDate, period = 'daily') {
  return this.find({
    user: userId,
    period: period,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

// Static method to get team metrics
productivityMetricsSchema.statics.getTeamMetrics = function(teamId, startDate, endDate, period = 'daily') {
  return this.find({
    team: teamId,
    period: period,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 });
};

module.exports = mongoose.model('ProductivityMetrics', productivityMetricsSchema);

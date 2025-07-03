import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import QuickStats from "./QuickStats";
import ScreenshotDebug from "./ScreenshotDebug";
import "./TeamMemberDashboard.css";

const TeamMemberDashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStats, setTodayStats] = useState({
    focusTime: 0,
    tasksCompleted: 0,
    pomodoroSessions: 0,
    productivity: 85,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "screenshot-monitoring":
        window.location.hash = "#screenshot-monitoring";
        break;
      default:
        break;
    }
  };

  return (
    <div className="team-member-dashboard">
      {/* Welcome Section with Navigation */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="user-info">
            <h1>Welcome back, {user?.firstName}! 👋</h1>
            <p>
              Ready to boost your productivity today? Let's make it count! 🚀
            </p>
            <div className="role-badge team-member">
              <span className="role-icon">👤</span>
              Team Member
            </div>
          </div>

          <div className="current-time">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)}</div>
          </div>
        </div>

        {/* Navigation Functions */}
        <div className="function-navigation">
          <button
            className="nav-function-btn screenshot-btn"
            onClick={() => handleQuickAction("screenshot-monitoring")}
          >
            <div className="nav-icon">📸</div>
            <div className="nav-content">
              <h3>Screenshot Monitoring</h3>
              <p>Track productivity</p>
            </div>
          </button>
        </div>
      </div>

      {/* Simple Dashboard Content */}
      <div className="dashboard-content">
        {/* Today's Overview */}
        <div className="overview-section">
          <QuickStats />
        </div>

        {/* Debug Tools (Temporary) */}
        <div className="debug-section">
          <ScreenshotDebug />
        </div>

        {/* Today's Performance Summary */}
        <div className="performance-summary">
          <h3>📊 Today's Performance</h3>
          <div className="summary-stats">
            <div className="summary-card">
              <div className="summary-icon">⏰</div>
              <div className="summary-info">
                <div className="summary-value">{todayStats.focusTime}h</div>
                <div className="summary-label">Focus Time</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <div className="summary-info">
                <div className="summary-value">{todayStats.tasksCompleted}</div>
                <div className="summary-label">Tasks Done</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">🍅</div>
              <div className="summary-info">
                <div className="summary-value">
                  {todayStats.pomodoroSessions}
                </div>
                <div className="summary-label">Pomodoros</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-info">
                <div className="summary-value">{todayStats.productivity}%</div>
                <div className="summary-label">Productivity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="goals-summary">
          <h3>🎯 Today's Goals</h3>
          <div className="goals-list">
            <div className="goal-item">
              <span className="goal-text">Complete 8 Pomodoro sessions</span>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: "62.5%" }}
                  ></div>
                </div>
                <span className="progress-text">5/8</span>
              </div>
            </div>

            <div className="goal-item">
              <span className="goal-text">Finish 5 tasks</span>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "40%" }}></div>
                </div>
                <span className="progress-text">2/5</span>
              </div>
            </div>

            <div className="goal-item">
              <span className="goal-text">4 hours of focused work</span>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "80%" }}></div>
                </div>
                <span className="progress-text">3.2/4h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;

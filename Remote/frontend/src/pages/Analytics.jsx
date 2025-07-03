import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import ProductivityChart from "../components/ProductivityChart";
import TimeDistribution from "../components/TimeDistribution";

import "./Analytics.css";

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("week");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real app, this would come from API
      const mockData = generateMockAnalytics();
      setAnalytics(mockData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = () => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 1;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split("T")[0],
        productivityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        focusTime: Math.floor(Math.random() * 4) + 4, // 4-8 hours
        activeTime: Math.floor(Math.random() * 2) + 6, // 6-8 hours
        tasksCompleted: Math.floor(Math.random() * 8) + 2, // 2-10 tasks
        screenshotsTaken: Math.floor(Math.random() * 50) + 80, // 80-130 screenshots
        distractionTime: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
      });
    }

    return {
      dailyData: data,
      summary: {
        avgProductivity: Math.floor(
          data.reduce((sum, d) => sum + d.productivityScore, 0) / data.length
        ),
        totalFocusTime: data.reduce((sum, d) => sum + d.focusTime, 0),
        totalTasksCompleted: data.reduce((sum, d) => sum + d.tasksCompleted, 0),
        totalScreenshots: data.reduce((sum, d) => sum + d.screenshotsTaken, 0),
        mostProductiveDay: data.reduce((max, d) =>
          d.productivityScore > max.productivityScore ? d : max
        ),
        trends: {
          productivity: Math.random() > 0.5 ? "up" : "down",
          focusTime: Math.random() > 0.5 ? "up" : "down",
          tasks: Math.random() > 0.5 ? "up" : "down",
        },
      },
    };
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      default:
        return "This Week";
    }
  };

  const getTrendIcon = (trend) => {
    return trend === "up" ? "📈" : "📉";
  };

  const getTrendColor = (trend) => {
    return trend === "up" ? "#48bb78" : "#e53e3e";
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <Header />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <Header />

      <main className="analytics-content">
        <div className="analytics-header">
          <div className="header-left">
            <h1>📊 Analytics Dashboard</h1>
            <p>Track your productivity patterns and insights</p>
          </div>

          <div className="time-range-selector">
            {["day", "week", "month"].map((range) => (
              <button
                key={range}
                className={`range-btn ${timeRange === range ? "active" : ""}`}
                onClick={() => setTimeRange(range)}
              >
                {range === "day"
                  ? "Today"
                  : range === "week"
                  ? "Week"
                  : "Month"}
              </button>
            ))}
          </div>
        </div>

        <div className="analytics-summary">
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <div className="summary-value">
                {analytics.summary.avgProductivity}%
              </div>
              <div className="summary-label">Avg Productivity</div>
              <div
                className="summary-trend"
                style={{
                  color: getTrendColor(analytics.summary.trends.productivity),
                }}
              >
                {getTrendIcon(analytics.summary.trends.productivity)}{" "}
                {Math.floor(Math.random() * 10) + 1}%
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⏰</div>
            <div className="summary-content">
              <div className="summary-value">
                {analytics.summary.totalFocusTime}h
              </div>
              <div className="summary-label">Focus Time</div>
              <div
                className="summary-trend"
                style={{
                  color: getTrendColor(analytics.summary.trends.focusTime),
                }}
              >
                {getTrendIcon(analytics.summary.trends.focusTime)}{" "}
                {Math.floor(Math.random() * 15) + 5}%
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <div className="summary-value">
                {analytics.summary.totalTasksCompleted}
              </div>
              <div className="summary-label">Tasks Completed</div>
              <div
                className="summary-trend"
                style={{ color: getTrendColor(analytics.summary.trends.tasks) }}
              >
                {getTrendIcon(analytics.summary.trends.tasks)}{" "}
                {Math.floor(Math.random() * 20) + 5}%
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📸</div>
            <div className="summary-content">
              <div className="summary-value">
                {analytics.summary.totalScreenshots}
              </div>
              <div className="summary-label">Screenshots</div>
              <div className="summary-trend" style={{ color: "#718096" }}>
                📊{" "}
                {Math.floor(
                  analytics.summary.totalScreenshots /
                    analytics.dailyData.length
                )}
                /day
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-charts">
          <div className="chart-section">
            <h3>📈 Productivity Trends - {getTimeRangeLabel()}</h3>
            <ProductivityChart
              data={analytics.dailyData}
              timeRange={timeRange}
            />
          </div>

          <div className="chart-section">
            <h3>⏱️ Time Distribution</h3>
            <TimeDistribution data={analytics.dailyData} />
          </div>
        </div>

        <div className="insights-section">
          <h3>💡 Insights & Recommendations</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🌟</div>
              <div className="insight-content">
                <h4>Most Productive Day</h4>
                <p>
                  {new Date(
                    analytics.summary.mostProductiveDay.date
                  ).toLocaleDateString("en-US", { weekday: "long" })}
                  with {analytics.summary.mostProductiveDay.productivityScore}%
                  productivity score
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Focus Pattern</h4>
                <p>
                  You maintain focus best during morning hours. Consider
                  scheduling important tasks between 9-11 AM.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">📱</div>
              <div className="insight-content">
                <h4>Distraction Analysis</h4>
                <p>
                  Social media usage peaks around 2-3 PM. Try using focus mode
                  during this time.
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">🚀</div>
              <div className="insight-content">
                <h4>Improvement Tip</h4>
                <p>
                  Taking 5-minute breaks every 25 minutes could boost your
                  productivity by an estimated 15%.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-section">
          <h3>📊 Activity Summary</h3>
          <div className="activity-summary">
            <div className="activity-card">
              <h4>Total Work Time</h4>
              <p className="activity-value">
                {analytics?.totalWorkTime || "0h 0m"}
              </p>
            </div>
            <div className="activity-card">
              <h4>Tasks Completed</h4>
              <p className="activity-value">{analytics?.tasksCompleted || 0}</p>
            </div>
            <div className="activity-card">
              <h4>Productivity Score</h4>
              <p className="activity-value">
                {analytics?.productivityScore || 0}%
              </p>
            </div>
            <div className="activity-card">
              <h4>Focus Sessions</h4>
              <p className="activity-value">{analytics?.focusSessions || 0}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;

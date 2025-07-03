import './QuickStats.css';

const QuickStats = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    todayHours: 6.5,
    weeklyHours: 32.5,
    tasksCompleted: 12,
    productivity: 85
  };

  const getProductivityColor = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    return '#e53e3e';
  };

  return (
    <div className="quick-stats">
      <h3>📊 Today's Overview</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.todayHours}h</div>
            <div className="stat-label">Hours Today</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.weeklyHours}h</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.tasksCompleted}</div>
            <div className="stat-label">Tasks Done</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div 
              className="stat-value"
              style={{ color: getProductivityColor(stats.productivity) }}
            >
              {stats.productivity}%
            </div>
            <div className="stat-label">Productivity</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-item">
          <div className="progress-header">
            <span>Daily Goal</span>
            <span>{stats.todayHours}/8h</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(stats.todayHours / 8) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="progress-item">
          <div className="progress-header">
            <span>Weekly Goal</span>
            <span>{stats.weeklyHours}/40h</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(stats.weeklyHours / 40) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="streak-section">
        <div className="streak-card">
          <div className="streak-icon">🔥</div>
          <div className="streak-content">
            <div className="streak-number">7</div>
            <div className="streak-label">Day Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;

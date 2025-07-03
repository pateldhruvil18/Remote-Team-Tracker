import './TimeDistribution.css';

const TimeDistribution = ({ data }) => {
  // Calculate averages from the data
  const avgData = data.reduce((acc, day) => {
    acc.focusTime += day.focusTime;
    acc.activeTime += day.activeTime;
    acc.distractionTime += day.distractionTime / 60; // Convert minutes to hours
    return acc;
  }, { focusTime: 0, activeTime: 0, distractionTime: 0 });

  // Calculate averages
  const totalDays = data.length;
  avgData.focusTime = avgData.focusTime / totalDays;
  avgData.activeTime = avgData.activeTime / totalDays;
  avgData.distractionTime = avgData.distractionTime / totalDays;

  // Calculate idle time (assuming 8-hour workday)
  const workDayHours = 8;
  const idleTime = workDayHours - avgData.focusTime - avgData.distractionTime;

  const timeCategories = [
    { 
      label: 'Focus Time', 
      value: avgData.focusTime, 
      color: '#48bb78',
      icon: '🎯'
    },
    { 
      label: 'Distraction Time', 
      value: avgData.distractionTime, 
      color: '#e53e3e',
      icon: '📱'
    },
    { 
      label: 'Idle Time', 
      value: Math.max(0, idleTime), 
      color: '#a0aec0',
      icon: '⏸️'
    }
  ];

  const total = timeCategories.reduce((sum, cat) => sum + cat.value, 0);

  const getPercentage = (value) => {
    return total > 0 ? (value / total) * 100 : 0;
  };

  const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="time-distribution">
      <div className="distribution-chart">
        <div className="donut-chart">
          <svg viewBox="0 0 100 100" className="donut-svg">
            {timeCategories.map((category, index) => {
              const percentage = getPercentage(category.value);
              const circumference = 2 * Math.PI * 30; // radius = 30
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
              
              // Calculate rotation for each segment
              let rotation = 0;
              for (let i = 0; i < index; i++) {
                rotation += getPercentage(timeCategories[i].value) * 3.6; // 360/100
              }

              return (
                <circle
                  key={category.label}
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke={category.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset="0"
                  transform={`rotate(${rotation - 90} 50 50)`}
                  className="donut-segment"
                />
              );
            })}
          </svg>
          
          <div className="donut-center">
            <div className="center-value">{formatTime(avgData.focusTime)}</div>
            <div className="center-label">Daily Focus</div>
          </div>
        </div>
      </div>

      <div className="distribution-legend">
        {timeCategories.map((category) => (
          <div key={category.label} className="legend-item">
            <div className="legend-indicator">
              <div 
                className="legend-color"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="legend-icon">{category.icon}</span>
            </div>
            <div className="legend-content">
              <div className="legend-label">{category.label}</div>
              <div className="legend-value">
                {formatTime(category.value)} ({Math.round(getPercentage(category.value))}%)
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="distribution-insights">
        <div className="insight-item">
          <span className="insight-icon">⚡</span>
          <span className="insight-text">
            Focus efficiency: {Math.round((avgData.focusTime / workDayHours) * 100)}%
          </span>
        </div>
        
        <div className="insight-item">
          <span className="insight-icon">📊</span>
          <span className="insight-text">
            {avgData.focusTime > 6 ? 'Excellent focus duration!' : 
             avgData.focusTime > 4 ? 'Good focus, room for improvement' : 
             'Consider reducing distractions'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeDistribution;

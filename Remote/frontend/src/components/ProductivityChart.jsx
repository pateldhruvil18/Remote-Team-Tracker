import './ProductivityChart.css';

const ProductivityChart = ({ data, timeRange }) => {
  const maxScore = Math.max(...data.map(d => d.productivityScore));
  const minScore = Math.min(...data.map(d => d.productivityScore));
  
  const getBarHeight = (score) => {
    return ((score - minScore) / (maxScore - minScore)) * 100;
  };

  const getScoreColor = (score) => {
    if (score >= 85) return '#48bb78';
    if (score >= 70) return '#ed8936';
    if (score >= 50) return '#ecc94b';
    return '#e53e3e';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (timeRange === 'day') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const averageScore = Math.round(data.reduce((sum, d) => sum + d.productivityScore, 0) / data.length);

  return (
    <div className="productivity-chart">
      <div className="chart-header">
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value" style={{ color: getScoreColor(averageScore) }}>
              {averageScore}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Highest</span>
            <span className="stat-value" style={{ color: getScoreColor(maxScore) }}>
              {maxScore}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Lowest</span>
            <span className="stat-value" style={{ color: getScoreColor(minScore) }}>
              {minScore}%
            </span>
          </div>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-y-axis">
          <div className="y-axis-label">100%</div>
          <div className="y-axis-label">75%</div>
          <div className="y-axis-label">50%</div>
          <div className="y-axis-label">25%</div>
          <div className="y-axis-label">0%</div>
        </div>

        <div className="chart-content">
          <div className="chart-grid">
            {[100, 75, 50, 25, 0].map(value => (
              <div key={value} className="grid-line"></div>
            ))}
          </div>

          <div className="chart-bars">
            {data.map((item, index) => (
              <div key={index} className="bar-container">
                <div 
                  className="bar"
                  style={{ 
                    height: `${getBarHeight(item.productivityScore)}%`,
                    backgroundColor: getScoreColor(item.productivityScore)
                  }}
                  title={`${item.productivityScore}% productivity`}
                >
                  <div className="bar-value">{item.productivityScore}%</div>
                </div>
                <div className="bar-label">{formatDate(item.date)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#48bb78' }}></div>
          <span>Excellent (85%+)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ed8936' }}></div>
          <span>Good (70-84%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#ecc94b' }}></div>
          <span>Fair (50-69%)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e53e3e' }}></div>
          <span>Needs Improvement (&lt;50%)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityChart;

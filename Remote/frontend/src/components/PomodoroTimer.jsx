import { useState, useEffect, useRef } from 'react';
import './PomodoroTimer.css';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const modes = {
    work: { duration: 25 * 60, label: 'Focus Time', color: '#667eea' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: '#48bb78' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: '#ed8936' }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Play notification sound (you can add actual sound here)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${modes[mode].label} completed!`, {
        body: mode === 'work' ? 'Time for a break!' : 'Ready to focus again?',
        icon: '/favicon.ico'
      });
    }

    if (mode === 'work') {
      setSessions(prev => prev + 1);
      // After 4 work sessions, take a long break
      const nextMode = (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(modes[nextMode].duration);
    } else {
      setMode('work');
      setTimeLeft(modes.work.duration);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].duration);
  };

  const switchMode = (newMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="pomodoro-timer">
      <div className="timer-header">
        <h2>🍅 Pomodoro Timer</h2>
        <div className="session-counter">
          <span>Sessions completed: {sessions}</span>
        </div>
      </div>

      <div className="timer-modes">
        {Object.entries(modes).map(([key, modeData]) => (
          <button
            key={key}
            className={`mode-btn ${mode === key ? 'active' : ''}`}
            onClick={() => switchMode(key)}
            style={{ '--mode-color': modeData.color }}
          >
            {modeData.label}
          </button>
        ))}
      </div>

      <div className="timer-display">
        <div 
          className="timer-circle"
          style={{ '--progress': progress, '--mode-color': modes[mode].color }}
        >
          <div className="timer-time">
            {formatTime(timeLeft)}
          </div>
          <div className="timer-label">
            {modes[mode].label}
          </div>
        </div>
      </div>

      <div className="timer-controls">
        <button 
          className="control-btn primary"
          onClick={toggleTimer}
          style={{ '--mode-color': modes[mode].color }}
        >
          {isActive ? '⏸️ Pause' : '▶️ Start'}
        </button>
        <button 
          className="control-btn secondary"
          onClick={resetTimer}
        >
          🔄 Reset
        </button>
      </div>

      <div className="timer-stats">
        <div className="stat-item">
          <span className="stat-value">{sessions}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{Math.floor((sessions * 25) / 60)}h {(sessions * 25) % 60}m</span>
          <span className="stat-label">Focus Time</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{sessions > 0 ? Math.round((sessions / (sessions + (mode === 'work' && timeLeft < modes.work.duration ? 1 : 0))) * 100) : 0}%</span>
          <span className="stat-label">Success Rate</span>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;

import { useState, useEffect } from "react";
import screenshotService from "../services/screenshotService";
import "./ScreenshotCapture.css";

/**
 * Screenshot Capture Component
 * Provides UI controls for browser-based screenshot capture
 */
const ScreenshotCapture = () => {
  const [status, setStatus] = useState({
    isCapturing: false,
    isInitialized: false,
    isSupported: true,
  });
  const [captureInterval, setCaptureInterval] = useState(5); // minutes
  const [error, setError] = useState(null);
  const [lastCaptureTime, setLastCaptureTime] = useState(null);

  useEffect(() => {
    // Check browser support
    if (!screenshotService.constructor.isSupported()) {
      setStatus((prev) => ({ ...prev, isSupported: false }));
      setError(
        "Your browser does not support screen capture. Please use Chrome, Firefox, or Edge."
      );
      return;
    }

    // Update status periodically
    const statusInterval = setInterval(() => {
      const currentStatus = screenshotService.getStatus();
      setStatus(currentStatus);
    }, 1000);

    return () => clearInterval(statusInterval);
  }, []);

  /**
   * Start screenshot capture
   */
  const handleStartCapture = async () => {
    try {
      setError(null);
      await screenshotService.startCapture();
      setLastCaptureTime(new Date());
    } catch (error) {
      setError(error.message);
      console.error("Failed to start capture:", error);
    }
  };

  /**
   * Stop screenshot capture
   */
  const handleStopCapture = () => {
    screenshotService.stopCapture();
    setLastCaptureTime(null);
  };

  /**
   * Change capture interval
   */
  const handleIntervalChange = (minutes) => {
    setCaptureInterval(minutes);
    screenshotService.setCaptureInterval(minutes);
  };

  /**
   * Take manual screenshot
   */
  const handleManualCapture = async () => {
    try {
      setError(null);
      if (!status.isInitialized) {
        await screenshotService.initialize();
      }
      await screenshotService.captureScreenshot();
      setLastCaptureTime(new Date());
    } catch (error) {
      setError(error.message);
      console.error("Failed to take manual screenshot:", error);
    }
  };

  if (!status.isSupported) {
    return (
      <div className="screenshot-capture">
        <div className="capture-header">
          <h3>📸 Screenshot Monitoring</h3>
          <span className="status-badge status-unsupported">Not Supported</span>
        </div>
        <div className="error-message">
          <p>⚠️ Your browser doesn't support screen capture.</p>
          <p>Please use Chrome, Firefox, or Edge for this feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screenshot-capture">
      <div className="capture-header">
        <h3>📸 Screenshot Monitoring</h3>
        <span
          className={`status-badge ${
            status.isCapturing ? "status-active" : "status-inactive"
          }`}
        >
          {status.isCapturing ? "Active" : "Inactive"}
        </span>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="capture-controls">
        <div className="control-group">
          <label>Capture Frequency:</label>
          <select
            value={captureInterval}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            disabled={status.isCapturing}
          >
            <option value={1}>Every minute</option>
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={15}>Every 15 minutes</option>
            <option value={30}>Every 30 minutes</option>
          </select>
        </div>

        <div className="button-group">
          {!status.isCapturing ? (
            <button className="btn btn-primary" onClick={handleStartCapture}>
              🚀 Start Monitoring
            </button>
          ) : (
            <button className="btn btn-danger" onClick={handleStopCapture}>
              🛑 Stop Monitoring
            </button>
          )}

          <button
            className="btn btn-secondary"
            onClick={handleManualCapture}
            disabled={status.isCapturing && !status.isInitialized}
          >
            📸 Take Screenshot Now
          </button>
        </div>
      </div>

      <div className="capture-info">
        <div className="info-item">
          <span className="info-label">Status:</span>
          <span className="info-value">
            {status.isCapturing
              ? "🟢 Monitoring active"
              : "🔴 Monitoring stopped"}
          </span>
        </div>

        <div className="info-item">
          <span className="info-label">Frequency:</span>
          <span className="info-value">
            Every {captureInterval} minute{captureInterval !== 1 ? "s" : ""}
          </span>
        </div>

        {lastCaptureTime && (
          <div className="info-item">
            <span className="info-label">Last Capture:</span>
            <span className="info-value">
              {lastCaptureTime.toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenshotCapture;

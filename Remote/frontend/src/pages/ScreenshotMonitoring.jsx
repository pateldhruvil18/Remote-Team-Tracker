import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import ScreenshotCapture from "../components/ScreenshotCapture";
import ScreenshotGallery from "../components/ScreenshotGallery";
import "./ScreenshotMonitoring.css";

const ScreenshotMonitoring = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("capture");

  const tabs = [
    { id: "capture", label: "Live Capture", icon: "📸" },
    { id: "gallery", label: "Gallery", icon: "🖼️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "capture":
        return <ScreenshotCapture />;
      case "gallery":
        return <ScreenshotGallery />;
      case "settings":
        return (
          <div className="screenshot-settings">
            <h3>⚙️ Screenshot Settings</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Capture Interval</label>
                <select defaultValue="5">
                  <option value="1">Every 1 minute</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="10">Every 10 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Image Quality</label>
                <select defaultValue="medium">
                  <option value="low">Low (Faster)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Slower)</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Auto-delete old screenshots</label>
                <select defaultValue="7">
                  <option value="1">After 1 day</option>
                  <option value="3">After 3 days</option>
                  <option value="7">After 7 days</option>
                  <option value="30">After 30 days</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Notifications</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Notify when capture starts</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Notify on capture errors</span>
                  </label>
                </div>
              </div>
            </div>
            <button className="save-settings-btn">Save Settings</button>
          </div>
        );
      default:
        return <ScreenshotCapture />;
    }
  };

  return (
    <div className="screenshot-monitoring-page">
      <Header />
      
      <div className="screenshot-container">
        <div className="page-header">
          <div className="header-content">
            <h1>📸 Screenshot Monitoring</h1>
            <p>Track your productivity with automated screenshots</p>
          </div>
        </div>

        <div className="screenshot-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="screenshot-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ScreenshotMonitoring;

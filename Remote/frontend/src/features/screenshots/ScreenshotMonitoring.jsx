import { useState } from "react";
import { useAuth } from "../../store/AuthContext";
import ScreenshotCapture from "../../components/ScreenshotCapture";
import ScreenshotGallery from "../../components/ScreenshotGallery";

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
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <ScreenshotCapture />
          </div>
        );
      case "gallery":
        return <ScreenshotGallery />;
      case "settings":
        return (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span>⚙️</span> Screenshot Settings
            </h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Capture Interval</label>
                <select defaultValue="5" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all">
                  <option value="1">Every 1 minute</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="10">Every 10 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Image Quality</label>
                <select defaultValue="medium" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all">
                  <option value="low">Low (Faster)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Slower)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Auto-delete old screenshots</label>
                <select defaultValue="7" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all">
                  <option value="1">After 1 day</option>
                  <option value="3">After 3 days</option>
                  <option value="7">After 7 days</option>
                  <option value="30">After 30 days</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end">
                <button className="px-6 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Screenshot Monitoring</h1>
        <p className="text-gray-500 mt-1">Manage and view productivity screenshots.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="transition-all duration-300">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ScreenshotMonitoring;

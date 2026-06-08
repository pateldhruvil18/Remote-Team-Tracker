import { useState, useEffect } from "react";
import screenshotService from "../api/screenshotService";

const ScreenshotCapture = () => {
  const [status, setStatus] = useState({
    isCapturing: false,
    isInitialized: false,
    isSupported: true,
  });
  const [captureInterval, setCaptureInterval] = useState(5);
  const [error, setError] = useState(null);
  const [lastCaptureTime, setLastCaptureTime] = useState(null);

  useEffect(() => {
    if (!screenshotService.constructor.isSupported()) {
      setStatus((prev) => ({ ...prev, isSupported: false }));
      setError("Your browser does not support screen capture. Please use Chrome, Firefox, or Edge.");
      return;
    }

    const statusInterval = setInterval(() => {
      const currentStatus = screenshotService.getStatus();
      setStatus(currentStatus);
    }, 1000);

    return () => clearInterval(statusInterval);
  }, []);

  const handleStartCapture = async () => {
    try {
      setError(null);
      await screenshotService.startCapture();
      setLastCaptureTime(new Date());
    } catch (error) {
      setError(error.message);
    }
  };

  const handleStopCapture = () => {
    screenshotService.stopCapture();
    setLastCaptureTime(null);
  };

  const handleIntervalChange = (minutes) => {
    setCaptureInterval(minutes);
    screenshotService.setCaptureInterval(minutes);
  };

  const handleManualCapture = async () => {
    try {
      setError(null);
      if (!status.isInitialized) {
        await screenshotService.initialize();
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      await screenshotService.captureScreenshot();
      setLastCaptureTime(new Date());
      alert("📸 Screenshot captured successfully!");
    } catch (error) {
      setError(error.message);
      alert(`❌ Screenshot failed: ${error.message}`);
    }
  };

  if (!status.isSupported) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl border border-red-100">
        <div className="text-3xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold">Screen Capture Not Supported</h3>
        <p className="text-sm mt-1 opacity-80">Please use a modern desktop browser like Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📸</span> Screen Capture Engine
          </h3>
          <p className="text-sm text-gray-500 mt-1">Configure and manage automated productivity snapshots.</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[2px] border ${
          status.isCapturing ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'
        }`}>
          {status.isCapturing ? '● Monitoring Active' : '○ Monitoring Stopped'}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3">
          <span>❌</span> {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Frequency</label>
            <select
              value={captureInterval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              disabled={status.isCapturing}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all"
            >
              <option value={1}>Every 1 minute</option>
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
              <option value={30}>Every 30 minutes</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            {!status.isCapturing ? (
              <button onClick={handleStartCapture} className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                🚀 START MONITORING
              </button>
            ) : (
              <button onClick={handleStopCapture} className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all">
                🛑 STOP MONITORING
              </button>
            )}
            <button
              onClick={handleManualCapture}
              className="w-full py-4 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
            >
              📸 INSTANT SNAPSHOT
            </button>
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 space-y-4">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engine Status</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection</span>
              <span className={`text-xs font-bold ${status.isInitialized ? 'text-green-600' : 'text-gray-400'}`}>
                {status.isInitialized ? 'Connected' : 'Ready'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Interval</span>
              <span className="text-xs font-bold text-gray-900">Every {captureInterval}m</span>
            </div>
            {lastCaptureTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Pulse</span>
                <span className="text-xs font-bold text-gray-900">{lastCaptureTime.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-gray-200">
            <div className="text-[10px] text-gray-400 leading-relaxed">
              * Auto-capture requires browser tab to remain active. Manual snapshots are always available.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotCapture;

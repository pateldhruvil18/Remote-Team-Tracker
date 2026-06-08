import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/AuthContext";
import screenshotService from "../api/screenshotService";

/* ─────────────────────────────────────────────────────────────────────────
   Instruction Modal — shown before getDisplayMedia() is called so the user
   knows exactly what to click in the browser dialog.
───────────────────────────────────────────────────────────────────────── */
const PermissionInstructionModal = ({ onProceed, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-[fadeInUp_0.25s_ease]">
      <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-2xl mb-5 mx-auto">
        🖥️
      </div>
      <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
        Enable Full-Screen Monitoring
      </h2>
      <p className="text-gray-500 text-sm text-center mb-7">
        Your manager needs to see your full screen. Follow these steps in the
        browser dialog that appears next:
      </p>

      <ol className="space-y-4 mb-8">
        {[
          {
            step: "1",
            icon: "🗂️",
            title: 'Click the "Entire Screen" tab',
            desc: "At the top of the dialog, choose Entire Screen (not Window or Tab).",
          },
          {
            step: "2",
            icon: "🖥️",
            title: "Select your screen",
            desc: "Click on the preview of your monitor to select it.",
          },
          {
            step: "3",
            icon: "✅",
            title: 'Click "Share"',
            desc: "Press the Share / Allow button to start monitoring.",
          },
        ].map((item) => (
          <li key={item.step} className="flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {item.step}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {item.icon} {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onProceed}
          className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-all shadow-lg shadow-gray-900/20"
        >
          Got it — Proceed →
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Stat Card
───────────────────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color = "black" }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
        color === "black" ? "bg-black" : "bg-gray-100"
      }`}
    >
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────────────────────────────────── */
const TeamMemberDashboard = () => {
  const { user, token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [todayStats, setTodayStats] = useState({
    focusTime: 0,
    tasksCompleted: 0,
    pomodoroSessions: 0,
    productivity: 0,
  });

  // Screenshot monitoring state
  // idle | prompting | instructions | active | cancelled | error
  const [monitoringStatus, setMonitoringStatus] = useState("idle");
  const [lastCaptureTime, setLastCaptureTime] = useState(null);
  const [captureCount, setCaptureCount] = useState(0);
  const statusPollRef = useRef(null);

  // ── Clock ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Tasks ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  useEffect(() => {
    if (user?._id) {
      const savedSessions =
        parseInt(localStorage.getItem(`pomodoro_sessions_${user._id}`)) || 0;
      const focusTime = parseFloat((savedSessions * 25 / 60).toFixed(1));
      const done = assignedTasks.filter(
        (t) => t.status === "completed" || t.status === "done"
      ).length;
      const productivity = Math.min(
        100,
        Math.round((done * 25) + (savedSessions * 15) + (focusTime > 0 ? 30 : 0)) || 75
      );
      setTodayStats({ focusTime, tasksCompleted: done, pomodoroSessions: savedSessions, productivity });
    }
  }, [assignedTasks, user]);

  // ── Screenshot monitoring boot ─────────────────────────────────────────
  useEffect(() => {
    if (!ScreenshotService_isSupported()) {
      setMonitoringStatus("error");
      return;
    }
    // Wire up service callbacks
    screenshotService.onCaptureSuccess = (ts) => {
      setLastCaptureTime(ts);
      setCaptureCount((p) => p + 1);
    };
    screenshotService.onStreamEnded = () => {
      // User clicked "Stop sharing" in the browser toolbar
      setMonitoringStatus("idle");
      setCaptureCount(0);
      setLastCaptureTime(null);
      localStorage.removeItem(`screenshot_monitoring_${user?._id}`);
    };
    screenshotService.onError = (type) => {
      setMonitoringStatus(type === "cancelled" ? "cancelled" : "error");
      localStorage.removeItem(`screenshot_monitoring_${user?._id}`);
    };

    // Show prompt on every login (no silent auto-restart — getDisplayMedia needs user gesture)
    setMonitoringStatus("prompting");

    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, [user?._id]);

  // ── Proceed after user reads instructions ──────────────────────────────
  const handleProceed = async () => {
    setMonitoringStatus("idle"); // hide modal while dialog is open
    try {
      await screenshotService.startCapture();
      setMonitoringStatus("active");
      setCaptureCount(0);
      setLastCaptureTime(null);
      localStorage.setItem(`screenshot_monitoring_${user?._id}`, "true");
    } catch {
      // onError callback already set the state
    }
  };

  const stopMonitoring = () => {
    screenshotService.stopCapture();
    setMonitoringStatus("idle");
    setCaptureCount(0);
    setLastCaptureTime(null);
    localStorage.removeItem(`screenshot_monitoring_${user?._id}`);
  };

  // ── Tasks helpers ──────────────────────────────────────────────────────
  const fetchAssignedTasks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) setAssignedTasks((await res.json()).data || []);
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAssignedTasks();
    } catch (e) {
      console.error("Error updating task:", e);
    }
  };

  const fmt = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const fmtDate = (d) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const pending = assignedTasks.filter((t) => t.status === "pending").length;
  const inProgress = assignedTasks.filter((t) => t.status === "in-progress").length;
  const completed = assignedTasks.filter((t) => t.status === "completed").length;
  const greetHour = currentTime.getHours();
  const greeting =
    greetHour < 12 ? "Good Morning" : greetHour < 17 ? "Good Afternoon" : "Good Evening";

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">

      {/* ── INSTRUCTION MODAL (before browser dialog) ── */}
      {monitoringStatus === "instructions" && (
        <PermissionInstructionModal
          onProceed={handleProceed}
          onCancel={() => setMonitoringStatus("idle")}
        />
      )}

      {/* ── MONITORING BANNER ── */}
      {monitoringStatus === "prompting" && (
        <div className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              🖥️
            </div>
            <div>
              <p className="font-bold text-sm">Screen Monitoring Required</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Your manager needs a full-screen capture every 30 seconds (captures all apps, not just the browser).
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => setMonitoringStatus("idle")}
              className="px-4 py-2 border border-white/20 text-white/70 rounded-xl text-xs font-medium hover:bg-white/10 transition-all"
            >
              Later
            </button>
            <button
              onClick={() => setMonitoringStatus("instructions")}
              className="px-5 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-gray-100 transition-all"
            >
              🚀 Enable Now
            </button>
          </div>
        </div>
      )}

      {monitoringStatus === "active" && (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
            <div>
              <p className="text-sm font-bold text-green-800">
                Full-Screen Monitoring Active — Every 30 Seconds
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {captureCount > 0
                  ? `${captureCount} screenshot${captureCount !== 1 ? "s" : ""} captured${
                      lastCaptureTime ? ` · Last: ${lastCaptureTime.toLocaleTimeString()}` : ""
                    }`
                  : "First screenshot in a few seconds..."}
              </p>
            </div>
          </div>
          <button
            onClick={stopMonitoring}
            className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-all flex-shrink-0"
          >
            🛑 Stop
          </button>
        </div>
      )}

      {monitoringStatus === "cancelled" && (
        <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Screen Sharing Cancelled</p>
              <p className="text-xs text-amber-600 mt-0.5">
                You cancelled the screen sharing dialog. Click Enable to try again — remember to select "Entire Screen".
              </p>
            </div>
          </div>
          <button
            onClick={() => setMonitoringStatus("instructions")}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all flex-shrink-0 whitespace-nowrap"
          >
            Try Again
          </button>
        </div>
      )}

      {monitoringStatus === "error" && (
        <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-xl">🔒</span>
          <p className="text-sm text-red-800">
            Screen capture is not supported in this browser. Please use Chrome or Edge.
          </p>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              Team Member
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {greeting}, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your productivity overview for today.</p>
        </div>
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 text-right">
          <div className="text-2xl font-mono font-bold text-gray-900">{fmt(currentTime)}</div>
          <div className="text-sm text-gray-500">{fmtDate(currentTime)}</div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon="📋" label="Total Tasks" value={assignedTasks.length} />
        <StatCard icon="⏳" label="Pending" value={pending} color="gray" />
        <StatCard icon="🔄" label="In Progress" value={inProgress} color="gray" />
        <StatCard icon="✅" label="Completed" value={completed} color="gray" />
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {["overview", "my tasks", "monitoring"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
              activeTab === tab
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Task Progress</h2>
            <div className="space-y-5">
              {[
                { label: "Completed", value: completed, color: "bg-black" },
                { label: "In Progress", value: inProgress, color: "bg-gray-600" },
                { label: "Pending", value: pending, color: "bg-gray-300" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="text-gray-900">
                      {item.value}/{assignedTasks.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${item.color}`}
                      style={{
                        width:
                          assignedTasks.length > 0
                            ? `${Math.round((item.value / assignedTasks.length) * 100)}%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Today's Goals</h2>
            <div className="space-y-4">
              {[
                { label: "Complete 3 tasks", done: completed >= 3 },
                { label: "2 hrs focused work", done: todayStats.focusTime >= 2 },
                { label: "3 Pomodoro sessions", done: todayStats.pomodoroSessions >= 3 },
                { label: "Update task statuses", done: inProgress > 0 || completed > 0 },
              ].map((goal, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    goal.done ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      goal.done ? "bg-black border-black" : "border-gray-300"
                    }`}
                  >
                    {goal.done && (
                      <span className="text-white text-[10px]">✓</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      goal.done
                        ? "text-gray-400 line-through"
                        : "text-gray-700 font-medium"
                    }`}
                  >
                    {goal.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MY TASKS ── */}
      {activeTab === "my tasks" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Assigned Tasks</h2>
            <button
              onClick={fetchAssignedTasks}
              className="text-sm text-gray-500 hover:text-black transition-colors font-medium"
            >
              ↻ Refresh
            </button>
          </div>
          {assignedTasks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">📝</div>
              <p className="font-medium">No tasks assigned yet</p>
              <p className="text-sm mt-1">Your manager will assign tasks to you</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {assignedTasks.map((task, i) => (
                <div key={task.id || i} className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-1.5 min-h-[40px] rounded-full flex-shrink-0 ${
                        task.priority === "urgent"
                          ? "bg-red-400"
                          : task.priority === "high"
                          ? "bg-orange-400"
                          : task.priority === "medium"
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{task.title}</p>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                task.priority === "urgent"
                                  ? "bg-red-100 text-red-600"
                                  : task.priority === "high"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-gray-400">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {task.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, "in-progress")}
                              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                            >
                              Start
                            </button>
                          )}
                          {(task.status === "pending" ||
                            task.status === "in-progress") && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, "completed")}
                              className="text-xs px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800 font-medium"
                            >
                              Complete
                            </button>
                          )}
                          {task.status === "completed" && (
                            <span className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-medium">
                              ✓ Done
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MONITORING TAB ── */}
      {activeTab === "monitoring" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Screen Monitoring
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Captures your full screen (all apps) every 30 seconds.
              </p>
            </div>
            <div
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[2px] border ${
                monitoringStatus === "active"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-gray-100 text-gray-400 border-gray-200"
              }`}
            >
              {monitoringStatus === "active" ? "● Live" : "○ Stopped"}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: "Status",
                value:
                  monitoringStatus === "active"
                    ? "Running"
                    : monitoringStatus === "cancelled"
                    ? "Cancelled"
                    : "Stopped",
                highlight: monitoringStatus === "active",
              },
              { label: "Interval", value: "Every 30 sec" },
              {
                label: "Captured Today",
                value: `${captureCount} shot${captureCount !== 1 ? "s" : ""}`,
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {card.label}
                </div>
                <div
                  className={`text-base font-bold ${
                    card.highlight ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {lastCaptureTime && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-medium">
              📸 Last captured: {lastCaptureTime.toLocaleTimeString()}
            </div>
          )}

          {monitoringStatus !== "active" ? (
            <button
              onClick={() => setMonitoringStatus("instructions")}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition-all shadow-xl shadow-gray-900/10"
            >
              🖥️ Start Full-Screen Monitoring
            </button>
          ) : (
            <button
              onClick={stopMonitoring}
              className="w-full py-4 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all"
            >
              🛑 Stop Monitoring
            </button>
          )}

          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
            * Your entire screen is shared with your manager while monitoring is active.
            A browser bar will show "Sharing your screen" — you can stop at any time.
            Screenshots are taken every 30 seconds and uploaded securely.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper used inside useEffect (avoids stale closure on static method)
function ScreenshotService_isSupported() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getDisplayMedia
  );
}

export default TeamMemberDashboard;

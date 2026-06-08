import { useState, useEffect, useRef } from "react";
import { useAuth } from "../store/AuthContext";
import DatabaseViewer from "./DatabaseViewer";
import ManagerApproval from "./ManagerApproval";

const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
    <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
      {icon}
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const ManagerDashboard = ({ initialTab }) => {
  const { user, token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({ totalMembers: 0, activeToday: 0, totalFocusTime: 0, totalTasks: 0, avgProductivity: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [tasks, setTasks] = useState([]);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "", priority: "medium", dueDate: "", category: "general", estimatedHours: "" });
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false); // floating modal that works from any tab
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberScreenshots, setMemberScreenshots] = useState([]);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [memberScreenshotDateRange, setMemberScreenshotDateRange] = useState("today");
  const [lightboxScreenshot, setLightboxScreenshot] = useState(null);
  const screenshotRefreshRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchTeamData(); fetchTasks(); }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/team-members`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        const members = data.data.teamMembers.map((m) => ({
          id: m._id,
          firstName: m.firstName,
          lastName: m.lastName,
          name: `${m.firstName} ${m.lastName}`,
          email: m.email,
          avatar: m.avatar,
          phone: m.phone,
          department: m.department,
          jobTitle: m.jobTitle,
          bio: m.bio,
          location: m.location,
          timezone: m.timezone,
          createdAt: m.createdAt,
          status: m.todayStats.status,
          todayStats: m.todayStats,
        }));
        setTeamMembers(members);
        setTeamStats({
          totalMembers: members.length,
          activeToday: members.filter((m) => m.status === "active").length,
          totalFocusTime: members.reduce((s, m) => s + m.todayStats.focusTime, 0),
          totalTasks: members.reduce((s, m) => s + m.todayStats.tasksCompleted, 0),
          avgProductivity: members.length > 0 ? Math.round(members.reduce((s, m) => s + m.todayStats.productivity, 0) / members.length) : 0,
        });
      }
    } catch (e) { console.error("Error fetching team data:", e); }
    finally { setLoading(false); }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/manager-tasks`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success) setTasks(data.data || []);
    } catch (e) { console.error("Error fetching tasks:", e); }
  };


  const getDateRange = (range) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (range) {
      case "today": return { start: today.toISOString(), end: new Date(today.getTime() + 86400000).toISOString() };
      case "yesterday": return { start: new Date(today.getTime() - 86400000).toISOString(), end: today.toISOString() };
      case "week": return { start: new Date(today.getTime() - 604800000).toISOString(), end: now.toISOString() };
      default: return {};
    }
  };

  const handleMemberClick = async (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
    setMemberScreenshotDateRange("today");
    fetchMemberScreenshots(member.id, "today");

    // Auto-refresh screenshots every 30s while modal is open
    if (screenshotRefreshRef.current) clearInterval(screenshotRefreshRef.current);
    screenshotRefreshRef.current = setInterval(() => {
      fetchMemberScreenshots(member.id, memberScreenshotDateRange);
    }, 30000);
  };

  const fetchMemberScreenshots = async (memberId, range) => {
    try {
      setScreenshotLoading(true);
      const params = new URLSearchParams();
      params.append("userId", memberId);
      
      const dates = getDateRange(range);
      if (dates.start) params.append("startDate", dates.start);
      if (dates.end) params.append("endDate", dates.end);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/screenshots?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMemberScreenshots(data.data.screenshots || []);
      }
    } catch (error) {
      console.error("Error fetching member screenshots:", error);
    } finally {
      setScreenshotLoading(false);
    }
  };

  // Get image URL directly from the Cloudinary filePath — no second fetch needed
  const getScreenshotImageUrl = (screenshot) => {
    if (screenshot.filePath && (screenshot.filePath.startsWith("http://") || screenshot.filePath.startsWith("https://"))) {
      return screenshot.filePath;
    }
    // Fallback: use the backend proxy route
    return `${import.meta.env.VITE_API_URL}/screenshots/${screenshot._id}`;
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assignedTo) return alert("Please fill required fields");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, estimatedHours: newTask.estimatedHours ? parseFloat(newTask.estimatedHours) : undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTaskFormOpen(false);
        setNewTask({ title: "", description: "", assignedTo: "", priority: "medium", dueDate: "", category: "general", estimatedHours: "" });
        fetchTasks();
      } else throw new Error(data.message);
    } catch (e) { console.error("Error creating task:", e); alert("Failed to create task: " + e.message); }
  };

  const downloadReport = () => {
    const reportData = { generatedAt: new Date().toISOString(), teamStats, teamMembers };
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const a = document.createElement("a");
    a.href = dataUri;
    a.download = `team-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  const formatTime = (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) => d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "team", label: "Team Activity" },
    { id: "tasks", label: "Task Management" },
    { id: "approvals", label: "Approvals" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading team data...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">Manager</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Good {currentTime.getHours() < 12 ? "Morning" : currentTime.getHours() < 17 ? "Afternoon" : "Evening"}, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your team performance summary for today.</p>
        </div>
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 text-right">
          <div className="text-2xl font-mono font-bold text-gray-900">{formatTime(currentTime)}</div>
          <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon="👥" label="Total Members" value={teamStats.totalMembers} />
        <StatCard icon="🟢" label="Active Today" value={teamStats.activeToday} sub={`${teamStats.totalMembers > 0 ? Math.round(teamStats.activeToday / teamStats.totalMembers * 100) : 0}% of team`} />
        <StatCard icon="⏱️" label="Total Focus Time" value={`${teamStats.totalFocusTime.toFixed(1)}h`} />
        <StatCard icon="✅" label="Tasks Completed" value={teamStats.totalTasks} />
        <StatCard icon="📈" label="Avg Productivity" value={`${teamStats.avgProductivity}%`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-full overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Productivity Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Team Productivity</h2>
              <button onClick={downloadReport} className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Export Report
              </button>
            </div>
            <div className="space-y-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">👥</div>
                  <p>No team members yet. Invite your team!</p>
                </div>
              ) : (
                teamMembers.map(member => (
                  <div key={member.id} onClick={() => handleMemberClick(member)}
                    className="flex items-center gap-4 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-200">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-900 truncate">{member.name}</span>
                        <span className="text-sm font-bold text-gray-700 ml-2">{member.todayStats.productivity}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-black transition-all" style={{ width: `${member.todayStats.productivity}%` }}></div>
                      </div>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${member.status === "active" ? "bg-green-500" : "bg-gray-300"}`}></div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: "Create Task", icon: "➕", action: () => setTaskModalOpen(true) },
                { label: "Review Approvals", icon: "✔️", action: () => setActiveTab("approvals") },
                { label: "View Database", icon: "🗄️", action: () => setShowDatabaseViewer(true) },
                { label: "Download Report", icon: "📊", action: downloadReport },
                { label: "View Screenshots", icon: "📸", action: () => (window.location.hash = "screenshot-monitoring") },
              ].map((item, i) => (
                <button key={i} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all group">
                  <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Activity Tab */}
      {activeTab === "team" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Team Activity</h2>
            <button onClick={fetchTeamData} className="text-sm text-gray-500 hover:text-black transition-colors font-medium">↻ Refresh</button>
          </div>
          {teamMembers.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-4">👥</div>
              <p className="font-medium">No team members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {teamMembers.map(member => (
                <div key={member.id} onClick={() => handleMemberClick(member)}
                  className="px-6 py-5 flex items-center gap-5 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === "active" ? "bg-green-500" : "bg-gray-300"}`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                  </div>
                  <div className="hidden md:flex gap-8 text-center mr-4">
                    <div><div className="font-bold text-gray-900">{member.todayStats.focusTime}h</div><div className="text-xs text-gray-400">Focus</div></div>
                    <div><div className="font-bold text-gray-900">{member.todayStats.tasksCompleted}</div><div className="text-xs text-gray-400">Tasks</div></div>
                    <div><div className="font-bold text-gray-900">{member.todayStats.pomodoroSessions}</div><div className="text-xs text-gray-400">Pomodoros</div></div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-black text-gray-900">{member.todayStats.productivity}%</div>
                    <div className="text-xs text-gray-400">Productivity</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Management Tab */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Create Task Form */}
          {taskFormOpen && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
                <button onClick={() => setTaskFormOpen(false)} className="text-gray-400 hover:text-black text-xl">✕</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Task Title *</label>
                  <input type="text" id="task-title-input" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Review Q1 Reports" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Assign To *</label>
                  <select value={newTask.assignedTo} onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white">
                    <option value="">Select team member...</option>
                    {teamMembers.map(m => <option key={m.id} value={m.email}>{m.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Task details..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setTaskFormOpen(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleCreateTask} className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Create Task</button>
              </div>
            </div>
          )}

          {/* Tasks List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Tasks ({tasks.length})</h2>
              {!taskFormOpen && (
                <button onClick={() => setTaskFormOpen(true)} className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  + Create Task
                </button>
              )}
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <div className="text-5xl mb-4">📋</div>
                <p className="font-medium">No tasks yet. Create the first one!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tasks.map((task, i) => (
                  <div key={task.id || i} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-10 rounded-full flex-shrink-0 ${task.priority === "urgent" ? "bg-red-400" : task.priority === "high" ? "bg-orange-400" : task.priority === "medium" ? "bg-yellow-400" : "bg-green-400"}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                      <p className="text-sm text-gray-500 truncate">{task.assignedToName || task.assignedTo}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${task.status === "completed" ? "bg-green-100 text-green-700" : task.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {task.status || "pending"}
                    </span>
                    {task.dueDate && <div className="text-xs text-gray-400 hidden md:block">{new Date(task.dueDate).toLocaleDateString()}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Team Approvals</h2>
          </div>
          <div className="p-6">
            <ManagerApproval />
          </div>
        </div>
      )}

      {/* Database Viewer Modal */}
      {showDatabaseViewer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDatabaseViewer(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Database Viewer</h3>
              <button onClick={() => setShowDatabaseViewer(false)} className="text-gray-400 hover:text-black text-xl transition-colors">✕</button>
            </div>
            <div className="p-6"><DatabaseViewer /></div>
          </div>
        </div>
      )}

      {/* ── FLOATING CREATE TASK MODAL (works from any tab) ── */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setTaskModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-black px-6 py-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New Task</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-white/60 hover:text-white text-xl transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Task Title *</label>
                <input type="text" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Review Q1 Reports"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Assign To *</label>
                <select value={newTask.assignedTo} onChange={e => setNewTask(p => ({ ...p, assignedTo: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all">
                  <option value="">Select team member...</option>
                  {teamMembers.map(m => <option key={m.id} value={m.email}>{m.name} — {m.email}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Task details..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none text-sm transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Priority</label>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all">
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Due Date</label>
                  <input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setTaskModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={async () => { await handleCreateTask(); setTaskModalOpen(false); }}
                  disabled={!newTask.title || !newTask.assignedTo}
                  className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  ➕ Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING ACTION BUTTON ── */}
      <button
        onClick={() => setTaskModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-gray-800 transition-all transform hover:scale-110 active:scale-95 z-40 group"
        title="Create New Task"
      >
        <span className="group-hover:rotate-90 transition-transform">✚</span>
        <span className="absolute right-full mr-4 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Quick Task
        </span>
      </button>

      {/* ── TEAM MEMBER DETAILS MODAL ── */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => {
          setShowMemberModal(false);
          if (screenshotRefreshRef.current) { clearInterval(screenshotRefreshRef.current); screenshotRefreshRef.current = null; }
        }}>
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-8" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-black text-white px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">👤</span>
                <div>
                  <h3 className="text-xl font-bold">Team Member Profile</h3>
                  <p className="text-xs text-gray-400">Detailed productivity & information directory</p>
                </div>
              </div>
              <button onClick={() => {
                setShowMemberModal(false);
                if (screenshotRefreshRef.current) { clearInterval(screenshotRefreshRef.current); screenshotRefreshRef.current = null; }
              }} className="text-white/60 hover:text-white text-2xl transition-colors">✕</button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
              {/* Left Column: Personal and Professional info */}
              <div className="lg:col-span-4 space-y-6">
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-150">
                  <div className="w-24 h-24 bg-black text-white text-3xl font-bold rounded-2xl flex items-center justify-center shadow-lg relative mb-4">
                    {selectedMember.avatar ? (
                      <img src={selectedMember.avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      selectedMember.name.split(" ").map(n => n[0]).join("")
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${selectedMember.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 leading-tight">{selectedMember.name}</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">{selectedMember.jobTitle || 'Team Member'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{selectedMember.department || 'No Department'}</p>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">Information Details</h5>
                  <div className="space-y-3">
                    {[
                      { label: "Email", value: selectedMember.email, icon: "📧" },
                      { label: "Phone", value: selectedMember.phone || "Not Provided", icon: "📞" },
                      { label: "Location", value: selectedMember.location || "Not Provided", icon: "📍" },
                      { label: "Timezone", value: selectedMember.timezone || "UTC", icon: "🌐" },
                      { label: "Joined On", value: selectedMember.createdAt ? new Date(selectedMember.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Not Available", icon: "📅" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-sm">
                        <span className="text-base mt-0.5">{item.icon}</span>
                        <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</div>
                          <div className="text-gray-900 font-semibold mt-0.5 break-all">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedMember.bio && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Biography</div>
                      <p className="text-xs text-gray-600 leading-relaxed italic">"{selectedMember.bio}"</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        setNewTask(p => ({ ...p, assignedTo: selectedMember.email }));
                        setShowMemberModal(false);
                        setTaskModalOpen(true);
                      }}
                      className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      ➕ ASSIGN TASK TO MEMBER
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Stats & Screenshots */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Today's Performance</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Productivity", value: `${selectedMember.todayStats?.productivity}%`, icon: "📈" },
                      { label: "Focus Hours", value: `${selectedMember.todayStats?.focusTime || 0}h`, icon: "⏱️" },
                      { label: "Tasks Done", value: selectedMember.todayStats?.tasksCompleted || 0, icon: "✅" },
                      { label: "Pomodoros", value: selectedMember.todayStats?.pomodoroSessions || 0, icon: "🍅" }
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-150 flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-400 uppercase tracking-wider text-[9px]">{stat.label}</div>
                          <div className="text-base font-black text-gray-900 mt-0.5">{stat.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Activity Logs (Screenshots)</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Auto-refreshes every 30s • Cloudinary storage</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchMemberScreenshots(selectedMember.id, memberScreenshotDateRange)}
                        className="px-3 py-1.5 border border-gray-200 rounded-xl bg-white text-xs font-bold hover:bg-gray-50 transition-all"
                      >
                        ↻ Refresh
                      </button>
                      <select 
                        value={memberScreenshotDateRange} 
                        onChange={(e) => {
                          setMemberScreenshotDateRange(e.target.value);
                          fetchMemberScreenshots(selectedMember.id, e.target.value);
                        }}
                        className="px-3 py-1.5 border border-gray-250 rounded-xl bg-white text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="week">This Week</option>
                        <option value="all">All Time</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {screenshotLoading ? (
                      <div className="py-12 text-center flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Loading screenshots...</p>
                      </div>
                    ) : memberScreenshots.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <div className="text-3xl mb-2">📷</div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">No screenshots logged for this period</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto p-1">
                        {memberScreenshots.map((s) => (
                          <div key={s._id} onClick={() => setLightboxScreenshot(s)}
                            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer aspect-video relative">
                            <img
                              src={getScreenshotImageUrl(s)}
                              alt="Screenshot"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5FcnJvcjwvdGV4dD48L3N2Zz4="; }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">🔍 VIEW</span>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 bg-black/65 text-white text-[9px] p-1.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                              {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX SCREENSHOT MODAL ── */}
      {lightboxScreenshot && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4 md:p-10" onClick={() => setLightboxScreenshot(null)}>
          <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxScreenshot(null)} className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold z-10 hover:scale-110 transition-transform">✕</button>
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
                <img src={getScreenshotImageUrl(lightboxScreenshot)} alt="Fullscreen" className="max-w-full max-h-[75vh] object-contain" />
              </div>
              <div className="w-full lg:w-72 p-6 space-y-4 flex-shrink-0">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Captured By</h4>
                  <p className="text-base font-bold text-gray-900">{selectedMember.name}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</h4>
                  <p className="text-xs font-semibold text-gray-700">{new Date(lightboxScreenshot.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</h4>
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-gray-400">Source</span>
                      <span className="text-gray-900">{lightboxScreenshot.source.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-gray-400">File Size</span>
                      <span className="text-gray-900">{lightboxScreenshot.formattedSize || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-150">
                  <button onClick={() => window.open(lightboxScreenshot.filePath, '_blank')}
                    className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition-all text-center">
                    OPEN ORIGINAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

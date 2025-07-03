import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DatabaseViewer from "./DatabaseViewer";
import ScreenshotGallery from "./ScreenshotGallery";
import ManagerApproval from "./ManagerApproval";
import "./ManagerDashboard.css";

const ManagerDashboard = () => {
  const { user, token } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    activeToday: 0,
    totalFocusTime: 0,
    totalTasks: 0,
    avgProductivity: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showTeamReport, setShowTeamReport] = useState(false);
  const [showManageTeam, setShowManageTeam] = useState(false);
  const [showScheduleMeeting, setShowScheduleMeeting] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      // Fetch team members from API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/team-members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const fetchedTeamMembers = data.data.teamMembers.map((member) => ({
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          avatar: member.avatar,
          status: member.todayStats.status,
          todayStats: member.todayStats,
        }));

        setTeamMembers(fetchedTeamMembers);

        // Calculate team stats
        const stats = {
          totalMembers: fetchedTeamMembers.length,
          activeToday: fetchedTeamMembers.filter((m) => m.status === "active")
            .length,
          totalFocusTime: fetchedTeamMembers.reduce(
            (sum, m) => sum + m.todayStats.focusTime,
            0
          ),
          totalTasks: fetchedTeamMembers.reduce(
            (sum, m) => sum + m.todayStats.tasksCompleted,
            0
          ),
          avgProductivity:
            fetchedTeamMembers.length > 0
              ? Math.round(
                  fetchedTeamMembers.reduce(
                    (sum, m) => sum + m.todayStats.productivity,
                    0
                  ) / fetchedTeamMembers.length
                )
              : 0,
        };

        setTeamStats(stats);
      } else {
        // Fallback to mock data if API fails
        console.warn("Failed to fetch team data, using mock data");
        const mockTeamMembers = [
          {
            id: "mock-1",
            name: "Demo Team Member",
            email: "demo.member@example.com",
            avatar: null,
            status: "active",
            todayStats: {
              focusTime: 6.5,
              tasksCompleted: 8,
              pomodoroSessions: 12,
              productivity: 92,
              lastActive: "2 minutes ago",
            },
          },
        ];

        setTeamMembers(mockTeamMembers);
        setTeamStats({
          totalMembers: 1,
          activeToday: 1,
          totalFocusTime: 6.5,
          totalTasks: 8,
          avgProductivity: 92,
        });
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      // Fallback to empty state
      setTeamMembers([]);
      setTeamStats({
        totalMembers: 0,
        activeToday: 0,
        totalFocusTime: 0,
        totalTasks: 0,
        avgProductivity: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    return status === "active" ? "#48bb78" : "#a0aec0";
  };

  const getProductivityColor = (productivity) => {
    if (productivity >= 90) return "#48bb78";
    if (productivity >= 75) return "#ed8936";
    return "#f56565";
  };

  // Manager Action Handlers
  const handleGenerateReport = () => {
    setShowTeamReport(true);
  };

  const handleManageTeam = () => {
    setShowManageTeam(true);
  };

  const handleScheduleMeeting = () => {
    setShowScheduleMeeting(true);
  };

  const handleTeamSettings = () => {
    setShowTeamSettings(true);
  };

  const handleInviteUser = () => {
    setShowInviteUser(true);
  };

  const handleDatabaseViewer = () => {
    setShowDatabaseViewer(true);
  };

  const sendUserInvitation = async (invitationData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/email/user-invitation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invitationData),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Invitation sent successfully to ${
            invitationData.email
          }!\n\nPreview URL: ${
            data.data.emailResult?.previewUrl ||
            "Check console for preview link"
          }`
        );
        fetchTeamData(); // Refresh team data
      } else {
        alert(`❌ Failed to send invitation: ${data.message}`);
      }
    } catch (error) {
      console.error("Invitation sending error:", error);
      alert("❌ Network error while sending invitation. Please try again.");
    }
  };

  const downloadTeamReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      teamStats,
      teamMembers: teamMembers.map((member) => ({
        name: member.name,
        email: member.email,
        status: member.status,
        focusTime: member.todayStats.focusTime.toFixed(1) + "h",
        tasksCompleted: member.todayStats.tasksCompleted,
        pomodoroSessions: member.todayStats.pomodoroSessions,
        productivity: member.todayStats.productivity + "%",
        lastActive: member.todayStats.lastActive,
      })),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `team-report-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const sendTeamEmail = async (subject, message) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/email/team-announcement`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject,
            message,
            recipients: "all",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Email sent successfully to ${
            data.data.sentTo
          } team members!\n\nPreview URL: ${
            data.data.emailResults[0]?.previewUrl ||
            "Check console for preview links"
          }`
        );
      } else {
        alert(`❌ Failed to send email: ${data.message}`);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      alert("❌ Network error while sending email. Please try again.");
    }
  };

  const sendIndividualEmail = async (teamMember, subject, message) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/email/individual-message`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teamMemberId: teamMember.id,
            subject,
            message,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Message sent successfully to ${
            teamMember.name
          }!\n\nPreview URL: ${
            data.data.emailResult?.previewUrl ||
            "Check console for preview link"
          }`
        );
      } else {
        alert(`❌ Failed to send message: ${data.message}`);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      alert("❌ Network error while sending message. Please try again.");
    }
  };

  const sendMeetingInvitations = async (meetingDetails, attendeeIds) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/email/meeting-invitation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingDetails,
            attendeeIds,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          `✅ Meeting invitations sent to ${
            data.data.sentTo
          } attendees!\n\nPreview URL: ${
            data.data.emailResults[0]?.previewUrl ||
            "Check console for preview links"
          }`
        );
      } else {
        alert(`❌ Failed to send invitations: ${data.message}`);
      }
    } catch (error) {
      console.error("Email sending error:", error);
      alert("❌ Network error while sending invitations. Please try again.");
    }
  };

  const handleMemberCardClick = (member) => {
    alert(
      `Viewing detailed stats for ${member.name}:\n\n` +
        `📧 Email: ${member.email}\n` +
        `⏰ Focus Time: ${member.todayStats.focusTime.toFixed(1)}h\n` +
        `✅ Tasks Completed: ${member.todayStats.tasksCompleted}\n` +
        `🍅 Pomodoro Sessions: ${member.todayStats.pomodoroSessions}\n` +
        `📈 Productivity: ${member.todayStats.productivity}%\n` +
        `🕐 Last Active: ${member.todayStats.lastActive}\n` +
        `🟢 Status: ${member.status}`
    );
  };

  if (loading) {
    return (
      <div className="manager-dashboard">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-dashboard">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Manager Dashboard 👨‍💼</h1>
          <p>
            Welcome back, {user?.firstName}! Here's your team's activity
            overview.
          </p>
          <div className="role-badge manager">
            <span className="role-icon">👨‍💼</span>
            Manager
          </div>
        </div>
        <div className="current-time">
          <div className="time">{formatTime(currentTime)}</div>
          <div className="date">{formatDate(currentTime)}</div>
        </div>
      </div>

      <div className="team-overview">
        <h2>📊 Team Overview</h2>
        <div className="team-stats-grid">
          <div className="team-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{teamStats.totalMembers}</div>
              <div className="stat-label">Total Members</div>
            </div>
          </div>

          <div className="team-stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <div className="stat-value">{teamStats.activeToday}</div>
              <div className="stat-label">Active Today</div>
            </div>
          </div>

          <div className="team-stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value">
                {teamStats.totalFocusTime.toFixed(1)}h
              </div>
              <div className="stat-label">Total Focus Time</div>
            </div>
          </div>

          <div className="team-stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{teamStats.totalTasks}</div>
              <div className="stat-label">Tasks Completed</div>
            </div>
          </div>

          <div className="team-stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">{teamStats.avgProductivity}%</div>
              <div className="stat-label">Avg Productivity</div>
            </div>
          </div>
        </div>
      </div>

      <div className="team-members-section">
        <h2>👥 Team Members Activity</h2>
        <div className="team-members-grid">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="member-card clickable"
              onClick={() => handleMemberCardClick(member)}
            >
              <div className="member-header">
                <div className="member-avatar">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(member.status) }}
                  ></div>
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                  <span className="last-active">
                    {member.todayStats.lastActive}
                  </span>
                </div>
              </div>

              <div className="member-stats">
                <div className="member-stat">
                  <span className="stat-icon">⏰</span>
                  <span className="stat-value">
                    {member.todayStats.focusTime}h
                  </span>
                  <span className="stat-label">Focus Time</span>
                </div>

                <div className="member-stat">
                  <span className="stat-icon">✅</span>
                  <span className="stat-value">
                    {member.todayStats.tasksCompleted}
                  </span>
                  <span className="stat-label">Tasks</span>
                </div>

                <div className="member-stat">
                  <span className="stat-icon">🍅</span>
                  <span className="stat-value">
                    {member.todayStats.pomodoroSessions}
                  </span>
                  <span className="stat-label">Pomodoros</span>
                </div>
              </div>

              <div className="productivity-meter">
                <div className="productivity-label">
                  <span>Productivity</span>
                  <span
                    className="productivity-value"
                    style={{
                      color: getProductivityColor(
                        member.todayStats.productivity
                      ),
                    }}
                  >
                    {member.todayStats.productivity}%
                  </span>
                </div>
                <div className="productivity-bar">
                  <div
                    className="productivity-fill"
                    style={{
                      width: `${member.todayStats.productivity}%`,
                      backgroundColor: getProductivityColor(
                        member.todayStats.productivity
                      ),
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="manager-actions">
        <h2>🎯 Manager Actions</h2>
        <div className="action-buttons">
          <button className="action-btn primary" onClick={handleGenerateReport}>
            <span className="icon">📊</span>
            Generate Team Report
          </button>
          <button className="action-btn secondary" onClick={handleInviteUser}>
            <span className="icon">📨</span>
            Invite User
          </button>
          <button className="action-btn secondary" onClick={handleManageTeam}>
            <span className="icon">👥</span>
            Manage Team
          </button>
          <button
            className="action-btn secondary"
            onClick={handleScheduleMeeting}
          >
            <span className="icon">📅</span>
            Schedule Meeting
          </button>
          <button className="action-btn secondary" onClick={handleTeamSettings}>
            <span className="icon">⚙️</span>
            Team Settings
          </button>
          <button
            className="action-btn secondary"
            onClick={handleDatabaseViewer}
          >
            <span className="icon">🗄️</span>
            Database Viewer
          </button>
        </div>
      </div>

      {/* Team Report Modal */}
      {showTeamReport && (
        <div className="modal-overlay" onClick={() => setShowTeamReport(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Team Productivity Report</h3>
              <button
                className="close-btn"
                onClick={() => setShowTeamReport(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="report-summary">
                <h4>Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Total Team Members:</span>
                    <span className="value">{teamStats.totalMembers}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Active Today:</span>
                    <span className="value">{teamStats.activeToday}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Focus Time:</span>
                    <span className="value">
                      {teamStats.totalFocusTime.toFixed(1)}h
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Average Productivity:</span>
                    <span className="value">{teamStats.avgProductivity}%</span>
                  </div>
                </div>
              </div>

              <div className="report-details">
                <h4>Individual Performance</h4>
                <div className="performance-table">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="performance-row">
                      <div className="member-name">{member.name}</div>
                      <div className="performance-stats">
                        <span>
                          Focus: {member.todayStats.focusTime.toFixed(1)}h
                        </span>
                        <span>Tasks: {member.todayStats.tasksCompleted}</span>
                        <span>
                          Productivity: {member.todayStats.productivity}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowTeamReport(false)}
              >
                Close
              </button>
              <button className="btn primary" onClick={downloadTeamReport}>
                Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Team Modal */}
      {showManageTeam && (
        <div className="modal-overlay" onClick={() => setShowManageTeam(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>👥 Manage Team</h3>
              <button
                className="close-btn"
                onClick={() => setShowManageTeam(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="team-management">
                <div className="management-section">
                  <h4>Team Members</h4>
                  <div className="member-list">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="member-item">
                        <div className="member-info">
                          <strong>{member.name}</strong>
                          <span>{member.email}</span>
                          <span className={`status ${member.status}`}>
                            {member.status}
                          </span>
                        </div>
                        <div className="member-actions">
                          <button
                            className="btn-small primary"
                            onClick={() =>
                              sendIndividualEmail(
                                member,
                                "Check-in",
                                `Hi ${member.name}, how is your day going? I wanted to check in and see if you need any support or have any questions about your current tasks.`
                              )
                            }
                          >
                            Send Message
                          </button>
                          <button
                            className="btn-small secondary"
                            onClick={() => handleMemberCardClick(member)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="management-section">
                  <h4>Quick Actions</h4>
                  <div className="quick-actions-grid">
                    <button
                      className="action-card"
                      onClick={() =>
                        sendTeamEmail(
                          "Daily Standup",
                          "Please join our daily standup meeting at 9 AM."
                        )
                      }
                    >
                      <span className="action-icon">📢</span>
                      <span>Send Announcement</span>
                    </button>
                    <button
                      className="action-card"
                      onClick={() =>
                        sendTeamEmail(
                          "Weekly Report",
                          "Please submit your weekly progress report."
                        )
                      }
                    >
                      <span className="action-icon">📝</span>
                      <span>Request Reports</span>
                    </button>
                    <button
                      className="action-card"
                      onClick={() =>
                        alert("Team performance analytics coming soon!")
                      }
                    >
                      <span className="action-icon">📈</span>
                      <span>View Analytics</span>
                    </button>
                    <button
                      className="action-card"
                      onClick={() => alert("Team goals feature coming soon!")}
                    >
                      <span className="action-icon">🎯</span>
                      <span>Set Team Goals</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowManageTeam(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleMeeting && (
        <div
          className="modal-overlay"
          onClick={() => setShowScheduleMeeting(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📅 Schedule Team Meeting</h3>
              <button
                className="close-btn"
                onClick={() => setShowScheduleMeeting(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="meeting-form">
                <div className="form-group">
                  <label>Meeting Title</label>
                  <input
                    type="text"
                    placeholder="Enter meeting title"
                    defaultValue="Team Standup"
                  />
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    defaultValue={new Date(Date.now() + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .slice(0, 16)}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select defaultValue="30">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Meeting Type</label>
                  <select defaultValue="standup">
                    <option value="standup">Daily Standup</option>
                    <option value="review">Sprint Review</option>
                    <option value="planning">Planning Meeting</option>
                    <option value="retrospective">Retrospective</option>
                    <option value="one-on-one">One-on-One</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Agenda</label>
                  <textarea
                    placeholder="Meeting agenda..."
                    defaultValue="1. Progress updates&#10;2. Blockers discussion&#10;3. Next steps"
                  ></textarea>
                </div>
                <div className="attendees-section">
                  <h4>Attendees</h4>
                  <div className="attendees-list">
                    {teamMembers.map((member) => (
                      <label key={member.id} className="attendee-item">
                        <input type="checkbox" defaultChecked />
                        <span>{member.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowScheduleMeeting(false)}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  const form = document.querySelector(".meeting-form");
                  const meetingDetails = {
                    title:
                      form.querySelector('input[type="text"]').value ||
                      "Team Meeting",
                    dateTime: form.querySelector('input[type="datetime-local"]')
                      .value,
                    duration:
                      parseInt(form.querySelector("select").value) || 30,
                    type: form.querySelectorAll("select")[1].value || "standup",
                    agenda:
                      form.querySelector("textarea").value ||
                      "Meeting agenda to be discussed",
                  };

                  const selectedAttendees = Array.from(
                    form.querySelectorAll('input[type="checkbox"]:checked')
                  )
                    .map((checkbox, index) => teamMembers[index]?.id)
                    .filter(Boolean);

                  if (selectedAttendees.length === 0) {
                    alert("Please select at least one attendee");
                    return;
                  }

                  sendMeetingInvitations(meetingDetails, selectedAttendees);
                  setShowScheduleMeeting(false);
                }}
              >
                Send Invitations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Settings Modal */}
      {showTeamSettings && (
        <div
          className="modal-overlay"
          onClick={() => setShowTeamSettings(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Team Settings</h3>
              <button
                className="close-btn"
                onClick={() => setShowTeamSettings(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="settings-form">
                <div className="settings-section">
                  <h4>Work Hours</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Time</label>
                      <input type="time" defaultValue="09:00" />
                    </div>
                    <div className="form-group">
                      <label>End Time</label>
                      <input type="time" defaultValue="17:00" />
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Productivity Goals</h4>
                  <div className="form-group">
                    <label>Daily Focus Time Target (hours)</label>
                    <input type="number" min="1" max="12" defaultValue="6" />
                  </div>
                  <div className="form-group">
                    <label>Daily Task Target</label>
                    <input type="number" min="1" max="20" defaultValue="8" />
                  </div>
                  <div className="form-group">
                    <label>Minimum Productivity Score (%)</label>
                    <input type="number" min="50" max="100" defaultValue="75" />
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Notifications</h4>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked />
                      <span>Daily productivity reports</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked />
                      <span>Low productivity alerts</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" />
                      <span>Weekly team summaries</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked />
                      <span>Meeting reminders</span>
                    </label>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Activity Monitoring</h4>
                  <div className="form-group">
                    <label>Time Tracking Frequency</label>
                    <select defaultValue="15">
                      <option value="5">Every 5 minutes</option>
                      <option value="15">Every 15 minutes</option>
                      <option value="30">Every 30 minutes</option>
                      <option value="60">Every hour</option>
                      <option value="0">Manual only</option>
                    </select>
                  </div>
                  <div className="checkbox-group">
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked />
                      <span>Enable for all team members</span>
                    </label>
                    <label className="checkbox-item">
                      <input type="checkbox" defaultChecked />
                      <span>Track idle time</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowTeamSettings(false)}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowTeamSettings(false);
                  alert("Team settings saved successfully!");
                }}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteUser && (
        <div className="modal-overlay" onClick={() => setShowInviteUser(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📨 Invite New User</h3>
              <button
                className="close-btn"
                onClick={() => setShowInviteUser(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invitation-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    id="inviteFirstName"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    id="inviteLastName"
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    id="inviteEmail"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select id="inviteRole" defaultValue="team_member">
                    <option value="team_member">Team Member</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Temporary Password</label>
                  <input
                    type="text"
                    id="inviteTempPassword"
                    placeholder="Generate or enter password"
                    defaultValue={`TempPass${Math.floor(
                      Math.random() * 1000
                    )}!`}
                  />
                  <small style={{ color: "#666", fontSize: "0.8rem" }}>
                    User will be asked to change this on first login
                  </small>
                </div>
                <div className="invitation-preview">
                  <h4>📧 Email Preview</h4>
                  <p>
                    The user will receive a professional invitation email with:
                  </p>
                  <ul>
                    <li>Welcome message and role assignment</li>
                    <li>Login credentials and instructions</li>
                    <li>Platform overview and benefits</li>
                    <li>Direct link to get started</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowInviteUser(false)}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  const firstName =
                    document.getElementById("inviteFirstName").value;
                  const lastName =
                    document.getElementById("inviteLastName").value;
                  const email = document.getElementById("inviteEmail").value;
                  const role = document.getElementById("inviteRole").value;
                  const tempPassword =
                    document.getElementById("inviteTempPassword").value;

                  if (!firstName || !lastName || !email || !tempPassword) {
                    alert("Please fill in all required fields");
                    return;
                  }

                  const invitationData = {
                    firstName,
                    lastName,
                    email,
                    role,
                    tempPassword,
                  };

                  sendUserInvitation(invitationData);
                  setShowInviteUser(false);
                }}
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Viewer Modal */}
      {showDatabaseViewer && (
        <div
          className="modal-overlay"
          onClick={() => setShowDatabaseViewer(false)}
        >
          <div
            className="modal-content database-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>🗄️ Database Viewer</h3>
              <button
                className="close-btn"
                onClick={() => setShowDatabaseViewer(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body database-modal-body">
              <DatabaseViewer />
            </div>
          </div>
        </div>
      )}

      {/* Member Approval Section */}
      <div className="dashboard-section">
        <ManagerApproval />
      </div>

      {/* Screenshot Gallery Section */}
      <div className="dashboard-section">
        <ScreenshotGallery />
      </div>
    </div>
  );
};

export default ManagerDashboard;

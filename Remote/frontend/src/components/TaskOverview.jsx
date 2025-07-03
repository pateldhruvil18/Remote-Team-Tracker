import { useState } from "react";
import "./TaskOverview.css";

const TaskOverview = () => {
  // Mock data - in real app, this would come from API
  const [tasks] = useState([
    {
      id: 1,
      title: "Complete project proposal",
      status: "in_progress",
      priority: "high",
      dueDate: "2025-06-20",
      progress: 75,
    },
    {
      id: 2,
      title: "Review team performance",
      status: "todo",
      priority: "medium",
      dueDate: "2025-06-22",
      progress: 0,
    },
    {
      id: 3,
      title: "Update documentation",
      status: "in_progress",
      priority: "low",
      dueDate: "2025-06-25",
      progress: 30,
    },
    {
      id: 4,
      title: "Client meeting preparation",
      status: "done",
      priority: "high",
      dueDate: "2025-06-19",
      progress: 100,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "#718096";
      case "in_progress":
        return "#3182ce";
      case "done":
        return "#38a169";
      default:
        return "#718096";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#e53e3e";
      case "medium":
        return "#ed8936";
      case "low":
        return "#38a169";
      default:
        return "#718096";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo":
        return "📋";
      case "in_progress":
        return "⚡";
      case "done":
        return "✅";
      default:
        return "📋";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const activeTasks = tasks.filter((task) => task.status !== "done");
  const completedTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="task-overview">
      <div className="task-header">
        <h2>
          <span className="task-header-icon" title="Task Overview">
            📋
          </span>
          Task Overview
        </h2>
        <button className="add-task-btn">
          <span>+</span> New Task
        </button>
      </div>

      <div className="task-summary">
        <div className="summary-item">
          <span className="summary-number">{activeTasks.length}</span>
          <span className="summary-label">Active</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">{completedTasks.length}</span>
          <span className="summary-label">Completed</span>
        </div>
        <div className="summary-item">
          <span className="summary-number">
            {tasks.filter((t) => t.priority === "high").length}
          </span>
          <span className="summary-label">High Priority</span>
        </div>
      </div>

      <div className="task-sections">
        {activeTasks.length > 0 && (
          <div className="task-section">
            <h3>Active Tasks</h3>
            <div className="task-list">
              {activeTasks.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-main">
                    <div className="task-icon">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span
                          className="task-priority"
                          style={{ color: getPriorityColor(task.priority) }}
                        >
                          {task.priority} priority
                        </span>
                        <span className="task-due">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="task-status"
                      style={{ color: getStatusColor(task.status) }}
                    >
                      {task.status.replace("_", " ")}
                    </div>
                  </div>
                  {task.status === "in_progress" && (
                    <div className="task-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{task.progress}%</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="task-section">
            <h3>Recently Completed</h3>
            <div className="task-list">
              {completedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="task-item completed">
                  <div className="task-main">
                    <div className="task-icon">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className="task-due">
                          Completed {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="task-actions">
        <button className="action-link">View All Tasks →</button>
      </div>
    </div>
  );
};

export default TaskOverview;

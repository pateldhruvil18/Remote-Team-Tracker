import { useState, useEffect } from "react";
import { useAuth } from "../store/AuthContext";
import "./TaskModal.css";

const TaskModal = ({ isOpen, onClose, task, onSave, mode = "create", teamMembers = [] }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    status: "todo",
    assignedTo: user?._id || "",
  });

  useEffect(() => {
    if (task && mode === "edit") {
      let assigneeId = "";
      if (task.assignee) {
        assigneeId = typeof task.assignee === "object" ? task.assignee._id : task.assignee;
      } else if (task.assignedTo) {
        assigneeId = task.assignedTo;
      }

      setFormData({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        status: task.status || "todo",
        assignedTo: assigneeId || user?._id || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        status: "todo",
        assignedTo: user?._id || "",
      });
    }
  }, [task, mode, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, mode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <div className="task-modal-header">
          <h2>{mode === "create" ? "Create New Task" : "Edit Task"}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">
              <span className="label-icon">📝</span>
              Task Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <span className="label-icon">📋</span>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">
                <span className="label-icon">🚩</span>
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">
                <span className="label-icon">📅</span>
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">
                <span className="label-icon">🔄</span>
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {user?.role === "manager" && (
              <div className="form-group">
                <label htmlFor="assignedTo">
                  <span className="label-icon">👤</span>
                  Assign To
                </label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Team Member</option>
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              {mode === "create" ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

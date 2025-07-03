import './TaskCard.css';

const TaskCard = ({ task, onEdit, onDelete, onDragStart, onDragEnd, isDragging }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#e53e3e';
      case 'high': return '#dd6b20';
      case 'medium': return '#d69e2e';
      case 'low': return '#38a169';
      default: return '#718096';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && task.status !== 'done';
  };

  const getProgress = () => {
    if (task.status === 'done') return 100;
    if (task.estimatedHours && task.actualHours) {
      return Math.min(100, (task.actualHours / task.estimatedHours) * 100);
    }
    return 0;
  };

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="task-header">
        <div className="task-priority">
          <span className="priority-icon">{getPriorityIcon(task.priority)}</span>
          <span 
            className="priority-text"
            style={{ color: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>
        
        <div className="task-actions">
          <button className="action-btn edit" onClick={onEdit} title="Edit task">
            ✏️
          </button>
          <button className="action-btn delete" onClick={onDelete} title="Delete task">
            🗑️
          </button>
        </div>
      </div>

      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {(task.estimatedHours || task.actualHours) && (
        <div className="task-progress">
          <div className="progress-info">
            <span className="progress-text">
              {task.actualHours || 0}h / {task.estimatedHours || 0}h
            </span>
            <span className="progress-percentage">
              {Math.round(getProgress())}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="task-footer">
        {task.dueDate && (
          <div className={`task-due ${isOverdue(task.dueDate) ? 'overdue' : ''}`}>
            <span className="due-icon">📅</span>
            <span className="due-text">{formatDate(task.dueDate)}</span>
          </div>
        )}
        
        {task.assignee && (
          <div className="task-assignee">
            <div className="assignee-avatar">
              {task.assignee.firstName?.[0]}{task.assignee.lastName?.[0]}
            </div>
            <span className="assignee-name">
              {task.assignee.firstName} {task.assignee.lastName}
            </span>
          </div>
        )}
      </div>

      {task.comments && task.comments.length > 0 && (
        <div className="task-comments">
          <span className="comments-icon">💬</span>
          <span className="comments-count">{task.comments.length}</span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;

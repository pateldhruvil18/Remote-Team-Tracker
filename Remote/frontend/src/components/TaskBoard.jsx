import { useState } from 'react';
import TaskCard from './TaskCard';
import './TaskBoard.css';

const TaskBoard = ({ tasks, onEditTask, onDeleteTask, onStatusChange }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: '#718096' },
    { id: 'in_progress', title: 'In Progress', color: '#3182ce' },
    { id: 'review', title: 'Review', color: '#ed8936' },
    { id: 'done', title: 'Done', color: '#38a169' }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      onStatusChange(draggedTask._id, newStatus);
    }
    
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No tasks found</h3>
        <p>Create your first task to get started with productivity tracking!</p>
      </div>
    );
  }

  return (
    <div className="task-board">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div
            key={column.id}
            className="task-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="column-header" style={{ '--column-color': column.color }}>
              <h3>{column.title}</h3>
              <span className="task-count">{columnTasks.length}</span>
            </div>
            
            <div className="column-content">
              {columnTasks.length === 0 ? (
                <div className="empty-column">
                  <p>No tasks in {column.title.toLowerCase()}</p>
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task._id)}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedTask?._id === task._id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;

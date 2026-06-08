import { useState } from 'react';
import TaskCard from './TaskCard';

const TaskBoard = ({ tasks, onEditTask, onDeleteTask, onStatusChange }) => {
  const [draggedTask, setDraggedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-black' },
    { id: 'review', title: 'Review', color: 'bg-orange-500' },
    { id: 'done', title: 'Done', color: 'bg-green-600' }
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
      if (onStatusChange) onStatusChange(draggedTask._id, newStatus);
    }
    setDraggedTask(null);
  };

  if (tasks.length === 0) {
    return (
      <div className="py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-900">No tasks found</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">Your board is clear. Create a new task to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {columns.map(column => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div
            key={column.id}
            className="flex flex-col gap-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">{column.title}</h3>
              </div>
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            
            <div className={`flex-1 flex flex-col gap-3 rounded-2xl p-2 transition-colors ${draggedTask ? 'bg-gray-100/50 outline-2 outline-dashed outline-gray-200' : ''}`}>
              {columnTasks.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-gray-200 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Empty</p>
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task._id)}
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={() => setDraggedTask(null)}
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

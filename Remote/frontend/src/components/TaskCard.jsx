import { useState } from "react";
import { useAuth } from "../store/AuthContext";

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onDragStart, onDragEnd, isDragging }) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "high": return "bg-red-50 text-red-600 border-red-100";
      case "medium": return "bg-orange-50 text-orange-600 border-orange-100";
      case "low": return "bg-green-50 text-green-600 border-green-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40 grayscale scale-95' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getPriorityStyles(task.priority)}`}>
          {task.priority}
        </span>
        
        <div className="relative">
          <button onClick={() => setShowActions(!showActions)} className="text-gray-300 hover:text-black transition-colors p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
          </button>
          
          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)}></div>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                <button onClick={() => { onEdit(task); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <span>✏️</span> Edit
                </button>
                <button onClick={() => { onDelete(task._id); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                  <span>🗑️</span> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-black transition-colors line-clamp-2">
        {task.title}
      </h3>
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
              <span>📅</span> {formatDate(task.dueDate)}
            </div>
          )}
          {(task.assignedTo || task.assignee) && (
            <div 
              className="w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-[8px] font-bold ring-2 ring-white"
              title={
                task.assignedToName || 
                (task.assignee && typeof task.assignee === 'object' ? `${task.assignee.firstName} ${task.assignee.lastName}` : '') || 
                (task.assignee && typeof task.assignee === 'string' ? task.assignee : '') ||
                'Assigned User'
              }
            >
              {
                task.assignedToName ? task.assignedToName[0] : 
                (task.assignee && typeof task.assignee === 'object' ? task.assignee.firstName[0] : 'U')
              }
            </div>
          )}
        </div>
        
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 border-none rounded-lg px-2 py-1 focus:ring-0 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <option value="todo">Todo</option>
          <option value="in_progress">Doing</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

export default TaskCard;

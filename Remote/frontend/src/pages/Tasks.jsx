import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import TaskBoard from '../components/TaskBoard';
import TaskModal from '../components/TaskModal';
import apiClient from '../utils/api';
import './Tasks.css';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTasks();
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      // Use mock data if API fails
      setTasks(getMockTasks());
    } finally {
      setLoading(false);
    }
  };

  const getMockTasks = () => [
    {
      _id: '1',
      title: 'Complete project proposal',
      description: 'Write and review the Q2 project proposal document',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2025-06-25',
      estimatedHours: 8,
      actualHours: 5,
      tags: ['proposal', 'urgent'],
      assignee: { firstName: user?.firstName, lastName: user?.lastName },
      creator: { firstName: 'Manager', lastName: 'Demo' },
      createdAt: '2025-06-19',
      comments: []
    },
    {
      _id: '2',
      title: 'Review team performance',
      description: 'Conduct quarterly performance reviews for team members',
      status: 'todo',
      priority: 'medium',
      dueDate: '2025-06-30',
      estimatedHours: 12,
      actualHours: 0,
      tags: ['review', 'hr'],
      assignee: { firstName: user?.firstName, lastName: user?.lastName },
      creator: { firstName: 'Manager', lastName: 'Demo' },
      createdAt: '2025-06-18',
      comments: []
    },
    {
      _id: '3',
      title: 'Update documentation',
      description: 'Update API documentation with latest changes',
      status: 'review',
      priority: 'low',
      dueDate: '2025-07-05',
      estimatedHours: 4,
      actualHours: 3,
      tags: ['documentation', 'api'],
      assignee: { firstName: user?.firstName, lastName: user?.lastName },
      creator: { firstName: user?.firstName, lastName: user?.lastName },
      createdAt: '2025-06-17',
      comments: []
    },
    {
      _id: '4',
      title: 'Client meeting preparation',
      description: 'Prepare presentation and materials for client meeting',
      status: 'done',
      priority: 'high',
      dueDate: '2025-06-20',
      estimatedHours: 6,
      actualHours: 6,
      tags: ['client', 'presentation'],
      assignee: { firstName: user?.firstName, lastName: user?.lastName },
      creator: { firstName: 'Manager', lastName: 'Demo' },
      createdAt: '2025-06-16',
      comments: []
    }
  ];

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        // Update existing task
        const response = await apiClient.updateTask(selectedTask._id, taskData);
        setTasks(tasks.map(task => 
          task._id === selectedTask._id ? response.data.task : task
        ));
      } else {
        // Create new task
        const response = await apiClient.createTask({
          ...taskData,
          assignee: user._id
        });
        setTasks([response.data.task, ...tasks]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save task:', error);
      // For demo purposes, update local state
      if (selectedTask) {
        setTasks(tasks.map(task => 
          task._id === selectedTask._id ? { ...task, ...taskData } : task
        ));
      } else {
        const newTask = {
          _id: Date.now().toString(),
          ...taskData,
          assignee: { firstName: user?.firstName, lastName: user?.lastName },
          creator: { firstName: user?.firstName, lastName: user?.lastName },
          createdAt: new Date().toISOString(),
          comments: [],
          actualHours: 0
        };
        setTasks([newTask, ...tasks]);
      }
      setShowModal(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await apiClient.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
      // For demo purposes, update local state
      setTasks(tasks.filter(task => task._id !== taskId));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await apiClient.updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data.task : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
      // For demo purposes, update local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="tasks-page">
      <Header />
      
      <main className="tasks-content">
        <div className="tasks-header">
          <div className="header-left">
            <h1>📋 Task Management</h1>
            <p>Organize and track your work efficiently</p>
          </div>
          <button className="create-task-btn" onClick={handleCreateTask}>
            <span>+</span> New Task
          </button>
        </div>

        <div className="tasks-stats">
          <div className="stat-item">
            <span className="stat-number">{taskStats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{taskStats.todo}</span>
            <span className="stat-label">To Do</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{taskStats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{taskStats.review}</span>
            <span className="stat-label">Review</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{taskStats.done}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        <div className="tasks-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-tabs">
            {['all', 'todo', 'in_progress', 'review', 'done'].map(status => (
              <button
                key={status}
                className={`filter-tab ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <TaskBoard
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        )}

        {showModal && (
          <TaskModal
            task={selectedTask}
            onSave={handleSaveTask}
            onClose={() => setShowModal(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Tasks;

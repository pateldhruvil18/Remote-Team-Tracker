import { useState, useEffect } from 'react';
import { useAuth } from "../../store/AuthContext";
import TaskBoard from "../../components/TaskBoard";
import TaskModal from "../../components/TaskModal";
import apiClient from '../../api/api';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'manager') {
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTasks();
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/team-members`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data.teamMembers || []);
      }
    } catch (e) {
      console.error("Failed to fetch team members:", e);
    }
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const handleSaveTask = async (formData, mode) => {
    try {
      const payload = {
        ...formData,
        assignee: formData.assignedTo || formData.assignee
      };
      if (mode === 'edit') {
        await apiClient.updateTask(selectedTask._id, payload);
      } else {
        await apiClient.createTask(payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(error.message || 'Failed to save task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await apiClient.updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await apiClient.deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">TASK BOARD</h1>
            <p className="text-gray-500 font-medium mt-1">Manage, track and execute your team workflows.</p>
          </div>
          
          <button
            onClick={handleCreateTask}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center gap-2 w-max"
          >
            <span>✚</span> NEW TASK
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Tasks", count: tasks.length, color: "border-gray-200 text-gray-900 bg-white" },
            { label: "To Do", count: tasks.filter(t => t.status === "todo").length, color: "border-gray-200 text-gray-500 bg-white" },
            { label: "In Progress", count: tasks.filter(t => t.status === "in_progress").length, color: "border-black text-black bg-black/5" },
            { label: "In Review", count: tasks.filter(t => t.status === "review").length, color: "border-orange-200 text-orange-600 bg-orange-50/50" },
            { label: "Completed", count: tasks.filter(t => t.status === "done" || t.status === "completed").length, color: "border-green-200 text-green-600 bg-green-50/50" },
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${stat.color} shadow-sm transition-all hover:shadow-md`}>
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{stat.label}</div>
              <div className="text-3xl font-black mt-2">{stat.count}</div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-max">
            {['all', 'todo', 'in_progress', 'completed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === f ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium italic">Loading task board...</p>
          </div>
        ) : (
          <TaskBoard 
            tasks={filteredTasks} 
            onEditTask={handleEditTask} 
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onTaskUpdated={fetchTasks}
          />
        )}
      </main>

      <TaskModal
        isOpen={showModal}
        task={selectedTask}
        mode={selectedTask ? 'edit' : 'create'}
        teamMembers={teamMembers}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
      />

      <footer className="py-8 text-center border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Remote Tracker · Operational Intelligence Suite
        </p>
      </footer>
    </div>
  );
};

export default Tasks;

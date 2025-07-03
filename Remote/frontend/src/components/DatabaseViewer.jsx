import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './DatabaseViewer.css';

const DatabaseViewer = () => {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'manager') {
      fetchDatabaseOverview();
      fetchUsers();
    }
  }, [user]);

  const fetchDatabaseOverview = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/database/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching database overview:', error);
      setError('Failed to fetch database overview');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/database/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/database/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        alert(`User ${userName} deleted successfully`);
        fetchUsers();
        fetchDatabaseOverview();
      } else {
        alert(`Failed to delete user: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'manager') {
    return (
      <div className="database-viewer">
        <div className="access-denied">
          <h2>🔒 Access Denied</h2>
          <p>Only managers can view database information.</p>
        </div>
      </div>
    );
  }

  if (loading && !overview) {
    return (
      <div className="database-viewer">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading database information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="database-viewer">
      <div className="database-header">
        <h1>🗄️ Database Viewer</h1>
        <p>View and manage your Team Tracker database</p>
      </div>

      <div className="database-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          {error}
        </div>
      )}

      {activeTab === 'overview' && overview && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{overview.overview.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-info">
                <h3>{overview.overview.managersCount}</h3>
                <p>Managers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <h3>{overview.overview.teamMembersCount}</h3>
                <p>Team Members</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{overview.overview.activeUsersCount}</h3>
                <p>Active Users</p>
              </div>
            </div>
          </div>

          <div className="collections-section">
            <h3>📁 Database Collections</h3>
            <div className="collections-grid">
              {overview.collections.map((collection, index) => (
                <div key={index} className="collection-card">
                  <div className="collection-name">{collection.name}</div>
                  <div className="collection-count">{collection.count} documents</div>
                </div>
              ))}
            </div>
          </div>

          <div className="recent-activity">
            <h3>🕒 Recent Activity</h3>
            <div className="activity-list">
              {overview.recentActivity.map((user, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {user.role === 'manager' ? '👑' : '👤'}
                  </div>
                  <div className="activity-info">
                    <strong>{user.name}</strong>
                    <span className="activity-email">{user.email}</span>
                    <span className="activity-date">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="activity-role">{user.role}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="users-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
              />
              <button onClick={fetchUsers}>🔍</button>
            </div>
            <div className="filter-box">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="manager">Managers</option>
                <option value="team_member">Team Members</option>
              </select>
            </div>
          </div>

          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">User</div>
              <div className="header-cell">Email</div>
              <div className="header-cell">Role</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Created</div>
              <div className="header-cell">Actions</div>
            </div>
            {users.map((user) => (
              <div key={user.id} className="table-row">
                <div className="table-cell">
                  <div className="user-info">
                    <div className="user-icon">
                      {user.role === 'manager' ? '👑' : '👤'}
                    </div>
                    <div>
                      <strong>{user.firstName} {user.lastName}</strong>
                    </div>
                  </div>
                </div>
                <div className="table-cell">{user.email}</div>
                <div className="table-cell">
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'manager' ? 'Manager' : 'Team Member'}
                  </span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="table-cell">{formatDate(user.createdAt)}</div>
                <div className="table-cell">
                  {user.role !== 'manager' && (
                    <button 
                      className="delete-btn"
                      onClick={() => deleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseViewer;

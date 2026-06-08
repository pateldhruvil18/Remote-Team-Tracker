import { useState, useEffect } from 'react';
import { useAuth } from "../store/AuthContext";

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
  }, [user, roleFilter, searchTerm]);

  const fetchDatabaseOverview = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/database/overview`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) setOverview(data.data);
      else setError(data.message);
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) setUsers(data.data.users);
      else setError(data.message);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'manager') {
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-xl border border-red-100">
        Access Denied. Only managers can view database details.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{overview.totalUsers}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Total Users</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{overview.activeUsers}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Active Users</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{overview.roles?.manager || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Managers</div>
          </div>
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{overview.roles?.team_member || 0}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Team Members</div>
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900">User Directory</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
              <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-sm transition-all w-full sm:w-48" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black bg-white text-sm transition-all">
              <option value="all">All Roles</option>
              <option value="manager">Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Fetching users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">No users found match your criteria.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xs">
                            {u.firstName?.[0]}{u.lastName?.[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs font-medium text-gray-700">{u.isActive ? 'Active' : 'Deactivated'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseViewer;

import { useState, useEffect } from 'react';
import { useAuth } from "../store/AuthContext";

const ManagerApproval = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPendingApprovals();
    fetchAllMembers();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/pending-approvals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.data.pendingMembers || []);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/all-members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllMembers(data.data.members || []);
        setStats(data.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching all members:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveMember = async (memberId) => {
    try {
      setActionLoading(memberId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/approve-member/${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        await fetchPendingApprovals();
        await fetchAllMembers();
      }
    } catch (error) {
      console.error('Error approving member:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectMember = async (memberId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return;
    try {
      setActionLoading(memberId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/reject-member/${memberId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (response.ok) {
        await fetchPendingApprovals();
        await fetchAllMembers();
      }
    } catch (error) {
      console.error('Error rejecting member:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getFilteredMembers = () => {
    switch (activeTab) {
      case 'pending': return allMembers.filter(m => m.approvalStatus === 'pending');
      case 'approved': return allMembers.filter(m => m.approvalStatus === 'approved');
      case 'rejected': return allMembers.filter(m => m.approvalStatus === 'rejected');
      default: return allMembers;
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-gray-500 font-medium">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', val: stats.total, color: 'bg-gray-100', text: 'text-gray-900', icon: '👥' },
          { label: 'Pending Approval', val: stats.pending, color: 'bg-orange-50', text: 'text-orange-700', icon: '⏳' },
          { label: 'Approved', val: stats.approved, color: 'bg-green-50', text: 'text-green-700', icon: '✅' },
          { label: 'Rejected', val: stats.rejected, color: 'bg-red-50', text: 'text-red-700', icon: '❌' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center`}>
            <div className="text-xl mb-2">{s.icon}</div>
            <div className={`text-2xl font-black ${s.text}`}>{s.val}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions for Pending */}
      {pendingApprovals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">⚡ Action Required: Pending Approvals</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingApprovals.map((member) => (
              <div key={member._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-sm">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</h4>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveMember(member._id)}
                    disabled={actionLoading === member._id}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                  >
                    {actionLoading === member._id ? '⏳' : 'Approve'}
                  </button>
                  <button
                    onClick={() => rejectMember(member._id)}
                    disabled={actionLoading === member._id}
                    className="px-4 py-2 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {actionLoading === member._id ? '⏳' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Team Directory</h3>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {['pending', 'approved', 'rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {getFilteredMembers().map((member) => (
                <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{member.firstName} {member.lastName}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      member.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                      member.approvalStatus === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {member.approvalStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{member.department || '—'}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{formatDate(member.createdAt)}</td>
                  <td className="px-6 py-4">
                    {member.approvalStatus === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => approveMember(member._id)} className="text-green-600 hover:text-green-700 font-bold">Approve</button>
                        <button onClick={() => rejectMember(member._id)} className="text-red-600 hover:text-red-700 font-bold">Reject</button>
                      </div>
                    )}
                    {member.approvalStatus === 'rejected' && (
                      <span className="text-gray-400 italic text-xs">Rejected</span>
                    )}
                    {member.approvalStatus === 'approved' && (
                      <span className="text-gray-400 italic text-xs">Active Member</span>
                    )}
                  </td>
                </tr>
              ))}
              {getFilteredMembers().length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No members found with this status.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerApproval;

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ManagerApproval.css';

/**
 * Manager Approval Component
 * Allows manager to approve/reject team member registrations
 */
const ManagerApproval = () => {
  const { user } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchPendingApprovals();
    fetchAllMembers();
  }, []);

  /**
   * Fetch pending approval requests
   */
  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/pending-approvals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data.data.pendingMembers || []);
      } else {
        console.error('Failed to fetch pending approvals');
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    }
  };

  /**
   * Fetch all team members
   */
  const fetchAllMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/all-members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllMembers(data.data.members || []);
        setStats(data.data.stats || {});
      } else {
        console.error('Failed to fetch all members');
      }
    } catch (error) {
      console.error('Error fetching all members:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve a team member
   */
  const approveMember = async (memberId) => {
    try {
      setActionLoading(memberId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/approve-member/${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh data
        await fetchPendingApprovals();
        await fetchAllMembers();
        alert('Member approved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to approve member: ${error.message}`);
      }
    } catch (error) {
      console.error('Error approving member:', error);
      alert('Failed to approve member. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Reject a team member
   */
  const rejectMember = async (memberId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(memberId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/manager/reject-member/${memberId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        // Refresh data
        await fetchPendingApprovals();
        await fetchAllMembers();
        alert('Member rejected successfully.');
      } else {
        const error = await response.json();
        alert(`Failed to reject member: ${error.message}`);
      }
    } catch (error) {
      console.error('Error rejecting member:', error);
      alert('Failed to reject member. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-unknown';
    }
  };

  /**
   * Filter members by status
   */
  const getFilteredMembers = () => {
    switch (activeTab) {
      case 'pending':
        return allMembers.filter(m => m.approvalStatus === 'pending');
      case 'approved':
        return allMembers.filter(m => m.approvalStatus === 'approved');
      case 'rejected':
        return allMembers.filter(m => m.approvalStatus === 'rejected');
      default:
        return allMembers;
    }
  };

  if (loading) {
    return (
      <div className="manager-approval">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading approval dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manager-approval">
      <div className="approval-header">
        <h2>👥 Member Approval Management</h2>
        <p>Review and manage team member registration requests</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending Approval</p>
          </div>
        </div>
        
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Quick Actions for Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="quick-actions">
          <h3>⚡ Quick Actions - Pending Approvals ({pendingApprovals.length})</h3>
          <div className="pending-cards">
            {pendingApprovals.map((member) => (
              <div key={member._id} className="pending-card">
                <div className="member-info">
                  <h4>{member.firstName} {member.lastName}</h4>
                  <p className="member-email">{member.email}</p>
                  <p className="member-details">
                    {member.department && <span>📋 {member.department}</span>}
                    {member.jobTitle && <span>💼 {member.jobTitle}</span>}
                  </p>
                  <p className="registration-date">
                    📅 Registered: {formatDate(member.createdAt)}
                  </p>
                </div>
                
                <div className="action-buttons">
                  <button
                    className="btn btn-approve"
                    onClick={() => approveMember(member._id)}
                    disabled={actionLoading === member._id}
                  >
                    {actionLoading === member._id ? '⏳' : '✅'} Approve
                  </button>
                  
                  <button
                    className="btn btn-reject"
                    onClick={() => rejectMember(member._id)}
                    disabled={actionLoading === member._id}
                  >
                    {actionLoading === member._id ? '⏳' : '❌'} Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Members Section with Tabs */}
      <div className="members-section">
        <div className="section-header">
          <h3>📋 All Team Members</h3>
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved ({stats.approved})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>

        {getFilteredMembers().length === 0 ? (
          <div className="empty-state">
            <p>No members found for the selected filter.</p>
          </div>
        ) : (
          <div className="members-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredMembers().map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="member-name">
                        {member.firstName} {member.lastName}
                        {member.jobTitle && <span className="job-title">{member.jobTitle}</span>}
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.department || 'Not specified'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(member.approvalStatus)}`}>
                        {member.approvalStatus}
                      </span>
                    </td>
                    <td>{formatDate(member.createdAt)}</td>
                    <td>{member.lastLogin ? formatDate(member.lastLogin) : 'Never'}</td>
                    <td>
                      {member.approvalStatus === 'pending' && (
                        <div className="table-actions">
                          <button
                            className="btn-small btn-approve"
                            onClick={() => approveMember(member._id)}
                            disabled={actionLoading === member._id}
                          >
                            ✅
                          </button>
                          <button
                            className="btn-small btn-reject"
                            onClick={() => rejectMember(member._id)}
                            disabled={actionLoading === member._id}
                          >
                            ❌
                          </button>
                        </div>
                      )}
                      {member.approvalStatus === 'rejected' && member.rejectionReason && (
                        <span className="rejection-reason" title={member.rejectionReason}>
                          ℹ️
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerApproval;

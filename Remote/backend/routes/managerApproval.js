const express = require('express');
const { authenticate, requireManager } = require('../middleware/auth');
const { User } = require('../models');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

/**
 * @route GET /api/manager/pending-approvals
 * @desc Get all pending approval requests for manager
 * @access Private (Manager only)
 */
router.get('/pending-approvals', authenticate, requireManager, async (req, res) => {
  try {
    const pendingMembers = await User.find({
      role: 'team_member',
      approvalStatus: 'pending'
    }).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        pendingMembers,
        count: pendingMembers.length
      }
    });

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending approvals',
      error: error.message
    });
  }
});

/**
 * @route POST /api/manager/approve-member/:memberId
 * @desc Approve a team member
 * @access Private (Manager only)
 */
router.post('/approve-member/:memberId', authenticate, requireManager, async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Find the member
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Check if member is team_member role
    if (member.role !== 'team_member') {
      return res.status(400).json({
        success: false,
        message: 'Only team members can be approved'
      });
    }

    // Check if already approved
    if (member.approvalStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Member is already approved'
      });
    }

    // Approve the member
    member.approvalStatus = 'approved';
    member.approvedBy = req.user.id;
    member.approvedAt = new Date();
    member.rejectionReason = null;
    
    await member.save();

    // Send approval email to member
    try {
      await sendEmail(
        member.email,
        'Account Approved - Welcome to Team Tracker',
        `
        <h2>🎉 Your Account Has Been Approved!</h2>
        <p>Dear ${member.firstName} ${member.lastName},</p>
        <p>Great news! Your Team Tracker account has been approved by the manager.</p>
        <p>You can now access the system and start using all features:</p>
        <ul>
          <li>📋 Task Management</li>
          <li>🍅 Pomodoro Timer</li>
          <li>📸 Screenshot Monitoring</li>
          <li>📊 Productivity Analytics</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Team Tracker</a></p>
        <p>If you have any questions, please contact the manager at dhchaudhary973@gmail.com.</p>
        <p>Best regards,<br>Team Tracker System</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({
      success: true,
      message: 'Member approved successfully',
      data: {
        member: {
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          approvalStatus: member.approvalStatus,
          approvedAt: member.approvedAt
        }
      }
    });

  } catch (error) {
    console.error('Approve member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve member',
      error: error.message
    });
  }
});

/**
 * @route POST /api/manager/reject-member/:memberId
 * @desc Reject a team member
 * @access Private (Manager only)
 */
router.post('/reject-member/:memberId', authenticate, requireManager, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { reason } = req.body;
    
    // Find the member
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Check if member is team_member role
    if (member.role !== 'team_member') {
      return res.status(400).json({
        success: false,
        message: 'Only team members can be rejected'
      });
    }

    // Reject the member
    member.approvalStatus = 'rejected';
    member.rejectionReason = reason || 'No reason provided';
    member.approvedBy = null;
    member.approvedAt = null;
    
    await member.save();

    // Send rejection email to member
    try {
      await sendEmail(
        member.email,
        'Account Application Update - Team Tracker',
        `
        <h2>Account Application Update</h2>
        <p>Dear ${member.firstName} ${member.lastName},</p>
        <p>We regret to inform you that your Team Tracker account application has not been approved at this time.</p>
        <p><strong>Reason:</strong> ${reason || 'No specific reason provided'}</p>
        <p>If you believe this is an error or would like to discuss this decision, please contact the manager at dhchaudhary973@gmail.com.</p>
        <p>You may reapply in the future if circumstances change.</p>
        <p>Best regards,<br>Team Tracker System</p>
        `
      );
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.json({
      success: true,
      message: 'Member rejected successfully',
      data: {
        member: {
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          approvalStatus: member.approvalStatus,
          rejectionReason: member.rejectionReason
        }
      }
    });

  } catch (error) {
    console.error('Reject member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject member',
      error: error.message
    });
  }
});

/**
 * @route GET /api/manager/all-members
 * @desc Get all team members with their approval status
 * @access Private (Manager only)
 */
router.get('/all-members', authenticate, requireManager, async (req, res) => {
  try {
    const { status } = req.query; // Filter by approval status if provided
    
    let query = { role: 'team_member' };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.approvalStatus = status;
    }

    const members = await User.find(query)
      .select('-password')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const stats = {
      total: members.length,
      approved: members.filter(m => m.approvalStatus === 'approved').length,
      pending: members.filter(m => m.approvalStatus === 'pending').length,
      rejected: members.filter(m => m.approvalStatus === 'rejected').length
    };

    res.json({
      success: true,
      data: {
        members,
        stats
      }
    });

  } catch (error) {
    console.error('Get all members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve team members',
      error: error.message
    });
  }
});

/**
 * @route GET /api/manager/approval-stats
 * @desc Get approval statistics
 * @access Private (Manager only)
 */
router.get('/approval-stats', authenticate, requireManager, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: 'team_member' }
      },
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    // Get recent registrations (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      role: 'team_member',
      createdAt: { $gte: weekAgo }
    });

    res.json({
      success: true,
      data: {
        approvalStats: formattedStats,
        recentRegistrations,
        period: '7 days'
      }
    });

  } catch (error) {
    console.error('Get approval stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approval statistics',
      error: error.message
    });
  }
});

module.exports = router;

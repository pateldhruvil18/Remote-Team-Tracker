const emailService = require('../services/emailService');
const User = require('../models/User');

/**
 * Send team announcement email
 */
const sendTeamAnnouncement = async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;
    const manager = req.user;

    // Validate manager role
    if (manager.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can send team announcements'
      });
    }

    // Get team members
    let teamMembers;
    if (recipients === 'all') {
      teamMembers = await User.find({
        role: 'team_member',
        _id: { $ne: manager._id }
      }).select('firstName lastName email');
    } else if (Array.isArray(recipients)) {
      teamMembers = await User.find({
        _id: { $in: recipients }
      }).select('firstName lastName email');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipients specified'
      });
    }

    if (teamMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No team members found to send announcement'
      });
    }

    // Send emails
    const emailResults = await emailService.sendTeamAnnouncement(
      manager,
      teamMembers,
      subject,
      message
    );

    res.json({
      success: true,
      message: `Announcement sent to ${teamMembers.length} team members`,
      data: {
        sentTo: teamMembers.length,
        recipients: teamMembers.map(m => m.email),
        emailResults
      }
    });
  } catch (error) {
    console.error('Send team announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send team announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send individual message to team member
 */
const sendIndividualMessage = async (req, res) => {
  try {
    const { teamMemberId, subject, message } = req.body;
    const manager = req.user;

    // Validate manager role
    if (manager.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can send individual messages'
      });
    }

    // Get team member
    const teamMember = await User.findById(teamMemberId)
      .select('firstName lastName email');

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Send email
    const emailResult = await emailService.sendIndividualMessage(
      manager,
      teamMember,
      subject,
      message
    );

    res.json({
      success: true,
      message: `Message sent to ${teamMember.firstName} ${teamMember.lastName}`,
      data: {
        recipient: teamMember.email,
        emailResult
      }
    });
  } catch (error) {
    console.error('Send individual message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send individual message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send meeting invitation
 */
const sendMeetingInvitation = async (req, res) => {
  try {
    const { meetingDetails, attendeeIds } = req.body;
    const organizer = req.user;

    // Validate organizer role
    if (organizer.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can send meeting invitations'
      });
    }

    // Get attendees
    const attendees = await User.find({
      _id: { $in: attendeeIds }
    }).select('firstName lastName email');

    if (attendees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid attendees found'
      });
    }

    // Send meeting invitations
    const emailResults = await emailService.sendMeetingInvitation(
      organizer,
      attendees,
      meetingDetails
    );

    res.json({
      success: true,
      message: `Meeting invitation sent to ${attendees.length} attendees`,
      data: {
        sentTo: attendees.length,
        attendees: attendees.map(a => a.email),
        emailResults
      }
    });
  } catch (error) {
    console.error('Send meeting invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meeting invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send productivity report
 */
const sendProductivityReport = async (req, res) => {
  try {
    const { teamMemberId, reportData } = req.body;
    const manager = req.user;

    // Validate manager role
    if (manager.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can send productivity reports'
      });
    }

    // Get team member
    const teamMember = await User.findById(teamMemberId)
      .select('firstName lastName email');

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Send productivity report
    const emailResult = await emailService.sendProductivityReport(
      manager,
      teamMember,
      reportData
    );

    res.json({
      success: true,
      message: `Productivity report sent to ${teamMember.firstName} ${teamMember.lastName}`,
      data: {
        recipient: teamMember.email,
        emailResult
      }
    });
  } catch (error) {
    console.error('Send productivity report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send productivity report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send invitation email for new user
 */
const sendUserInvitation = async (req, res) => {
  try {
    const { email, firstName, lastName, role, tempPassword } = req.body;
    const invitedBy = req.user;

    // Validate manager role for invitations
    if (invitedBy.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can send user invitations'
      });
    }

    // Send invitation email
    const emailResult = await emailService.sendInvitationEmail(
      invitedBy,
      email,
      tempPassword,
      role
    );

    res.json({
      success: true,
      message: `Invitation sent to ${email}`,
      data: {
        recipient: email,
        emailResult
      }
    });
  } catch (error) {
    console.error('Send user invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send user invitation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send low productivity alert
 */
const sendLowProductivityAlert = async (req, res) => {
  try {
    const { teamMemberId, productivityScore } = req.body;
    const manager = req.user;

    // Validate manager role
    if (manager.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Only managers can send productivity alerts'
      });
    }

    // Get team member
    const teamMember = await User.findById(teamMemberId)
      .select('firstName lastName email');

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Send low productivity alert
    const emailResult = await emailService.sendLowProductivityAlert(
      manager,
      teamMember,
      productivityScore
    );

    res.json({
      success: true,
      message: `Productivity alert sent to ${teamMember.firstName} ${teamMember.lastName}`,
      data: {
        recipient: teamMember.email,
        emailResult
      }
    });
  } catch (error) {
    console.error('Send productivity alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send productivity alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendTeamAnnouncement,
  sendIndividualMessage,
  sendMeetingInvitation,
  sendProductivityReport,
  sendUserInvitation,
  sendLowProductivityAlert
};

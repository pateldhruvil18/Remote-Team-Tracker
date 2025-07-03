const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.setupEmailTransporter();
  }

  async setupEmailTransporter() {
    try {
      // Check if we have real email credentials
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        console.log("📧 Attempting to configure Gmail SMTP...");

        // Test Gmail configuration first
        const gmailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // Use App Password for Gmail
          },
        });

        // Verify the connection
        try {
          await gmailTransporter.verify();
          this.transporter = gmailTransporter;
          console.log("✅ Gmail SMTP configured successfully");
          return;
        } catch (gmailError) {
          console.error(
            "❌ Gmail SMTP verification failed:",
            gmailError.message
          );
          console.log("🔄 Falling back to test email service...");
        }
      }

      // Fallback to Ethereal for testing
      console.log("📧 Setting up test email service (Ethereal)...");
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log("✅ Test email service configured (Ethereal)");
      console.log("⚠️  To send real emails, configure valid Gmail credentials");
      console.log(
        "📧 Test emails will be available at: https://ethereal.email"
      );
    } catch (error) {
      console.error("❌ Email service setup error:", error);
      // Create a basic fallback transporter
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@ethereal.email",
          pass: "test123",
        },
      });
      console.log("⚠️  Using basic fallback email configuration");
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user, tempPassword = null) {
    const subject = "🎉 Welcome to Productivity Tracker!";
    const html = this.getWelcomeEmailTemplate(user, tempPassword);

    return this.sendEmail(user.email, subject, html);
  }

  // Send invitation email for new team members
  async sendInvitationEmail(invitedBy, newUserEmail, tempPassword, role) {
    const subject = "📨 You've been invited to join our team!";
    const html = this.getInvitationEmailTemplate(
      invitedBy,
      newUserEmail,
      tempPassword,
      role
    );

    return this.sendEmail(newUserEmail, subject, html);
  }

  // Send team announcement from manager
  async sendTeamAnnouncement(manager, teamMembers, subject, message) {
    const emailSubject = `📢 Team Announcement: ${subject}`;
    const html = this.getAnnouncementEmailTemplate(manager, subject, message);

    const emailPromises = teamMembers.map((member) =>
      this.sendEmail(member.email, emailSubject, html)
    );

    return Promise.all(emailPromises);
  }

  // Send individual message from manager to team member
  async sendIndividualMessage(manager, teamMember, subject, message) {
    const emailSubject = `💬 Message from ${manager.firstName} ${manager.lastName}: ${subject}`;
    const html = this.getIndividualMessageTemplate(
      manager,
      teamMember,
      subject,
      message
    );

    return this.sendEmail(teamMember.email, emailSubject, html);
  }

  // Send meeting invitation
  async sendMeetingInvitation(organizer, attendees, meetingDetails) {
    const subject = `📅 Meeting Invitation: ${meetingDetails.title}`;
    const html = this.getMeetingInvitationTemplate(organizer, meetingDetails);

    const emailPromises = attendees.map((attendee) =>
      this.sendEmail(attendee.email, subject, html)
    );

    return Promise.all(emailPromises);
  }

  // Send productivity report
  async sendProductivityReport(manager, teamMember, reportData) {
    const subject = `📊 Your Weekly Productivity Report`;
    const html = this.getProductivityReportTemplate(
      manager,
      teamMember,
      reportData
    );

    return this.sendEmail(teamMember.email, subject, html);
  }

  // Send low productivity alert
  async sendLowProductivityAlert(manager, teamMember, productivityScore) {
    const subject = `⚠️ Productivity Check-in`;
    const html = this.getLowProductivityAlertTemplate(
      manager,
      teamMember,
      productivityScore
    );

    return this.sendEmail(teamMember.email, subject, html);
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const subject = "🔒 Password Reset Request";
    const html = this.getPasswordResetTemplate(user, resetToken);

    return this.sendEmail(user.email, subject, html);
  }

  // Ensure transporter is ready
  async ensureTransporterReady() {
    if (!this.transporter) {
      await this.setupEmailTransporter();
    }
  }

  // Core email sending function
  async sendEmail(to, subject, html) {
    try {
      // Ensure transporter is ready
      await this.ensureTransporterReady();

      const fromEmail =
        process.env.GMAIL_USER ||
        process.env.FROM_EMAIL ||
        "noreply@productivitytracker.com";

      const mailOptions = {
        from: `"Team Tracker" <${fromEmail}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Check if using real email service or test
      const isRealEmail = process.env.GMAIL_USER && process.env.GMAIL_PASS;
      const previewUrl = isRealEmail
        ? null
        : nodemailer.getTestMessageUrl(info);

      if (isRealEmail) {
        console.log(`📧 Real email sent to: ${to}`);
        console.log(`📧 Subject: ${subject}`);
      } else {
        console.log("📧 Test email preview:", previewUrl);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl,
        isRealEmail: isRealEmail,
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Email Templates
  getWelcomeEmailTemplate(user, tempPassword) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .credentials { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Team Tracker!</h1>
            <p>Your journey to better productivity starts here</p>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Welcome to our productivity tracking platform! We're excited to have you on board.</p>
            
            ${
              tempPassword
                ? `
            <div class="credentials">
              <h3>🔑 Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p><em>Please change your password after first login for security.</em></p>
            </div>
            `
                : ""
            }
            
            <h3>🚀 What you can do:</h3>
            <ul>
              <li>📊 Track your daily productivity with Pomodoro timer</li>
              <li>📋 Manage tasks and set priorities</li>
              <li>📈 View detailed analytics and reports</li>
              <li>👥 Collaborate with your team</li>
              <li>⚙️ Customize your productivity settings</li>
            </ul>
            
            <p>Ready to get started?</p>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }" class="button">Login to Your Dashboard</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>The Team Tracker Team</p>
          </div>
          <div class="footer">
            <p>© 2024 Team Tracker. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getInvitationEmailTemplate(invitedBy, newUserEmail, tempPassword, role) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f093fb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .credentials { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107; }
          .inviter { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📨 You're Invited!</h1>
            <p>Join our productivity tracking team</p>
          </div>
          <div class="content">
            <div class="inviter">
              <p><strong>${invitedBy.firstName} ${
      invitedBy.lastName
    }</strong> has invited you to join their team on Team Tracker!</p>
              <p><em>Role: ${
                role === "manager" ? "Manager" : "Team Member"
              }</em></p>
            </div>
            
            <h3>🎯 What is Team Tracker?</h3>
            <p>A comprehensive platform to track productivity, manage tasks, and collaborate with your team effectively.</p>
            
            <div class="credentials">
              <h3>🔑 Your Account Details:</h3>
              <p><strong>Email:</strong> ${newUserEmail}</p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
              <p><strong>Role:</strong> ${
                role === "manager" ? "Manager" : "Team Member"
              }</p>
              <p><em>⚠️ Please change your password after first login.</em></p>
            </div>
            
            <h3>✨ Your Benefits:</h3>
            <ul>
              <li>🍅 Pomodoro timer for focused work sessions</li>
              <li>📊 Personal productivity analytics</li>
              <li>📋 Task management and tracking</li>
              ${
                role === "manager"
                  ? "<li>👥 Team management and oversight</li>"
                  : "<li>👥 Team collaboration features</li>"
              }
              <li>📈 Progress reports and insights</li>
            </ul>
            
            <p>Ready to boost your productivity?</p>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }" class="button">Accept Invitation & Login</a>
            
            <p>Welcome to the team!</p>
            
            <p>Best regards,<br>${invitedBy.firstName} ${
      invitedBy.lastName
    }<br>Team Tracker Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAnnouncementEmailTemplate(manager, subject, message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .announcement { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4facfe; margin: 15px 0; }
          .manager-info { background: #e8f4fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Team Announcement</h1>
            <p>Important message from your manager</p>
          </div>
          <div class="content">
            <div class="manager-info">
              <p><strong>From:</strong> ${manager.firstName} ${
      manager.lastName
    }</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="announcement">
              <h2>${subject}</h2>
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p>If you have any questions about this announcement, please don't hesitate to reach out.</p>
            
            <p>Best regards,<br>${manager.firstName} ${manager.lastName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getIndividualMessageTemplate(manager, teamMember, subject, message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 Personal Message</h1>
            <p>From ${manager.firstName} ${manager.lastName}</p>
          </div>
          <div class="content">
            <p>Hi ${teamMember.firstName},</p>
            
            <div class="message">
              <h3>${subject}</h3>
              <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p>Feel free to reply to this email if you'd like to discuss further.</p>
            
            <p>Best regards,<br>${manager.firstName} ${manager.lastName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getMeetingInvitationTemplate(organizer, meetingDetails) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .meeting-details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .agenda { background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Meeting Invitation</h1>
            <p>You're invited to join our team meeting</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>${organizer.firstName} ${
      organizer.lastName
    } has invited you to a team meeting.</p>
            
            <div class="meeting-details">
              <h3>${meetingDetails.title}</h3>
              <div class="detail-row">
                <strong>Date & Time:</strong>
                <span>${new Date(
                  meetingDetails.dateTime
                ).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <strong>Duration:</strong>
                <span>${meetingDetails.duration} minutes</span>
              </div>
              <div class="detail-row">
                <strong>Type:</strong>
                <span>${meetingDetails.type}</span>
              </div>
              <div class="detail-row">
                <strong>Organizer:</strong>
                <span>${organizer.firstName} ${organizer.lastName}</span>
              </div>
            </div>
            
            ${
              meetingDetails.agenda
                ? `
            <div class="agenda">
              <h4>📋 Agenda:</h4>
              <p>${meetingDetails.agenda.replace(/\n/g, "<br>")}</p>
            </div>
            `
                : ""
            }
            
            <p>Please mark your calendar and join us at the scheduled time.</p>
            
            <p>Best regards,<br>${organizer.firstName} ${organizer.lastName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getProductivityReportTemplate(manager, teamMember, reportData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #11998e; }
          .stat-label { font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your Productivity Report</h1>
            <p>Weekly performance summary</p>
          </div>
          <div class="content">
            <p>Hi ${teamMember.firstName},</p>
            <p>Here's your productivity summary for this week:</p>
            
            <div class="stats">
              <div class="stat-card">
                <div class="stat-value">${reportData.focusTime}h</div>
                <div class="stat-label">Focus Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${reportData.tasksCompleted}</div>
                <div class="stat-label">Tasks Completed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${reportData.productivity}%</div>
                <div class="stat-label">Productivity Score</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${reportData.pomodoroSessions}</div>
                <div class="stat-label">Pomodoro Sessions</div>
              </div>
            </div>
            
            <p><strong>Great job this week!</strong> Keep up the excellent work.</p>
            
            <p>Best regards,<br>${manager.firstName} ${manager.lastName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getLowProductivityAlertTemplate(manager, teamMember, productivityScore) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0; }
          .tips { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Productivity Check-in</h1>
            <p>Let's get back on track together</p>
          </div>
          <div class="content">
            <p>Hi ${teamMember.firstName},</p>
            
            <div class="alert">
              <p>I noticed your productivity score has been at ${productivityScore}% recently. No worries - we all have ups and downs!</p>
            </div>
            
            <div class="tips">
              <h3>💡 Tips to boost productivity:</h3>
              <ul>
                <li>🍅 Try the Pomodoro technique - 25 minutes focused work, 5 minute break</li>
                <li>📋 Break large tasks into smaller, manageable chunks</li>
                <li>🎯 Set clear daily goals and priorities</li>
                <li>💤 Ensure you're getting enough rest</li>
                <li>🚶‍♂️ Take regular breaks and move around</li>
              </ul>
            </div>
            
            <p>Remember, I'm here to support you. Feel free to reach out if you'd like to discuss any challenges or need assistance.</p>
            
            <p>You've got this! 💪</p>
            
            <p>Best regards,<br>${manager.firstName} ${manager.lastName}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetToken) {
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${resetToken}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
            <p>Reset your account password</p>
          </div>
          <div class="content">
            <p>Hi ${user.firstName},</p>
            <p>We received a request to reset your password for your Productivity Tracker account.</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <p><strong>⚠️ Security Notice:</strong></p>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p>Best regards,<br>The Productivity Tracker Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();

const { User, Team, Task, TimeEntry } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const emailService = require("../services/emailService");
const brevoService = require("../services/brevoService");
const crypto = require("crypto");

/**
 * Helper to send verification OTP via Brevo with fallback to local SMTP/Ethereal
 */
const sendVerificationOTP = async (user, otp) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`🔑 [DEVELOPMENT] Verification code for ${user.email}: ${otp}`);
  }

  try {
    await brevoService.sendOTP(user, otp);
    console.log(`✅ OTP email sent via Brevo to ${user.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send OTP via Brevo to ${user.email}:`, error.message);
    console.log(`🔄 Attempting fallback to SMTP/Ethereal email service...`);
    try {
      const result = await emailService.sendOTP(user, otp);
      if (result && result.success) {
        console.log(`✅ OTP email sent via SMTP/Ethereal fallback to ${user.email}`);
        return true;
      }
      throw new Error(result ? result.error : "Unknown fallback error");
    } catch (fallbackError) {
      console.error(`❌ Failed to send OTP via SMTP/Ethereal fallback to ${user.email}:`, fallbackError.message);
      return false;
    }
  }
};

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "team_member",
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if trying to register as manager and one already exists
    if (role === "manager") {
      const existingManager = await User.findOne({ role: "manager" });
      if (existingManager) {
        return res.status(400).json({
          success: false,
          message:
            "A manager already exists in the system. Only one manager is allowed.",
        });
      }
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send verification email
    await sendVerificationOTP(user, otp);

    // Generate tokens (optional here, but keeping for compatibility)

    // Notify manager if team member registered
    if (role === "team_member") {
      const manager = await User.findOne({ role: "manager" });
      if (manager) {
        emailService
          .sendEmail(
            manager.email,
            "New Team Member Registration - Approval Required",
            `
          <h2>New Team Member Registration</h2>
          <p>Dear ${manager.firstName} ${manager.lastName},</p>
          <p>A new team member has registered and requires your approval:</p>
          <p><strong>Member Details:</strong></p>
          <ul>
            <li>Name: ${firstName} ${lastName}</li>
            <li>Email: ${email}</li>
            <li>Registration Date: ${new Date().toLocaleDateString()}</li>
          </ul>
          <p>Please log in to your Manager dashboard to review and approve this member.</p>
          <p><a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Registration</a></p>
          <p>Best regards,<br>Team Tracker System</p>
          `
          )
          .catch((error) => {
            console.error("Failed to send manager notification:", error);
          });
      }
    }

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      needsVerification: true,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password first
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact your administrator.",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Auto-generate and resend OTP so user can verify
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      await sendVerificationOTP(user, otp);

      return res.status(403).json({
        success: false,
        message: "Email not verified. A new OTP has been sent to your email.",
        isVerified: false,
        email: user.email,
      });
    }

    // Check approval status for team members
    if (user.role === "team_member" && user.approvalStatus !== "approved") {
      let message = "";
      let statusCode = 403;

      switch (user.approvalStatus) {
        case "pending":
          message =
            "Your account is pending approval from the manager. Please wait for approval before accessing the system.";
          break;
        case "rejected":
          message = `Your account has been rejected. Reason: ${
            user.rejectionReason || "No reason provided"
          }. Please contact the manager for more information.`;
          break;
        default:
          message =
            "Your account status is unclear. Please contact your administrator.";
      }

      return res.status(statusCode).json({
        success: false,
        message,
        approvalStatus: user.approvalStatus,
        rejectionReason: user.rejectionReason,
        managerContact: "dhchaudhary973@gmail.com",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Remove password from response
    const userResponse = user.toJSON();

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      message: "Token refresh failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      department,
      jobTitle,
      bio,
      location,
      timezone,
      settings,
    } = req.body;

    const updateData = {};

    // Only update provided fields
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (settings !== undefined)
      updateData.settings = { ...req.user.settings, ...settings };

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Change user password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Upload user avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No avatar file provided",
      });
    }

    // Cloudinary provides the URL in req.file.path
    const avatarUrl = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatarUrl,
        user,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload avatar",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // In a more sophisticated implementation, you might want to blacklist the token
    // For now, we'll just send a success response and let the client handle token removal

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get team members (Manager only)
 */
const getTeamMembers = async (req, res) => {
  try {
    // Check if user is a manager
    if (req.user.role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Manager role required.",
      });
    }

    // Get all team members (excluding managers and the current user)
    const teamMembers = await User.find({
      role: "team_member",
      _id: { $ne: req.user._id },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const teamMembersWithActivity = [];
    for (const member of teamMembers) {
      // Find today's time entries
      const timeEntries = await TimeEntry.find({
        user: member._id,
        startTime: { $gte: todayStart, $lte: todayEnd }
      });

      // Find today's completed tasks
      const completedTasks = await Task.find({
        assignee: member._id,
        status: 'done',
        completedDate: { $gte: todayStart, $lte: todayEnd }
      });

      // Calculate focus hours
      const focusTimeMs = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
      const focusTimeHours = parseFloat((focusTimeMs / (1000 * 60 * 60)).toFixed(1));

      // Calculate completed pomodoros
      const pomodoroSessions = timeEntries.filter(entry => 
        entry.type === 'pomodoro' && entry.pomodoroSession?.completed
      ).length;

      const tasksCompletedCount = completedTasks.length;

      // Status: active if they have any time entry with isActive === true
      const hasActiveEntry = timeEntries.some(entry => entry.isActive);
      const status = hasActiveEntry ? 'active' : 'inactive';

      // Productivity score: weighted formula or average
      const productivity = Math.min(100, Math.round(
        (tasksCompletedCount * 25) + (pomodoroSessions * 15) + (focusTimeHours > 0 ? 30 : 0) || 75
      ));

      // Calculate last active string
      let lastActive = 'Never';
      if (member.lastLogin) {
        const diffMs = new Date() - new Date(member.lastLogin);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) lastActive = 'Just now';
        else if (diffMins < 60) lastActive = `${diffMins} minutes ago`;
        else {
          const diffHours = Math.floor(diffMins / 60);
          if (diffHours < 24) lastActive = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
          else lastActive = new Date(member.lastLogin).toLocaleDateString();
        }
      }

      teamMembersWithActivity.push({
        ...member.toJSON(),
        todayStats: {
          focusTime: focusTimeHours,
          tasksCompleted: tasksCompletedCount,
          pomodoroSessions,
          productivity,
          lastActive,
          status
        }
      });
    }

    res.json({
      success: true,
      data: {
        teamMembers: teamMembersWithActivity,
        totalMembers: teamMembersWithActivity.length,
      },
    });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Check if manager exists in the system
 */
const checkManagerExists = async (req, res) => {
  try {
    const existingManager = await User.findOne({ role: "manager" }).select(
      "firstName lastName email"
    );

    res.json({
      success: true,
      data: {
        managerExists: !!existingManager,
        manager: existingManager
          ? {
              name: `${existingManager.firstName} ${existingManager.lastName}`,
              email: existingManager.email,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Check manager exists error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check manager status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send email
    const sent = await sendVerificationOTP(user, otp);
    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please check backend logs or try again.",
      });
    }

    res.json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

/**
 * Request password reset (Forgot Password)
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 for security reasons (don't disclose if email exists or not)
      return res.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    // Save to user schema
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Reset Link
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/#reset-password?token=${resetToken}`;

    // In development/test mode, print to console
    console.log(`\n🔑 [DEVELOPMENT] Password reset link for ${user.email}:`);
    console.log(`${resetUrl}\n`);

    // Send email using emailService (Gmail/Ethereal)
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      console.error("Failed to send password reset email via SMTP:", emailError);
    }

    res.json({
      success: true,
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
    });
  }
};

/**
 * Reset password using token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`✅ Password successfully reset for user: ${user.email}`);

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
  resendOTP,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getTeamMembers,
  logout,
  checkManagerExists,
  forgotPassword,
  resetPassword,
};

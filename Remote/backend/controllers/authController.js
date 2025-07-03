const { User, Team } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwt");
const emailService = require("../services/emailService");

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

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Send welcome email (don't wait for it to complete)
    emailService.sendWelcomeEmail(user).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

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
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken,
        },
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

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact your administrator.",
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

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
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
    const user = await User.findById(decoded.id).populate("team");

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
    const user = await User.findById(req.user._id).populate("team");

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
      .select("-password")
      .populate("team", "name description");

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

    // In a real application, you would upload to a cloud service like AWS S3
    // For now, we'll just store the file path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

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

    // For demo purposes, add some mock activity data
    const teamMembersWithActivity = teamMembers.map((member) => ({
      ...member.toJSON(),
      todayStats: {
        focusTime: Math.random() * 8,
        tasksCompleted: Math.floor(Math.random() * 15),
        pomodoroSessions: Math.floor(Math.random() * 20),
        productivity: Math.floor(Math.random() * 30) + 70,
        lastActive: getRandomLastActive(),
        status: Math.random() > 0.3 ? "active" : "inactive",
      },
    }));

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

// Helper function to generate random last active time
const getRandomLastActive = () => {
  const options = [
    "Just now",
    "2 minutes ago",
    "15 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "4 hours ago",
  ];
  return options[Math.floor(Math.random() * options.length)];
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

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getTeamMembers,
  logout,
  checkManagerExists,
};

const { verifyToken, extractTokenFromHeader } = require("../utils/jwt");
const { User } = require("../models");

/**
 * Middleware to authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by ID from token
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is deactivated",
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    console.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/**
 * Middleware to authorize user based on roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is a manager
 */
const requireManager = authorize("manager");

/**
 * Middleware to check if user is a team member or manager
 */
const requireTeamMember = authorize("team_member", "manager");

/**
 * Middleware to check if user owns the resource or is a manager
 */
const requireOwnershipOrManager = (resourceUserField = "user") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Managers can access any resource
      if (req.user.role === "manager") {
        return next();
      }

      // For other users, check ownership
      const resourceUserId =
        req.params.userId || req.body[resourceUserField] || req.query.userId;

      if (!resourceUserId) {
        return res.status(400).json({
          success: false,
          message: "Resource user ID is required",
        });
      }

      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources.",
        });
      }

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
      });
    }
  };
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Middleware to require approved status
 */
const requireApproved = (req, res, next) => {
  if (req.user.approvalStatus !== "approved") {
    return res.status(403).json({
      success: false,
      message:
        "Account pending approval. Please wait for the manager to approve your account.",
      approvalStatus: req.user.approvalStatus,
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireManager,
  requireTeamMember,
  requireApproved,
  requireOwnershipOrManager,
  optionalAuth,
};

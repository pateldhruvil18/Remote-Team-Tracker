const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { authLimiter } = require("../middleware/security");
const {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
} = require("../middleware/validation");
const { body } = require("express-validator");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "avatar-" +
        req.user._id +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Apply auth rate limiting to all routes
router.use(authLimiter);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validateUserRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validateUserLogin, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  "/refresh",
  [
    body("refreshToken").notEmpty().withMessage("Refresh token is required"),
    handleValidationErrors,
  ],
  authController.refreshToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  "/profile",
  [
    authenticate,
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("settings")
      .optional()
      .isObject()
      .withMessage("Settings must be an object"),
    body("settings.pomodoroLength")
      .optional()
      .isInt({ min: 5, max: 60 })
      .withMessage("Pomodoro length must be between 5 and 60 minutes"),
    body("settings.shortBreakLength")
      .optional()
      .isInt({ min: 1, max: 30 })
      .withMessage("Short break length must be between 1 and 30 minutes"),
    body("settings.longBreakLength")
      .optional()
      .isInt({ min: 5, max: 60 })
      .withMessage("Long break length must be between 5 and 60 minutes"),
    body("settings.autoStartBreaks")
      .optional()
      .isBoolean()
      .withMessage("Auto start breaks must be a boolean"),
    body("settings.autoStartPomodoros")
      .optional()
      .isBoolean()
      .withMessage("Auto start pomodoros must be a boolean"),
    body("settings.notifications")
      .optional()
      .isBoolean()
      .withMessage("Notifications must be a boolean"),
    body("settings.screenshotEnabled")
      .optional()
      .isBoolean()
      .withMessage("Screenshot enabled must be a boolean"),
    handleValidationErrors,
  ],
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  [
    authenticate,
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    handleValidationErrors,
  ],
  authController.changePassword
);

/**
 * @route   POST /api/auth/upload-avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post(
  "/upload-avatar",
  authenticate,
  upload.single("avatar"),
  authController.uploadAvatar
);

/**
 * @route   GET /api/auth/team-members
 * @desc    Get team members (Manager only)
 * @access  Private (Manager)
 */
router.get("/team-members", authenticate, authController.getTeamMembers);

/**
 * @route   GET /api/auth/check-manager
 * @desc    Check if manager exists in the system
 * @access  Public
 */
router.get("/check-manager", authController.checkManagerExists);

module.exports = router;

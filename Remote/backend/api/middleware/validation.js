const { body, param, query, validationResult } = require("express-validator");

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("role")
    .optional()
    .isIn(["manager", "team_member"])
    .withMessage("Role must be either manager or team_member"),

  handleValidationErrors,
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

/**
 * Validation rules for task creation
 */
const validateTaskCreation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "review", "done"])
    .withMessage("Status must be one of: todo, in_progress, review, done"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),

  body("assignee")
    .notEmpty()
    .withMessage("Assignee is required")
    .isMongoId()
    .withMessage("Assignee must be a valid user ID"),

  body("estimatedHours")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Estimated hours must be between 0 and 100"),

  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid date"),

  handleValidationErrors,
];

/**
 * Validation rules for time entry creation
 */
const validateTimeEntryCreation = [
  body("type")
    .notEmpty()
    .withMessage("Time entry type is required")
    .isIn(["manual", "pomodoro", "automatic"])
    .withMessage("Type must be one of: manual, pomodoro, automatic"),

  body("startTime")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid date"),

  body("endTime")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid date"),

  body("task")
    .optional()
    .isMongoId()
    .withMessage("Task must be a valid task ID"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  handleValidationErrors,
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
const validateObjectId = (paramName) => [
  param(paramName).isMongoId().withMessage(`${paramName} must be a valid ID`),

  handleValidationErrors,
];

/**
 * Validation rules for pagination
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sort")
    .optional()
    .isIn([
      "createdAt",
      "-createdAt",
      "updatedAt",
      "-updatedAt",
      "name",
      "-name",
    ])
    .withMessage("Invalid sort parameter"),

  handleValidationErrors,
];

/**
 * Validation rules for date range queries
 */
const validateDateRange = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateTaskCreation,
  validateTimeEntryCreation,
  validateObjectId,
  validatePagination,
  validateDateRange,
};

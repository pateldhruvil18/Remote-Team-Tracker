const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const emailController = require('../controllers/emailController');
const { authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

/**
 * @route   POST /api/email/team-announcement
 * @desc    Send announcement to team members
 * @access  Private (Manager only)
 */
router.post('/team-announcement', [
  authenticate,
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters'),
  body('recipients')
    .notEmpty()
    .withMessage('Recipients are required'),
  handleValidationErrors
], emailController.sendTeamAnnouncement);

/**
 * @route   POST /api/email/individual-message
 * @desc    Send individual message to team member
 * @access  Private (Manager only)
 */
router.post('/individual-message', [
  authenticate,
  body('teamMemberId')
    .notEmpty()
    .withMessage('Team member ID is required')
    .isMongoId()
    .withMessage('Invalid team member ID'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject must be less than 200 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 2000 })
    .withMessage('Message must be less than 2000 characters'),
  handleValidationErrors
], emailController.sendIndividualMessage);

/**
 * @route   POST /api/email/meeting-invitation
 * @desc    Send meeting invitation to attendees
 * @access  Private (Manager only)
 */
router.post('/meeting-invitation', [
  authenticate,
  body('meetingDetails.title')
    .notEmpty()
    .withMessage('Meeting title is required'),
  body('meetingDetails.dateTime')
    .notEmpty()
    .withMessage('Meeting date and time is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('meetingDetails.duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('attendeeIds')
    .isArray({ min: 1 })
    .withMessage('At least one attendee is required'),
  body('attendeeIds.*')
    .isMongoId()
    .withMessage('Invalid attendee ID'),
  handleValidationErrors
], emailController.sendMeetingInvitation);

/**
 * @route   POST /api/email/productivity-report
 * @desc    Send productivity report to team member
 * @access  Private (Manager only)
 */
router.post('/productivity-report', [
  authenticate,
  body('teamMemberId')
    .notEmpty()
    .withMessage('Team member ID is required')
    .isMongoId()
    .withMessage('Invalid team member ID'),
  body('reportData.focusTime')
    .isNumeric()
    .withMessage('Focus time must be a number'),
  body('reportData.tasksCompleted')
    .isInt({ min: 0 })
    .withMessage('Tasks completed must be a non-negative integer'),
  body('reportData.productivity')
    .isInt({ min: 0, max: 100 })
    .withMessage('Productivity must be between 0 and 100'),
  body('reportData.pomodoroSessions')
    .isInt({ min: 0 })
    .withMessage('Pomodoro sessions must be a non-negative integer'),
  handleValidationErrors
], emailController.sendProductivityReport);

/**
 * @route   POST /api/email/user-invitation
 * @desc    Send invitation email to new user
 * @access  Private (Manager only)
 */
router.post('/user-invitation', [
  authenticate,
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(['team_member', 'manager'])
    .withMessage('Role must be either team_member or manager'),
  body('tempPassword')
    .isLength({ min: 6 })
    .withMessage('Temporary password must be at least 6 characters'),
  handleValidationErrors
], emailController.sendUserInvitation);

/**
 * @route   POST /api/email/productivity-alert
 * @desc    Send low productivity alert to team member
 * @access  Private (Manager only)
 */
router.post('/productivity-alert', [
  authenticate,
  body('teamMemberId')
    .notEmpty()
    .withMessage('Team member ID is required')
    .isMongoId()
    .withMessage('Invalid team member ID'),
  body('productivityScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Productivity score must be between 0 and 100'),
  handleValidationErrors
], emailController.sendLowProductivityAlert);

module.exports = router;

const express = require("express");
const router = express.Router();
const timeEntryController = require("../controllers/timeEntryController");
const { authenticate, requireTeamMember } = require("../middleware/auth");
const { validateTimeEntryCreation } = require("../middleware/validation");

// Apply authentication
router.use(authenticate);
router.use(requireTeamMember);

/**
 * @route   POST /api/time-entries
 * @desc    Create a new time entry
 * @access  Private
 */
router.post("/", validateTimeEntryCreation, timeEntryController.createTimeEntry);

/**
 * @route   GET /api/time-entries
 * @desc    Get all time entries for the user
 * @access  Private
 */
router.get("/", timeEntryController.getTimeEntries);

module.exports = router;

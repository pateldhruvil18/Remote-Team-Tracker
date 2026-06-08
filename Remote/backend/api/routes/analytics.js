const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { authenticate, requireTeamMember } = require("../middleware/auth");
const { validateDateRange } = require("../middleware/validation");

// Apply authentication
router.use(authenticate);
router.use(requireTeamMember);

/**
 * @route   GET /api/analytics/productivity
 * @desc    Get user productivity metrics history
 * @access  Private
 */
router.get("/productivity", validateDateRange, analyticsController.getProductivityAnalytics);

module.exports = router;

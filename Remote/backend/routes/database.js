const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/database/overview
 * @desc    Get database overview (Manager only)
 * @access  Private (Manager)
 */
router.get('/overview', authenticate, async (req, res) => {
  try {
    // Check if user is manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    // Get all users
    const users = await User.find({})
      .select('firstName lastName email role isActive createdAt updatedAt')
      .sort({ createdAt: -1 });

    // Get statistics
    const totalUsers = users.length;
    const managers = users.filter(user => user.role === 'manager');
    const teamMembers = users.filter(user => user.role === 'team_member');
    const activeUsers = users.filter(user => user.isActive);

    // Get recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = users.filter(user => user.createdAt > sevenDaysAgo);

    // Get collection statistics
    const collections = await req.user.db.db.listCollections().toArray();
    const collectionStats = [];
    
    for (const collection of collections) {
      try {
        const count = await req.user.db.db.collection(collection.name).countDocuments();
        collectionStats.push({
          name: collection.name,
          count: count
        });
      } catch (error) {
        collectionStats.push({
          name: collection.name,
          count: 0,
          error: 'Could not count documents'
        });
      }
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          managersCount: managers.length,
          teamMembersCount: teamMembers.length,
          activeUsersCount: activeUsers.length,
          recentRegistrations: recentUsers.length
        },
        users: {
          managers: managers.map(user => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          })),
          teamMembers: teamMembers.map(user => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }))
        },
        collections: collectionStats,
        recentActivity: recentUsers.slice(0, 10).map(user => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Database overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get database overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/database/users
 * @desc    Get all users with detailed information (Manager only)
 * @access  Private (Manager)
 */
router.get('/users', authenticate, async (req, res) => {
  try {
    // Check if user is manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    const { page = 1, limit = 20, role, search } = req.query;
    
    // Build query
    let query = {};
    if (role && ['manager', 'team_member'].includes(role)) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('firstName lastName email role isActive createdAt updatedAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/database/users/:id
 * @desc    Delete a user (Manager only)
 * @access  Private (Manager)
 */
router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    // Check if user is manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    const { id } = req.params;

    // Prevent manager from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account.'
      });
    }

    // Find and delete user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent deleting another manager
    if (user.role === 'manager') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete another manager account.'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} deleted successfully.`,
      data: {
        deletedUser: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;

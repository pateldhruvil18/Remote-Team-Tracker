const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

/**
 * Script to show database statistics
 */
async function showDatabaseStats() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team-tracker');
    console.log('📊 Connected to MongoDB');

    console.log('📈 Database Statistics:\n');

    // Total users
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total Users: ${totalUsers}`);

    // Users by role
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📋 Users by Role:');
    roleStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    // Users by approval status
    const approvalStats = await User.aggregate([
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n✅ Users by Approval Status:');
    approvalStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    // Detailed breakdown
    const detailedStats = await User.aggregate([
      {
        $group: {
          _id: {
            role: '$role',
            status: '$approvalStatus'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.role': 1, '_id.status': 1 }
      }
    ]);

    console.log('\n📊 Detailed Breakdown:');
    detailedStats.forEach(stat => {
      console.log(`  ${stat._id.role} (${stat._id.status}): ${stat.count}`);
    });

    // List all users
    const allUsers = await User.find({}).select('firstName lastName email role approvalStatus createdAt');
    
    console.log('\n👤 All Users:');
    allUsers.forEach((user, index) => {
      const createdDate = user.createdAt.toLocaleDateString();
      console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`     Role: ${user.role} | Status: ${user.approvalStatus} | Created: ${createdDate}`);
    });

    console.log('\n🎉 Database statistics completed!');

  } catch (error) {
    console.error('❌ Error getting database statistics:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the stats
showDatabaseStats();

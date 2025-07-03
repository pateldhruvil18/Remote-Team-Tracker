const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

/**
 * Script to create a test user for testing approval workflow
 */
async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/team-tracker');
    console.log('📊 Connected to MongoDB');

    // Create test user data
    const testUserData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'team_member',
      department: 'Testing',
      jobTitle: 'Test Engineer',
      approvalStatus: 'pending',
      isActive: true
    };

    // Check if test user already exists
    const existingUser = await User.findOne({ email: testUserData.email });
    
    if (existingUser) {
      console.log('⚠️ Test user already exists');
      console.log(`Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`Email: ${existingUser.email}`);
      console.log(`Status: ${existingUser.approvalStatus}`);
      return;
    }

    // Create new test user
    const testUser = new User(testUserData);
    await testUser.save();

    console.log('✅ Test user created successfully!');
    console.log(`Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`Email: ${testUser.email}`);
    console.log(`Role: ${testUser.role}`);
    console.log(`Department: ${testUser.department}`);
    console.log(`Status: ${testUser.approvalStatus}`);
    
    console.log('\n📋 You can now:');
    console.log('1. Login as manager to see pending approval');
    console.log('2. Try logging in as testuser@example.com (should be blocked)');
    console.log('3. Approve the user as manager');
    console.log('4. Login as testuser@example.com (should work after approval)');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the script
createTestUser();

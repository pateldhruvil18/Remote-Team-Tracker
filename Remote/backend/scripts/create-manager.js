const mongoose = require("mongoose");
const { User } = require("../api/models");
require("dotenv").config();

async function createManager() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📦 Connected to MongoDB");

    const managerEmail = "dhp204600@gmail.com";
    const managerPassword = "dhp@204600";

    // Demote any other manager to team member
    const demoted = await User.updateMany(
      { role: "manager", email: { $ne: managerEmail } },
      { role: "team_member" }
    );
    if (demoted.modifiedCount > 0) {
      console.log(`🔄 Demoted ${demoted.modifiedCount} other manager(s) to team member`);
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: managerEmail });
    if (existingUser) {
      console.log(
        "👤 Found existing user:",
        existingUser.firstName,
        existingUser.lastName
      );
      console.log("📧 Email:", existingUser.email);
      console.log("🎯 Current Role:", existingUser.role);

      // Update existing user to be manager with new details
      console.log("\n🔄 Updating user to manager with new details...");

      existingUser.firstName = "Dhruvil";
      existingUser.lastName = "Patel";
      existingUser.password = managerPassword;
      existingUser.role = "manager";
      existingUser.isActive = true;
      existingUser.isVerified = true;
      existingUser.approvalStatus = "approved";

      await existingUser.save();

      console.log("\n🎉 User updated to manager successfully!");
      console.log("👤 Name:", existingUser.firstName, existingUser.lastName);
      console.log("📧 Email:", existingUser.email);
      console.log("🎯 Role:", existingUser.role);
      console.log("🆔 ID:", existingUser._id);
    } else {
      // Create new manager
      const managerData = {
        firstName: "Dhruvil",
        lastName: "Patel",
        email: managerEmail,
        password: managerPassword,
        role: "manager",
        isActive: true,
        isVerified: true,
        approvalStatus: "approved"
      };

      const manager = new User(managerData);
      await manager.save();

      console.log("\n🎉 Manager created successfully!");
      console.log("👤 Name:", manager.firstName, manager.lastName);
      console.log("📧 Email:", manager.email);
      console.log("🎯 Role:", manager.role);
      console.log("🆔 ID:", manager._id);
    }

    console.log("\n✅ You can now sign in with:");
    console.log(`📧 Email: ${managerEmail}`);
    console.log(`🔒 Password: ${managerPassword}`);
    console.log("🎯 Role: Manager");
  } catch (error) {
    console.error("❌ Error creating manager:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\n📦 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the script
createManager();

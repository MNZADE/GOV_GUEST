const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createDefaultSystemManager = async () => {
  try {
    const existingAdmin = await User.findOne({ role: "system_manager" });

    if (existingAdmin) {
      console.log("ℹ️ System Manager already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      email: "admin@kmc.gov.in",
      password: hashedPassword,
      role: "system_manager",
    });

    console.log("✅ Default System Manager created");
    console.log("📧 Email: admin@kmc.gov.in");
    console.log("🔑 Password: Admin@123");
  } catch (error) {
    console.error("❌ Failed to create default admin:", error.message);
  }
};

module.exports = createDefaultSystemManager;

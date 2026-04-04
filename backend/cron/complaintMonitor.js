const cron = require("node-cron");
const Complaint = require("../models/Complaint");
const createNotification = require("../utils/createNotification");

module.exports = (io) => {

  // Run every hour
  cron.schedule("0 * * * *", async () => {
    try {

      const complaints = await Complaint.find({
        status: { $ne: "resolved" },
        updatedAt: {
          $lte: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      });

      if (!complaints.length) return;

      await createNotification(io, {
        title: "Department Not Responding",
        message: "No action taken on complaint for 48 hours.",
        type: "urgent",
        recipientRole: "system_manager",
      });

      console.log("⚠ 48-hour escalation triggered");

    } catch (err) {
      console.error("CRON ERROR:", err.message);
    }
  });

};

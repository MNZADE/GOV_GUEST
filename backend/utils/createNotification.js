import Notification from "../models/Notification.js";
import User from "../models/User.js";

const createNotification = async (io = null, data = {}) => {
  try {
    /* ================= SAFE CHECK ================= */
    if (!data || typeof data !== "object") {
      console.log("❌ Invalid notification data");
      return;
    }

    const {
      title,
      message,
      type = "normal",
      complaintId,
      groupId,
      department,
      status = "Pending",
      userIds = [], // optional specific users
    } = data;

    /* ================= VALIDATION ================= */
    if (!title || !message) {
      console.log("⚠️ Missing title or message");
      return;
    }

    /* ================= FORMAT MESSAGE ================= */
    const formattedMessage = `
📢 ${title}

🆔 Complaint ID: ${complaintId || "N/A"}
📦 Group ID: ${groupId || "N/A"}
🏢 Department: ${department || "N/A"}
📊 Status: ${status}

📝 ${message}
    `.trim();

    /* ================= FIND USERS ================= */
    let recipients = [];

    if (userIds.length > 0) {
      recipients = await User.find({
        _id: { $in: userIds },
        isActive: true,
      });
    } else {
      // send to all active users
      recipients = await User.find({ isActive: true });
    }

    if (!recipients.length) {
      console.log("⚠️ No users found");
      return;
    }

    /* ================= CREATE + EMIT ================= */
    for (const user of recipients) {
      const notification = await Notification.create({
        recipientId: user._id,
        title,
        message: formattedMessage,
        type,
        isRead: false,
      });

      /* ================= REAL-TIME ================= */
      if (io) {
        io.to(user._id.toString()).emit("newNotification", notification);
      }
    }

    console.log("✅ Notifications created successfully");

  } catch (err) {
    console.error("❌ CREATE NOTIFICATION ERROR:", err.message);
  }
};

export default createNotification;
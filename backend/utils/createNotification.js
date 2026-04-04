import Notification from "../models/Notification.js";
import User from "../models/User.js";

const createNotification = async (
  io,
  {
    title,
    message,
    type = "normal",
    recipientRole,
  }
) => {
  try {
    // Find all users with given role
    const recipients = await User.find({
      role: recipientRole,
      isActive: true,
    });

    if (!recipients.length) return;

    for (const user of recipients) {
      const notification = await Notification.create({
        user: user._id,
        title,
        message,
        type,
        isRead: false,
      });

      // 🔴 Real-time emit
      io.to(user._id.toString()).emit("newNotification", notification);
    }
  } catch (err) {
    console.error("CREATE NOTIFICATION ERROR:", err.message);
  }
};

// ✅ IMPORTANT
export default createNotification;
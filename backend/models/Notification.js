import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: ["urgent", "normal", "info"],
      default: "normal",
    },

    recipientRole: {
      type: String,
      enum: ["system_manager", "department_manager"],
      required: true,
    },

    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ IMPORTANT
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
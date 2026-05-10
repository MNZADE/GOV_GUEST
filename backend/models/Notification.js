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

    // ✅ Use direct user instead of role
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ optional index (performance)
notificationSchema.index({ recipientId: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
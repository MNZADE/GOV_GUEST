import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: {
    type: String,
    enum: ["general", "alert", "bill"],
    default: "general",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notice", noticeSchema);
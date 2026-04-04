import mongoose from "mongoose";

/* ================= LOGIN HISTORY ================= */
const loginHistorySchema = new mongoose.Schema({
  loginAt: {
    type: Date,
    default: Date.now,
  },
  logoutAt: {
    type: Date,
    default: null,
  },
});

/* ================= MAIN USER SCHEMA ================= */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["system_manager", "department_manager"],
      required: true,
    },

    /* ================= NEW FIELDS (IMPORTANT) ================= */

    address: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      default: "Department Manager",
    },

    personalEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    /* ========================================================= */

    department: {
      type: String,
      default: null,
    },

    enrollmentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    loginHistory: [loginHistorySchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
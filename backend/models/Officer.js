import mongoose from "mongoose";

const officerSchema =
  new mongoose.Schema({

    /* =====================================
       DEPARTMENT
    ===================================== */

    department: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================
       EMPLOYEE ID
    ===================================== */

    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /* =====================================
       NAME
    ===================================== */

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    /* =====================================
       PERSONAL INFO
    ===================================== */

    gender: {
      type: String,
      default: "",
    },

    dob: {
      type: String,
      default: "",
    },

    /* =====================================
       CONTACT
    ===================================== */

    phone: {
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

    /* =====================================
       DESIGNATION
    ===================================== */

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      default: "Field Officer",
    },

    /* =====================================
       JOINING
    ===================================== */

    joiningDate: {
      type: String,
      default: "",
    },

    /* =====================================
       ADDRESS
    ===================================== */

    address: {
      type: String,
      default: "",
    },

    /* =====================================
       STATUS
    ===================================== */

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Suspended",
      ],
      default: "Active",
    },

    /* =====================================
       AVAILABILITY
    ===================================== */

    isBusy: {
      type: Boolean,
      default: false,
    },

    /* =====================================
       CURRENT COMPLAINT
    ===================================== */

    currentComplaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    /* =====================================
       TOTAL ASSIGNED
    ===================================== */

    totalAssigned: {
      type: Number,
      default: 0,
    },

    /* =====================================
       TOTAL RESOLVED
    ===================================== */

    totalResolved: {
      type: Number,
      default: 0,
    },

    /* =====================================
       PROFILE IMAGE
    ===================================== */

    profileImage: {
      type: String,
      default: "",
    },

    /* =====================================
       TIMESTAMPS
    ===================================== */

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  });

/* =========================================
   AUTO UPDATE TIMESTAMP
========================================= */

officerSchema.pre(
  "save",

  function (next) {

    this.updatedAt =
      new Date();

    next();
  }
);

/* =========================================
   EXPORT
========================================= */

export default mongoose.model(
  "Officer",
  officerSchema
);
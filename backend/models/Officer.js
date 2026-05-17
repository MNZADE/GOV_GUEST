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
       FULL NAME
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

      required: true,

      default: "",
    },

    dob: {

      type: String,

      required: true,

      default: "",
    },

    /* =====================================
       CONTACT
    ===================================== */

    phone: {

      type: String,

      required: true,

      unique: true,

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
       ROLE
    ===================================== */

    role: {

      type: String,

      required: true,

      default: "Field Officer",
    },

    /* =====================================
       JOINING
    ===================================== */

    joiningDate: {

      type: String,

      required: true,

      default: "",
    },

    /* =====================================
       ADDRESS
    ===================================== */

    address: {

      type: String,

      required: true,

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
       CURRENT STATUS
    ===================================== */

    currentStatus: {

      type: String,

      enum: [

        "Available",

        "Busy",
      ],

      default: "Available",
    },

    /* =====================================
       CURRENT COMPLAINT
    ===================================== */

    assignedComplaintId: {

      type: mongoose.Schema.Types.ObjectId,

      ref: "Complaint",

      default: null,
    },

    assignedComplaint: {

      type: String,

      default: "",
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
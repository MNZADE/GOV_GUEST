import mongoose from "mongoose";

const complaintSchema =
  new mongoose.Schema({

    /* =========================================
       COMPLAINT ID
    ========================================= */

    complaintId: {

      type: String,

      required: true,

      unique: true,
    },

    /* =========================================
       USER DETAILS
    ========================================= */

    name: {

      type: String,

      required: true,
    },

    aadhaar: {

      type: String,

      required: true,
    },

    phone: {

      type: String,

      required: true,
    },

    /* =========================================
       ADDRESS DETAILS
    ========================================= */

    address: {

      type: String,

      required: true,
    },

    optionalAddress: {

      type: String,

      default: "",
    },

    /* =========================================
       MULTIPLE DEPARTMENTS
    ========================================= */

    departments: {

      type: [String],

      required: true,
    },

    /* =========================================
       MULTIPLE SUBCATEGORIES
    ========================================= */

    subcategories: {

      type: [String],

      default: [],
    },

    /* =========================================
       OLD DATA SUPPORT
    ========================================= */

    department: {

      type: String,

      default: "",
    },

    subcategory: {

      type: String,

      default: "",
    },

    /* =========================================
       ISSUE DETAILS
    ========================================= */

    issue: {

      type: String,

      required: true,
    },

    description: {

      type: String,

      default: "",
    },

    /* =========================================
       COMPLAINT IMAGES
    ========================================= */

    images: {

      type: [String],

      default: [],
    },

    /* =========================================
       STATUS
    ========================================= */

    status: {

      type: String,

      enum: [

        "Pending",

        "In Progress",

        "Resolved",

        "Rejected",

        "Escalated",
      ],

      default: "Pending",
    },

    /* =========================================
       PRIORITY
    ========================================= */

   /* =========================================
   PRIORITY
========================================= */

priority: {

  type: String,

  enum: [

    "Normal",

    "Medium",

    "High",

    "Urgent",

    "Escalated",
  ],

  default:
    "Normal",
},
    /* =========================================
       ADMIN MESSAGE
    ========================================= */

    adminMessage: {

      type: String,

      default: "",
    },

    /* =========================================
       REJECTION REASON
    ========================================= */

    rejectionReason: {

      type: String,

      default: "",
    },

    /* =========================================
       OFFICER ASSIGNMENT
    ========================================= */

    assignedOfficerId: {

      type: String,

      default: "",
    },

    assignedOfficer: {

      type: String,

      default: "",
    },

    assignedOfficerName: {

      type: String,

      default: "",
    },

    assignedOfficerEmail: {

      type: String,

      default: "",
    },

    /* =========================================
       OFFICER STATUS
    ========================================= */

    officerStatus: {

      type: String,

      enum: [

        "Available",

        "Busy",
      ],

      default: "Available",
    },

    /* =========================================
       OFFICER UPDATE DETAILS
    ========================================= */

    officerUpdatedImage: {

      type: String,

      default: "",
    },

    officerRemark: {

      type: String,

      default: "",
    },

    /* =========================================
       STATUS TRACKING DATES
    ========================================= */

    inProgressDate: {

      type: Date,
    },

    resolvedAt: {

      type: Date,
    },

    escalatedAt: {

      type: Date,
    },

    rejectedAt: {

      type: Date,
    },

    /* =========================================
       LAST UPDATED
    ========================================= */

    updatedAt: {

      type: Date,

      default: Date.now,
    },

    /* =========================================
       COMPLAINT HISTORY
    ========================================= */

    history: [

      {

        status: {

          type: String,
        },

        message: {

          type: String,
        },

        updatedBy: {

          type: String,
        },

        updatedAt: {

          type: Date,

          default: Date.now,
        },
      },
    ],

    /* =========================================
       LOCATION DETAILS
    ========================================= */

    latitude: {

      type: String,

      default: "",
    },

    longitude: {

      type: String,

      default: "",
    },

    /* =========================================
       DATE & TIME
    ========================================= */

    date: {

      type: String,
    },

    time: {

      type: String,
    },

    dateTime: {

      type: String,
    },

    /* =========================================
       AUTO TIMESTAMP
    ========================================= */

    createdAt: {

      type: Date,

      default: Date.now,
    },

    /* =========================================
       SOFT DELETE SUPPORT
    ========================================= */

    isDeleted: {

      type: Boolean,

      default: false,
    },
  });

/* =========================================
   SORTING INDEX
========================================= */

complaintSchema.index({

  createdAt: -1,
});

export default mongoose.model(

  "Complaint",

  complaintSchema
);
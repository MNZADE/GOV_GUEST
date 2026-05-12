import mongoose from "mongoose";

const notificationSchema =
  new mongoose.Schema(

    {

      /* =====================================
         TITLE
      ===================================== */

      title: {

        type: String,

        required: true,
      },

      /* =====================================
         MESSAGE
      ===================================== */

      message: {

        type: String,

        required: true,
      },

      /* =====================================
         NOTIFICATION TYPE
      ===================================== */

      type: {

        type: String,

        enum: [

          "new_complaint",

          "assignment",

          "escalated",

          "deadline",

          "resolved",

          "warning",

          "urgent",

          "normal",

          "info",
        ],

        default: "info",
      },

      /* =====================================
         RECIPIENT USER
      ===================================== */

      recipientId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        default: null,
      },

      /* =====================================
         SYSTEM MANAGER ALERT
      ===================================== */

      isSystemManager: {

        type: Boolean,

        default: false,
      },

      /* =====================================
         DEPARTMENT MANAGER ALERT
      ===================================== */

      department: {

        type: String,

        default: "",
      },

      /* =====================================
         COMPLAINT LINK
      ===================================== */

      complaintId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Complaint",

        default: null,
      },

      /* =====================================
         PRIORITY
      ===================================== */

      priority: {

        type: String,

        enum: [

          "low",

          "medium",

          "high",

          "critical",
        ],

        default: "medium",
      },

      /* =====================================
         READ STATUS
      ===================================== */

      isRead: {

        type: Boolean,

        default: false,
      },

      /* =====================================
         ACTION URL
      ===================================== */

      actionLink: {

        type: String,

        default: "",
      },

      /* =====================================
         EXTRA DATA
      ===================================== */

      metadata: {

        type: Object,

        default: {},
      },
    },

    {

      timestamps: true,
    }
  );

/* =====================================
   INDEXES
===================================== */

notificationSchema.index({

  recipientId: 1,
});

notificationSchema.index({

  department: 1,
});

notificationSchema.index({

  complaintId: 1,
});

notificationSchema.index({

  isSystemManager: 1,
});

notificationSchema.index({

  createdAt: -1,
});

/* =====================================
   MODEL
===================================== */

const Notification =
  mongoose.model(

    "Notification",

    notificationSchema
  );

export default Notification;
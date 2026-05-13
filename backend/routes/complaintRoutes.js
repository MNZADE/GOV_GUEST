import express from "express";
import multer from "multer";
import twilio from "twilio";
import path from "path";
import fs from "fs";

import Complaint from "../models/Complaint.js";
import Notification from "../models/Notification.js";
import createNotification from "../utils/createNotification.js";
import auth from "../middleware/adminAuth.js";

const router = express.Router();

console.log("✅ Complaint routes loaded");

/* =========================================================
   📁 CREATE UPLOADS FOLDER
========================================================= */

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/* =========================================================
   📸 MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, uniqueName);
  },
});

/* =========================================================
   📸 FILE FILTER
========================================================= */

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

/* =========================================================
   📸 MULTER UPLOAD
========================================================= */

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/* =========================================================
   📲 TWILIO
========================================================= */

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* =========================================================
   🏢 DEPARTMENT PREFIX
========================================================= */

const DEPT_PREFIX = {
  sanitation: "SAN",
  water: "WAT",
  roads: "ROD",
  streetLight: "STL",
  drainage: "DRN",
  health: "HLT",
  other: "OTH",
};

/* ================= GENERATE GROUP ID ================= */
const generateGroupId = () => {
  return `GRP-${Date.now()}`;
};
/* =========================================================
   NORMALIZE DEPARTMENT
========================================================= */

const normalizeDepartment =
  (department = "") => {

    return department

      .toLowerCase()

      /* =====================================
         STREET LIGHT MAIN DEPARTMENT
      ===================================== */

      .replace(
        "electricity department",
        "streetlight"
      )

      .replace(
        "electric department",
        "streetlight"
      )

      .replace(
        "electricity",
        "streetlight"
      )

      .replace(
        "street light department",
        "streetlight"
      )

      .replace(
        "street light",
        "streetlight"
      )

      .replace(
        "street-light",
        "streetlight"
      )

      /* =====================================
         WATER
      ===================================== */

      .replace(
        "water department",
        "water"
      )

      .replace(
        "water supply department",
        "water"
      )

      /* =====================================
         COMMON
      ===================================== */

      .replace(
        " department",
        ""
      )

      .trim();
  };

/* ================= GENERATE COMPLAINT ID ================= */
const generateComplaintId = async (department) => {
  // Normalize to lowercase for matching keys
  const prefix = DEPT_PREFIX[department.toLowerCase()] || "GEN";

  const now = new Date();
  const dateStr =
    now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  // Count documents for the day (case-insensitive department match)
  const count = await Complaint.countDocuments({
    department: { $regex: `^${department}$`, $options: "i" },
    createdAt: { $gte: start, $lte: end },
  });

  const serial = String(count + 1).padStart(3, "0");

  return `${prefix}-${dateStr}-${serial}`;
};

/* ================= FORMAT DATE ================= */
function formatDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes} ${ampm}`,
    dateTime: `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`,
  };
}

/* =========================================================
   🔍 TRACK COMPLAINT
========================================================= */
router.get("/track/:complaintId", async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    res.json({ success: true, complaint });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================================================
   👤 SUBMIT COMPLAINT (COMBINED LOGIC)
========================================================= */
router.post(
  "/citizen/submit",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const {
        name,
        aadhaar,
        phone,
        address,
        optionalAddress,
        issue,
        description,
        departments,
        subcategories,
        lat,
        lon,
      } = req.body;

      const imageFiles =
        req.files?.map((file) => file.originalname) || [];

      const { date, time, dateTime } = formatDateTime();

      let departmentList = JSON.parse(departments || "[]");
      let subcategoryList = JSON.parse(subcategories || "[]");

      const groupId = generateGroupId();

      let createdComplaints = [];

      for (let dept of departmentList) {
        const normalizedDept = dept.toLowerCase(); // ✅ Normalize case
        const complaintId = await generateComplaintId(normalizedDept);

        const complaint = await Complaint.create({
          complaintId,
          groupId,
          department: normalizedDept, // ✅ Store lowercase
          name,
          aadhaar: String(aadhaar),
          phone,
          address,
          optionalAddress,
          subcategories: subcategoryList,
          issue: issue || "No Title Provided",
          description,
          images: imageFiles,
          lat: lat || null,
          lon: lon || null,
          status: "Pending",
          date,
          time,
          dateTime,
          createdAt: new Date(),
        });

        createdComplaints.push(complaint);

        /* SOCKET PER DEPARTMENT */
        const io = req.app.get("io");
        if (io) {
          io.to(normalizedDept).emit("newComplaint", complaint);
        }
      }

      /* GLOBAL SOCKET */
      const io = req.app.get("io");
      if (io) {
        io.emit("newComplaintGlobal", createdComplaints);
      }

      /* NOTIFICATION */
      try {
        const io = req.app.get("io");

        await createNotification(io, {
          title: "New Complaint Registered",
          message: `${issue} - ${groupId}`,
          recipientRole: "system_manager",
        });
      } catch (err) {
        console.error("Notification error:", err);
      }

      /* TWILIO SMS MESSAGE */
      try {
        // ✅ Clean Indian phone number
        const cleanPhone = phone
          .replace("+91", "")
          .replace(/\D/g, "");

        // ✅ Check valid 10-digit number
        if (cleanPhone.length === 10) {

          // ✅ SMS Content
          const messageBody = `✅ Complaint Submitted!

📦 Group ID: ${groupId}

🆔 Complaint IDs:
 ${createdComplaints.map(c => c.complaintId).join("\n")}

Track Complaint:
http://localhost:3000/track/${createdComplaints[0].complaintId}`;

          // ✅ Send SMS
          const sms = await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${cleanPhone}`,
          });

          console.log("✅ SMS Sent:", sms.sid);

        } else {
          console.log("❌ Invalid phone number");
        }

      } catch (err) {
        console.error("Twilio error:", err);
      }

      /* =========================================================
         📲 WHATSAPP MESSAGE
      ========================================================== */

     /* =========================================================
   📲 WHATSAPP MESSAGE
========================================================= */

try {

  const cleanPhone = phone
    .replace("+91", "")
    .replace(/\D/g, "");

  if (cleanPhone.length === 10) {

    const messageBody = `✅ Complaint Submitted!

📦 Group ID: ${groupId}

🆔 Complaint IDs:
${createdComplaints.map(c => c.complaintId).join("\n")}

Track Complaint:
http://localhost:3000/track/${createdComplaints[0].complaintId}`;

    const sms = await client.messages.create({

      body: messageBody,

      from: "whatsapp:+14155238886",

      to: `whatsapp:+91${cleanPhone}`,
    });

    console.log(
      "✅ WhatsApp Message Sent:",
      sms.sid
    );

  } else {

    console.log(
      "❌ Invalid phone number"
    );
  }

} catch (err) {

  console.error(
    "Twilio error:",
    err
  );
}

/* =========================================================
   ✅ RESPONSE
========================================================= */

res.json({
  success: true,

  groupId,

  complaintIds:
    createdComplaints.map(
      c => c.complaintId
    ),
});

} catch (err) {

  console.error(err);

  res.status(500).json({
    success: false,
  });
}

}
);

/* =========================================================
   👤 GET USER COMPLAINTS
========================================================= */
router.get("/user/:aadhaar", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      aadhaar: String(req.params.aadhaar),
    }).sort({ createdAt: -1 });

    res.json({ success: true, complaints });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================================================
   👨‍💼 DEPARTMENT MANAGER DASHBOARD
========================================================= */

/* =========================================================
   👨‍💼 DEPARTMENT MANAGER DASHBOARD
========================================================= */

router.get("/manager/:department", auth, async (req, res) => {

  try {

    const routeDepartment =
      req.params.department
        ?.toLowerCase()
        .trim();

    const userDepartment =
      req.user.department
        ?.toLowerCase()
        .replace(" supply department", "")
        .replace(" department", "")
        .trim();

    const userRole = req.user.role;

    console.log("Route Department:", routeDepartment);
    console.log("User Department:", userDepartment);
    console.log("User Role:", userRole);

    /* ===============================
       SYSTEM MANAGER ACCESS
    =============================== */
    if (userRole === "system_manager") {

      const complaints =
        await Complaint.find({
          department: {
            $regex: `^${routeDepartment}$`,
            $options: "i",
          },
        }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        complaints,
      });
    }

    /* ===============================
       DEPARTMENT MANAGER ACCESS
    =============================== */
    if (userRole === "department_manager") {

      if (
        routeDepartment !== userDepartment
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Unauthorized department access",
        });
      }

      const complaints =
        await Complaint.find({
          department: {
            $regex: `^${userDepartment}$`,
            $options: "i",
          },
        }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        complaints,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Access denied",
    });

  } catch (err) {

    console.error(
      "Department Route Error:",
      err
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

/* =========================================================
   👨‍💼 SYSTEM MANAGER DASHBOARD
========================================================= */

router.get("/system/all", auth, async (req, res) => {

  try {

    console.log("✅ System Manager Route Hit");

    if (
      req.user.role !== "system_manager"
    ) {

      return res.status(403).json({
        success: false,
        message:
          "Only System Manager can access",
      });
    }

    const complaints =
      await Complaint.find()
        .sort({ createdAt: -1 });

    const formattedComplaints =
      complaints.map((c) => ({

        ...c._doc,

        departments:
          c.department
            ? [c.department]
            : Array.isArray(c.departments)
            ? c.departments
            : [],
      }));

    res.json({
      success: true,
      total:
        formattedComplaints.length,
      complaints:
        formattedComplaints,
    });

  } catch (err) {

    console.error(
      "System Dashboard Error:",
      err
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});
/* =========================================================
   🔄 UPDATE STATUS (WITH REJECTION LOGIC)
========================================================= */
/* =========================================================
   🔄 UPDATE COMPLAINT STATUS + MESSAGE
========================================================= */

router.put(
  "/manager/update/:id",
  auth,
  async (req, res) => {

    try {

      const {
        status,
        priority,
        adminMessage,
        rejectionReason,
      } = req.body;

      /* =====================================
         VALIDATION
      ===================================== */

      if (!status) {

        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      /* =====================================
         FIND COMPLAINT
      ===================================== */

      const complaint =
        await Complaint.findById(
          req.params.id
        );

      if (!complaint) {

        return res.status(404).json({
          success: false,
          message:
            "Complaint not found",
        });
      }

      /* =====================================
         UPDATE STATUS
      ===================================== */

      complaint.status = status;

      /* =====================================
         UPDATE PRIORITY
      ===================================== */

      if (priority) {

        complaint.priority =
          priority;
      }

      /* =====================================
         ADMIN MESSAGE
      ===================================== */

      complaint.adminMessage =
        adminMessage || "";

      /* =====================================
         REJECTION REASON
      ===================================== */

      if (status === "Rejected") {

        complaint.rejectionReason =
          rejectionReason ||
          "Complaint rejected by department";

      } else {

        complaint.rejectionReason =
          "";
      }

      /* =====================================
         UPDATE TIME
      ===================================== */

      complaint.updatedAt =
        new Date();

      /* =====================================
         HISTORY
      ===================================== */

      if (!complaint.history) {

        complaint.history = [];
      }

      complaint.history.push({

        status,

        message:
          adminMessage ||
          "Complaint updated",

        updatedBy:
          req.user.name ||
          "Department Manager",

        updatedAt:
          new Date(),
      });

      /* =====================================
         SAVE
      ===================================== */

      await complaint.save();

      /* =====================================
         USER NOTIFICATION
      ===================================== */

      try {

        await Notification.create({

          title:
            "Complaint Updated",

          message:
            `Your complaint ${complaint.complaintId} status changed to ${status}`,

          type:
            status === "Rejected"
              ? "urgent"
              : status === "Resolved"
              ? "normal"
              : "info",

          recipientId:
            complaint.userId || null,
        });

      } catch (err) {

        console.log(
          "Notification Error:",
          err.message
        );
      }

      /* =====================================
         SOCKET REALTIME UPDATE
      ===================================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(
          "complaintUpdated",
          complaint
        );
      }

      /* =====================================
         RESPONSE
      ===================================== */

      res.json({

        success: true,

        message:
          "Complaint updated successfully",

        complaint,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);

/* =========================================================
   ❌ DELETE
========================================================= */
router.delete("/user/:aadhaar/:complaintId", async (req, res) => {
  const removed = await Complaint.findOneAndDelete({
    complaintId: req.params.complaintId,
    aadhaar: String(req.params.aadhaar),
  });

  res.json({ success: !!removed });
});

/* =========================================================
   ✏️ EDIT COMPLAINT (RESUBMIT)
========================================================= */
router.put("/citizen/edit/:complaintId", async (req, res) => {
  try {
    const {
      issue,
      description,
      optionalAddress,
      departments,
      subcategories,
    } = req.body;

    const complaint = await Complaint.findOne({
      complaintId: req.params.complaintId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // ✅ Update fields
    complaint.issue = issue || complaint.issue;
    complaint.description = description || complaint.description;
    complaint.optionalAddress =
      optionalAddress || complaint.optionalAddress;

    if (departments) {
      const deptList = JSON.parse(departments);
      complaint.department = deptList[0]?.toLowerCase(); // normalize to lowercase
    }

    if (subcategories) {
      complaint.subcategories = JSON.parse(subcategories);
    }

    // ✅ Reset status after edit
    complaint.status = "Pending";
    complaint.rejectionReason = "";

    await complaint.save();

    res.json({
      success: true,
      message: "Complaint updated successfully",
      complaint,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
/* =========================================================
   👮 OFFICER UPDATE COMPLAINT
========================================================= */

router.put(
  "/officer/update/:complaintId",
  upload.single("updatedImage"),
  async (req, res) => {

    try {

      const {
        officerRemark,
        status,
      } = req.body;

      const complaint =
        await Complaint.findOne({
          complaintId: req.params.complaintId,
        });

      if (!complaint) {

        return res.status(404).json({
          success: false,
          message: "Complaint not found",
        });
      }

      /* =====================================
         UPDATE IMAGE
      ===================================== */

      if (req.file) {

        complaint.officerUpdatedImage =
          req.file.filename;
      }

      /* =====================================
         UPDATE REMARK
      ===================================== */

      complaint.officerRemark =
        officerRemark || "";

      /* =====================================
         UPDATE STATUS
      ===================================== */

      complaint.status =
        status || "In Progress";

      /* =====================================
         RESOLVED TIME
      ===================================== */

      if (status === "Resolved") {

        complaint.resolvedAt =
          new Date();
      }

      /* =====================================
         UPDATED TIME
      ===================================== */

      complaint.updatedAt =
        new Date();

      /* =====================================
         HISTORY
      ===================================== */

      complaint.history.push({

        status:
          complaint.status,

        message:
          officerRemark ||
          "Updated by officer",

        updatedBy:
          complaint.assignedOfficerName ||
          "Officer",

        updatedAt:
          new Date(),
      });

      /* =====================================
         SAVE
      ===================================== */

      await complaint.save();

      /* =====================================
         SOCKET UPDATE
      ===================================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(
          "complaintUpdated",
          complaint
        );
      }

      /* =====================================
         RESPONSE
      ===================================== */

      res.json({

        success: true,

        message:
          "Complaint updated successfully",

        complaint,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
        message:
          "Server Error",
      });
    }
  }
);
/* =====================================================
   GET ALL COMPLAINTS
===================================================== */

router.get(
  "/all",

  async (req, res) => {

    try {

      const complaints =
        await Complaint.find()

          .sort({
            createdAt: -1,
          });

      res.json({

        success: true,

        complaints,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);
/* =========================================
   GET ALL COMPLAINTS
========================================= */

router.get(
  "/all",

  async (req, res) => {

    try {

      const complaints =
        await Complaint.find()

          .sort({
            createdAt: -1,
          });

      res.json({

        success: true,

        complaints,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({

        success: false,

        message:
          "Failed to fetch complaints",
      });
    }
  }
);

export default router;








// import express from "express";
// import multer from "multer";
// import twilio from "twilio";
// import path from "path";
// import fs from "fs";

// import Complaint from "../models/Complaint.js";
// import Notification from "../models/Notification.js";
// import createNotification from "../utils/createNotification.js";
// import auth from "../middleware/adminAuth.js";

// const router = express.Router();

// console.log("✅ Complaint routes loaded");

// /* =========================================================
//    📁 CREATE UPLOADS FOLDER
// ========================================================= */

// const uploadDir = "uploads";

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// /* =========================================================
//    📸 MULTER STORAGE
// ========================================================= */

// const storage = multer.diskStorage({

//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },

//   filename: function (req, file, cb) {

//     const uniqueName =
//       Date.now() +
//       "-" +
//       file.originalname.replace(/\s+/g, "-");

//     cb(null, uniqueName);
//   },
// });

// /* =========================================================
//    📸 FILE FILTER
// ========================================================= */

// const fileFilter = (req, file, cb) => {

//   const allowedTypes =
//     /jpeg|jpg|png|webp/;

//   const extname =
//     allowedTypes.test(
//       path.extname(
//         file.originalname
//       ).toLowerCase()
//     );

//   const mimetype =
//     allowedTypes.test(
//       file.mimetype
//     );

//   if (extname && mimetype) {

//     cb(null, true);

//   } else {

//     cb(
//       new Error(
//         "Only image files are allowed"
//       )
//     );
//   }
// };

// /* =========================================================
//    📸 MULTER UPLOAD
// ========================================================= */

// const upload = multer({

//   storage,
//   fileFilter,

//   limits: {
//     fileSize:
//       5 * 1024 * 1024,
//   },
// });

// /* =========================================================
//    📲 TWILIO
// ========================================================= */

// const client = twilio(

//   process.env.TWILIO_SID,

//   process.env.TWILIO_AUTH_TOKEN
// );

// /* =========================================================
//    🏢 DEPARTMENT PREFIX
// ========================================================= */

// const DEPT_PREFIX = {

//   sanitation: "SAN",

//   water: "WAT",

//   roads: "ROD",

//   streetlight: "STL",

//   drainage: "DRN",

//   health: "HLT",

//   other: "OTH",
// };

// /* =========================================================
//    📦 GENERATE GROUP ID
// ========================================================= */

// const generateGroupId = () => {

//   return `GRP-${Date.now()}`;
// };

// /* =========================================================
//    🔄 NORMALIZE DEPARTMENT
// ========================================================= */

// const normalizeDepartment =
//   (department = "") => {

//     return department

//       .toLowerCase()

//       .replace(
//         "electricity department",
//         "streetlight"
//       )

//       .replace(
//         "electric department",
//         "streetlight"
//       )

//       .replace(
//         "electricity",
//         "streetlight"
//       )

//       .replace(
//         "street light department",
//         "streetlight"
//       )

//       .replace(
//         "street light",
//         "streetlight"
//       )

//       .replace(
//         "street-light",
//         "streetlight"
//       )

//       .replace(
//         "water department",
//         "water"
//       )

//       .replace(
//         "water supply department",
//         "water"
//       )

//       .replace(
//         " department",
//         ""
//       )

//       .trim();
//   };

// /* =========================================================
//    🆔 GENERATE COMPLAINT ID
// ========================================================= */

// const generateComplaintId =
//   async (department) => {

//     const prefix =
//       DEPT_PREFIX[
//         department.toLowerCase()
//       ] || "GEN";

//     const now =
//       new Date();

//     const dateStr =
//       now.getFullYear() +
//       String(
//         now.getMonth() + 1
//       ).padStart(2, "0") +
//       String(
//         now.getDate()
//       ).padStart(2, "0");

//     const start =
//       new Date();

//     start.setHours(
//       0,
//       0,
//       0,
//       0
//     );

//     const end =
//       new Date();

//     end.setHours(
//       23,
//       59,
//       59,
//       999
//     );

//     const count =
//       await Complaint.countDocuments({

//         department: {
//           $regex:
//             `^${department}$`,
//           $options: "i",
//         },

//         createdAt: {
//           $gte: start,
//           $lte: end,
//         },
//       });

//     const serial =
//       String(count + 1)
//         .padStart(3, "0");

//     return `${prefix}-${dateStr}-${serial}`;
//   };

// /* =========================================================
//    📅 FORMAT DATE
// ========================================================= */

// function formatDateTime() {

//   const now =
//     new Date();

//   const day =
//     String(
//       now.getDate()
//     ).padStart(2, "0");

//   const month =
//     String(
//       now.getMonth() + 1
//     ).padStart(2, "0");

//   const year =
//     now.getFullYear();

//   let hours =
//     now.getHours();

//   const minutes =
//     String(
//       now.getMinutes()
//     ).padStart(2, "0");

//   const ampm =
//     hours >= 12
//       ? "PM"
//       : "AM";

//   hours =
//     hours % 12 || 12;

//   return {

//     date:
//       `${day}/${month}/${year}`,

//     time:
//       `${hours}:${minutes} ${ampm}`,

//     dateTime:
//       `${day}/${month}/${year} • ${hours}:${minutes} ${ampm}`,
//   };
// }

// /* =========================================================
//    🔍 TRACK COMPLAINT
// ========================================================= */

// router.get(
//   "/track/:complaintId",

//   async (req, res) => {

//     try {

//       const complaint =
//         await Complaint.findOne({

//           complaintId:
//             req.params.complaintId,
//         });

//       if (!complaint) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Complaint not found",
//         });
//       }

//       res.json({

//         success: true,

//         complaint,
//       });

//     } catch (err) {

//       res.status(500).json({

//         success: false,
//       });
//     }
//   }
// );

// /* =========================================================
//    👤 SUBMIT COMPLAINT
// ========================================================= */

// router.post(

//   "/citizen/submit",

//   upload.array("images", 5),

//   async (req, res) => {

//     try {

//       const {

//         name,
//         aadhaar,
//         phone,
//         address,
//         optionalAddress,
//         issue,
//         description,
//         departments,
//         subcategories,
//         lat,
//         lon,

//       } = req.body;

//       const imageFiles =
//         req.files?.map(
//           (file) =>
//             file.filename
//         ) || [];

//       const {
//         date,
//         time,
//         dateTime,
//       } = formatDateTime();

//       let departmentList =
//         JSON.parse(
//           departments || "[]"
//         );

//       let subcategoryList =
//         JSON.parse(
//           subcategories || "[]"
//         );

//       const groupId =
//         generateGroupId();

//       let createdComplaints =
//         [];

//       for (let dept of departmentList) {

//         const normalizedDept =
//           normalizeDepartment(
//             dept
//           );

//         const complaintId =
//           await generateComplaintId(
//             normalizedDept
//           );

//         const complaint =
//           await Complaint.create({

//             complaintId,

//             groupId,

//             department:
//               normalizedDept,

//             name,

//             aadhaar:
//               String(aadhaar),

//             phone,

//             address,

//             optionalAddress,

//             subcategories:
//               subcategoryList,

//             issue:
//               issue ||
//               "No Title",

//             description,

//             images:
//               imageFiles,

//             lat:
//               lat || null,

//             lon:
//               lon || null,

//             status:
//               "Pending",

//             priority:
//               "Medium",

//             date,

//             time,

//             dateTime,

//             createdAt:
//               new Date(),
//           });

//         createdComplaints.push(
//           complaint
//         );

//         const io =
//           req.app.get("io");

//         if (io) {

//           io.to(
//             normalizedDept
//           ).emit(
//             "newComplaint",
//             complaint
//           );
//         }
//       }

//       const io =
//         req.app.get("io");

//       if (io) {

//         io.emit(
//           "newComplaintGlobal",
//           createdComplaints
//         );
//       }

//       try {

//         await createNotification(
//           io,
//           {

//             title:
//               "New Complaint Registered",

//             message:
//               `${issue} - ${groupId}`,

//             recipientRole:
//               "system_manager",
//           }
//         );

//       } catch (err) {

//         console.error(
//           "Notification Error:",
//           err
//         );
//       }

//       /* SMS */

//       try {

//         const cleanPhone =
//           phone
//             .replace("+91", "")
//             .replace(/\D/g, "");

//         if (
//           cleanPhone.length === 10
//         ) {

//           const messageBody =
//             `Complaint Submitted

// Group ID: ${groupId}

// Complaint IDs:
// ${createdComplaints
//   .map(
//     c => c.complaintId
//   )
//   .join("\n")}`;

//           await client.messages.create({

//             body:
//               messageBody,

//             from:
//               process.env.TWILIO_PHONE_NUMBER,

//             to:
//               `+91${cleanPhone}`,
//           });
//         }

//       } catch (err) {

//         console.log(
//           "Twilio Error:",
//           err.message
//         );
//       }

//       res.json({

//         success: true,

//         groupId,

//         complaintIds:
//           createdComplaints.map(
//             c => c.complaintId
//           ),
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* =========================================================
//    👤 USER COMPLAINTS
// ========================================================= */

// router.get(
//   "/user/:aadhaar",

//   async (req, res) => {

//     try {

//       const complaints =
//         await Complaint.find({

//           aadhaar:
//             String(
//               req.params.aadhaar
//             ),
//         }).sort({
//           createdAt: -1,
//         });

//       res.json({

//         success: true,

//         complaints,
//       });

//     } catch (err) {

//       res.status(500).json({

//         success: false,
//       });
//     }
//   }
// );

// /* =========================================================
//    👨‍💼 MANAGER DASHBOARD
// ========================================================= */

// router.get(
//   "/manager/:department",

//   auth,

//   async (req, res) => {

//     try {

//       const routeDepartment =
//         req.params.department
//           ?.toLowerCase()
//           .trim();

//       const userDepartment =
//         req.user.department
//           ?.toLowerCase()
//           .replace(
//             " supply department",
//             ""
//           )
//           .replace(
//             " department",
//             ""
//           )
//           .trim();

//       const userRole =
//         req.user.role;

//       /* SYSTEM MANAGER */

//       if (
//         userRole ===
//         "system_manager"
//       ) {

//         const complaints =
//           await Complaint.find({

//             department: {
//               $regex:
//                 `^${routeDepartment}$`,
//               $options: "i",
//             },
//           }).sort({
//             createdAt: -1,
//           });

//         return res.json({

//           success: true,

//           complaints,
//         });
//       }

//       /* DEPARTMENT MANAGER */

//       if (
//         userRole ===
//         "department_manager"
//       ) {

//         if (
//           routeDepartment !==
//           userDepartment
//         ) {

//           return res.status(403).json({

//             success: false,

//             message:
//               "Unauthorized department access",
//           });
//         }

//         const complaints =
//           await Complaint.find({

//             department: {
//               $regex:
//                 `^${userDepartment}$`,
//               $options: "i",
//             },
//           }).sort({
//             createdAt: -1,
//           });

//         return res.json({

//           success: true,

//           complaints,
//         });
//       }

//       return res.status(403).json({

//         success: false,

//         message:
//           "Access denied",
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* =========================================================
//    👨‍💼 SYSTEM DASHBOARD
// ========================================================= */

// router.get(
//   "/system/all",

//   auth,

//   async (req, res) => {

//     try {

//       const complaints =
//         await Complaint.find()
//           .sort({
//             createdAt: -1,
//           });

//       res.json({

//         success: true,

//         total:
//           complaints.length,

//         complaints,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// /* =========================================================
//    🔄 COMMON UPDATE API
// ========================================================= */

// router.put(
//   "/update/:id",

//   auth,

//   async (req, res) => {

//     try {

//       const {

//         status,
//         priority,
//         adminMessage,
//         rejectionReason,
//         assignedOfficerName,
//         assignedTo,

//       } = req.body;

//       if (!status) {

//         return res.status(400).json({

//           success: false,

//           message:
//             "Status is required",
//         });
//       }

//       let complaint =
//         null;

//       /* SUPPORT _id */

//       if (
//         req.params.id.length === 24
//       ) {

//         complaint =
//           await Complaint.findById(
//             req.params.id
//           );
//       }

//       /* SUPPORT complaintId */

//       if (!complaint) {

//         complaint =
//           await Complaint.findOne({

//             complaintId:
//               req.params.id,
//           });
//       }

//       if (!complaint) {

//         return res.status(404).json({

//           success: false,

//           message:
//             "Complaint not found",
//         });
//       }

//       const userRole =
//         req.user?.role
//           ?.toLowerCase();

//       const userDepartment =
//         req.user?.department
//           ?.toLowerCase()
//           ?.replace(
//             " department",
//             ""
//           )
//           ?.replace(
//             " supply department",
//             ""
//           )
//           ?.trim();

//       /* ACCESS CHECK */

//       if (

//         userRole ===
//           "department_manager" &&

//         complaint.department !==
//           userDepartment

//       ) {

//         return res.status(403).json({

//           success: false,

//           message:
//             "Unauthorized access",
//         });
//       }

//       /* UPDATE */

//       complaint.status =
//         status;

//       if (priority) {

//         complaint.priority =
//           priority;
//       }

//       if (assignedOfficerName) {

//         complaint.assignedOfficerName =
//           assignedOfficerName;
//       }

//       if (assignedTo) {

//         complaint.assignedTo =
//           assignedTo;
//       }

//       complaint.adminMessage =
//         adminMessage || "";

//       if (
//         status === "Rejected"
//       ) {

//         complaint.rejectionReason =

//           rejectionReason ||

//           "Complaint rejected";

//       } else {

//         complaint.rejectionReason =
//           "";
//       }

//       if (
//         status === "Resolved"
//       ) {

//         complaint.resolvedAt =
//           new Date();
//       }

//       complaint.updatedAt =
//         new Date();

//       /* HISTORY */

//       if (!complaint.history) {

//         complaint.history = [];
//       }

//       complaint.history.push({

//         status,

//         priority:
//           complaint.priority,

//         message:
//           adminMessage ||

//           `Complaint marked as ${status}`,

//         updatedBy:
//           req.user?.name ||
//           "Manager",

//         role:
//           req.user?.role ||
//           "Department Manager",

//         department:
//           req.user?.department ||
//           complaint.department,

//         updatedAt:
//           new Date(),
//       });

//       await complaint.save();

//       /* SOCKET */

//       const io =
//         req.app.get("io");

//       if (io) {

//         io.emit(
//           "complaintUpdated",
//           complaint
//         );

//         io.to(
//           complaint.department
//         ).emit(
//           "departmentComplaintUpdated",
//           complaint
//         );
//       }

//       /* NOTIFICATION */

//       try {

//         await Notification.create({

//           title:
//             "Complaint Updated",

//           message:
//             `Complaint ${complaint.complaintId} updated to ${status}`,

//           complaintId:
//             complaint.complaintId,

//           department:
//             complaint.department,

//           createdAt:
//             new Date(),
//         });

//       } catch (err) {

//         console.log(
//           "Notification Error:",
//           err.message
//         );
//       }

//       res.json({

//         success: true,

//         message:
//           "Complaint updated successfully",

//         complaint,
//       });

//     } catch (err) {

//       console.error(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",

//         error:
//           err.message,
//       });
//     }
//   }
// );

// /* =========================================================
//    ❌ DELETE COMPLAINT
// ========================================================= */

// router.delete(
//   "/user/:aadhaar/:complaintId",

//   async (req, res) => {

//     try {

//       const removed =
//         await Complaint.findOneAndDelete({

//           complaintId:
//             req.params.complaintId,

//           aadhaar:
//             String(
//               req.params.aadhaar
//             ),
//         });

//       res.json({

//         success:
//           !!removed,
//       });

//     } catch (err) {

//       res.status(500).json({

//         success: false,
//       });
//     }
//   }
// );

// /* =========================================================
//    📋 ALL COMPLAINTS
// ========================================================= */

// router.get(
//   "/all",

//   async (req, res) => {

//     try {

//       const complaints =
//         await Complaint.find()
//           .sort({
//             createdAt: -1,
//           });

//       res.json({

//         success: true,

//         complaints,
//       });

//     } catch (err) {

//       console.log(err);

//       res.status(500).json({

//         success: false,

//         message:
//           "Server Error",
//       });
//     }
//   }
// );

// export default router;




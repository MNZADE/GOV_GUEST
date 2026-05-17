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

const normalizeDepartment = (department = "") => {

  return department

    .toLowerCase()

    /* SANITATION */

    .replace(
      "sanitation department",
      "sanitation"
    )

    .replace(
      "sanitary department",
      "sanitation"
    )

    .replace(
      "garbage department",
      "sanitation"
    )

    /* STREET LIGHT */

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

    /* WATER */

    .replace(
      "water department",
      "water"
    )

    .replace(
      "water supply department",
      "water"
    )

    /* COMMON */

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

    // const routeDepartment =
    //   req.params.department
    //     ?.toLowerCase()
    //     .trim();

    // const userDepartment =
    //   req.user.department
    //     ?.toLowerCase()
    //     .replace(" supply department", "")
    //     .replace(" department", "")
    //     .trim();
   const deptMap = {

  "health department":
    "health",

  "sanitation department":
    "sanitation",

  "water supply department":
    "water",

  "electricity department":
    "streetlight",

  "road & transportation department":
    "roads",

  "drainage & sewage department":
    "drainage",

  "general complaint department":
    "other",
};

const routeDepartment =

  deptMap[
    req.params.department
      ?.toLowerCase()
  ] ||

  req.params.department
    ?.toLowerCase()
    .trim();

const userDepartment =

  deptMap[
    req.user.department
      ?.toLowerCase()
  ] ||

  req.user.department
    ?.toLowerCase()
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

  await Complaint.findOne({

    complaintId:
      req.params.id
  });
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
/* =========================================================
   🔄 UPDATE COMPLAINT STATUS + USER MESSAGE
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

          message:
            "Status is required",
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

      complaint.status =
        status;

      /* =====================================
         PRIORITY
      ===================================== */

      if (priority) {

        complaint.priority =
          priority;
      }

      /* =====================================
         USER VISIBLE MESSAGE
      ===================================== */

      complaint.adminMessage =

        adminMessage ||

        complaint.adminMessage ||

        "";

      /* =====================================
         REJECTION MESSAGE
      ===================================== */

      if (
        status === "Rejected"
      ) {

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

      if (
        !Array.isArray(
          complaint.history
        )
      ) {

        complaint.history = [];
      }

      complaint.history.push({

        status,

        priority,

        adminMessage,

        rejectionReason,

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
         CREATE USER NOTIFICATION
      ===================================== */

      try {

        await Notification.create({

          title:
            `Complaint ${status}`,

          message:

            status === "Rejected"

              ? `Complaint ${complaint.complaintId} was rejected. Reason: ${complaint.rejectionReason}`

              : `Complaint ${complaint.complaintId} updated to ${status}`,

          complaintId:
            complaint._id,

          complaintNumber:
            complaint.complaintId,

          recipientPhone:
            complaint.phone,

          type:

            status === "Rejected"

              ? "rejected"

              : status === "Resolved"

              ? "resolved"

              : "update",

          createdAt:
            new Date(),
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

      console.error(
        "Update Complaint Error:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);
/* =========================================================
   🚨 GET ESCALATED COMPLAINTS
========================================================= */

router.get(
  "/system/escalated",

  auth,

  async (req, res) => {

    try {

      console.log(
        "✅ Escalated Complaints Route Hit"
      );

      /* ===============================
         ONLY SYSTEM MANAGER
      =============================== */

      if (
        req.user.role !==
        "system_manager"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Only system manager can access",
        });
      }

      /* ===============================
         FETCH ESCALATED COMPLAINTS
      =============================== */

      const complaints =
        await Complaint.find({

          $or: [

            {
              status: "Escalated",
            },

            {
              priority: "High",
            },

            {
              escalated: true,
            },
          ],
        })

          .sort({
            createdAt: -1,
          });

      /* ===============================
         RESPONSE
      =============================== */

      res.json({

        success: true,

        total:
          complaints.length,

        complaints,
      });

    } catch (err) {

      console.error(
        "Escalated Complaint Error:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* =========================================================
   👮 ASSIGN OFFICER TO COMPLAINT
========================================================= */

router.put(
  "/officers/assign/:id",

  auth,

  async (req, res) => {

    try {

      const {
        officerId,
      } = req.body;

      /* ===============================
         ONLY SYSTEM MANAGER
      =============================== */

      if (
        req.user.role !==
        "system_manager"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Unauthorized",
        });
      }

      /* ===============================
         FIND COMPLAINT
      =============================== */

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

      /* ===============================
         FIND OFFICER
      =============================== */

      const Officer =
        (
          await import(
            "../models/Officer.js"
          )
        ).default;

      const officer =
        await Officer.findById(
          officerId
        );

      if (!officer) {

        return res.status(404).json({

          success: false,

          message:
            "Officer not found",
        });
      }

      /* ===============================
         ASSIGN OFFICER
      =============================== */

      complaint.assignedOfficerId =
        officer._id;

      complaint.assignedOfficerName =
        officer.fullName;

      complaint.assignedOfficerEmail =
        officer.email;

      complaint.assignedOfficerPhone =
        officer.phone;

      complaint.assignedOfficerDepartment =
        officer.department;

      complaint.status =
        "In Progress";

      complaint.updatedAt =
        new Date();

      /* ===============================
         HISTORY
      =============================== */

      if (
        !Array.isArray(
          complaint.history
        )
      ) {

        complaint.history = [];
      }

      complaint.history.push({

        status:
          "Officer Assigned",

        message:
          `Assigned to ${officer.fullName}`,

        updatedBy:
          req.user.name ||
          "System Manager",

        updatedAt:
          new Date(),
      });

      /* ===============================
         SAVE COMPLAINT
      =============================== */

      await complaint.save();

      /* =====================================================
         UPDATE USER PROFILE
      ===================================================== */

      try {

        const User =
          (
            await import(
              "../models/User.js"
            )
          ).default;

        const user =
          await User.findOne({

            aadhaar:
              complaint.aadhaar,
          });

        if (user) {

          if (
            !Array.isArray(
              user.complaints
            )
          ) {

            user.complaints = [];
          }

          const existingComplaint =
            user.complaints.find(

              (c) =>

                c.complaintId ===
                complaint.complaintId
            );

          if (
            existingComplaint
          ) {

            existingComplaint.status =
              complaint.status;

            existingComplaint.assignedOfficer =
              officer.fullName;

            existingComplaint.updatedAt =
              new Date();

          } else {

            user.complaints.push({

              complaintId:
                complaint.complaintId,

              status:
                complaint.status,

              priority:
                complaint.priority,

              assignedOfficer:
                officer.fullName,

              updatedAt:
                new Date(),
            });
          }

          await user.save();
        }

      } catch (userErr) {

        console.log(
          "User Update Error:",
          userErr
        );
      }

      /* ===============================
         SOCKET UPDATE
      =============================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(
          "complaintUpdated",
          complaint
        );
      }

      /* ===============================
         RESPONSE
      =============================== */

      res.json({

        success: true,

        message:
          "Officer assigned successfully",

        complaint,
      });

    } catch (err) {

      console.error(
        "Assign Officer Error:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* =========================================================
   🔄 SYSTEM MANAGER UPDATE COMPLAINT
========================================================= */

router.put(
  "/system/update/:id",

  auth,

  async (req, res) => {

    try {

      const {
        status,
        priority,
        adminMessage,
      } = req.body;

      /* ===============================
         ONLY SYSTEM MANAGER
      =============================== */

      if (
        req.user.role !==
        "system_manager"
      ) {

        return res.status(403).json({

          success: false,

          message:
            "Unauthorized",
        });
      }

      /* ===============================
         FIND COMPLAINT
      =============================== */

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

      /* ===============================
         UPDATE DATA
      =============================== */

      if (status) {

        complaint.status =
          status;
      }

      if (priority) {

        complaint.priority =
          priority;
      }

      if (adminMessage) {

        complaint.adminMessage =
          adminMessage;
      }

      complaint.updatedAt =
        new Date();

      /* ===============================
         RESOLVED TIME
      =============================== */

      if (
        status ===
        "Resolved"
      ) {

        complaint.resolvedAt =
          new Date();
      }

      /* ===============================
         HISTORY
      =============================== */

      if (
        !Array.isArray(
          complaint.history
        )
      ) {

        complaint.history = [];
      }

      complaint.history.push({

        status:
          status ||
          complaint.status,

        message:
          adminMessage ||
          "Complaint Updated",

        updatedBy:
          req.user.name ||
          "System Manager",

        updatedAt:
          new Date(),
      });

      /* ===============================
         SAVE COMPLAINT
      =============================== */

      await complaint.save();

      /* =====================================================
         UPDATE USER PROFILE COMPLAINT HISTORY
      ===================================================== */

      try {

        const User =
          (
            await import(
              "../models/User.js"
            )
          ).default;

        const user =
          await User.findOne({

            aadhaar:
              complaint.aadhaar,
          });

        if (user) {

          /* ===============================
             CREATE ARRAY IF NOT EXISTS
          =============================== */

          if (
            !Array.isArray(
              user.complaints
            )
          ) {

            user.complaints = [];
          }

          /* ===============================
             FIND EXISTING
          =============================== */

          const existingComplaint =
            user.complaints.find(

              (c) =>

                c.complaintId ===
                complaint.complaintId
            );

          /* ===============================
             UPDATE EXISTING
          =============================== */

          if (
            existingComplaint
          ) {

            existingComplaint.status =
              complaint.status;

            existingComplaint.priority =
              complaint.priority;

            existingComplaint.adminMessage =
              complaint.adminMessage;

            existingComplaint.updatedAt =
              new Date();

          } else {

            /* ===============================
               ADD NEW
            =============================== */

            user.complaints.push({

              complaintId:
                complaint.complaintId,

              status:
                complaint.status,

              priority:
                complaint.priority,

              adminMessage:
                complaint.adminMessage,

              updatedAt:
                new Date(),
            });
          }

          /* ===============================
             SAVE USER
          =============================== */

          await user.save();

          console.log(
            "✅ User profile updated"
          );
        }

      } catch (userErr) {

        console.log(
          "User Update Error:",
          userErr
        );
      }

      /* ===============================
         SOCKET UPDATE
      =============================== */

      const io =
        req.app.get("io");

      if (io) {

        io.emit(
          "complaintUpdated",
          complaint
        );
      }

      /* ===============================
         RESPONSE
      =============================== */

      res.json({

        success: true,

        message:
          "Complaint updated successfully",

        complaint,
      });

    } catch (err) {

      console.error(
        "System Update Error:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

/* =========================================================
   👮 GET ALL OFFICERS
========================================================= */

router.get(
  "/officers/all",

  async (req, res) => {

    try {

      const Officer =
        (
          await import(
            "../models/Officer.js"
          )
        ).default;

      const officers =
        await Officer.find()

          .sort({
            createdAt: -1,
          });

      res.json({

        success: true,

        total:
          officers.length,

        officers,
      });

    } catch (err) {

      console.error(
        "Officer Fetch Error:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          "Server Error",
      });
    }
  }
);

export default router;









import express from "express";
import multer from "multer";
import twilio from "twilio";
import path from "path";
import fs from "fs";

import Complaint from "../models/Complaint.js";
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
   👨‍💼 SYSTEM MANAGER
========================================================= */
router.get("/system/all", auth, async (req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 });
  res.json({ success: true, complaints });
});

/* =========================================================
   👨‍💼 DEPARTMENT MANAGER (FIXED & CASE INSENSITIVE)
========================================================= */
router.get("/manager/department", auth, async (req, res) => {
  try {
    const userDept = req.user.department?.toLowerCase();

    console.log("Manager Dept:", userDept); // debug

    const complaints = await Complaint.find({
      department: { $regex: `^${userDept}$`, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json({ success: true, complaints });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* =========================================================
   🔄 UPDATE STATUS (WITH REJECTION LOGIC)
========================================================= */
router.put("/manager/update/:id", auth, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updateData = { status };

    // ✅ If rejected → store reason
    if (status === "Rejected") {
      updateData.rejectionReason =
        rejectionReason || "Image does not match complaint";
    } else {
      updateData.rejectionReason = "";
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, complaint });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

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

export default router;
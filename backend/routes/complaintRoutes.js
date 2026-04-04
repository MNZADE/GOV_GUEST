import express from "express";
import multer from "multer";
import twilio from "twilio";

import Complaint from "../models/Complaint.js";
import createNotification from "../utils/createNotification.js";
import auth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= TWILIO ================= */
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* ================= MULTER ================= */
const upload = multer({ storage: multer.memoryStorage() });

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
   👤 CITIZEN: SUBMIT COMPLAINT
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

      const complaintId =
        "CMP" + Math.floor(100000 + Math.random() * 900000);

      const imageFiles =
        req.files?.map((file) => file.originalname) || [];

      const { date, time, dateTime } = formatDateTime();

      let departmentList = [];
      let subcategoryList = [];

      try {
        departmentList = JSON.parse(departments || "[]");
        subcategoryList = JSON.parse(subcategories || "[]");
      } catch {}

      const newComplaint = await Complaint.create({
        complaintId,
        name,
        aadhaar: String(aadhaar), // ✅ FIXED
        phone,
        address,
        optionalAddress,
        departments: departmentList,
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

      const receiptLink = `http://localhost:3000/complaint-receipt/${complaintId}`;

      /* ================= SEND MESSAGE ================= */
      try {
        const cleanPhone = phone.replace("+91", "").replace(/\D/g, "");
        const whatsappPhone = `whatsapp:+91${cleanPhone}`;
        const smsPhone = `+91${cleanPhone}`;

        const messageBody = `✅ Complaint Registered!

🆔 ID: ${complaintId}
📅 ${dateTime}

Track here:
${receiptLink}

- Kolhapur Mahanagar Palika`;

        await Promise.all([
          client.messages.create({
            body: messageBody,
            from: "whatsapp:+14155238886",
            to: whatsappPhone,
          }),
          client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: smsPhone,
          }),
        ]);

        console.log("✅ Submit WhatsApp + SMS sent");
      } catch (err) {
        console.log("⚠️ Submit message failed:", err.message);
      }

      const io = req.app.get("io");

      if (io) {
        departmentList.forEach((dept) => {
          io.to(dept).emit("newComplaint", newComplaint);
        });
        io.emit("newComplaintGlobal", newComplaint);
      }

      res.json({
        success: true,
        complaintId,
        dateTime,
        receiptLink,
      });

    } catch (err) {
      console.error("❌ Submit Error:", err);
      res.status(500).json({ success: false });
    }
  }
);

/* =========================================================
   👤 GET COMPLAINTS BY AADHAAR ✅ FIXED
========================================================= */
router.get("/user/:aadhaar", async (req, res) => {
  try {
    const aadhaar = String(req.params.aadhaar);

    console.log("📡 Fetching complaints for Aadhaar:", aadhaar);

    const complaints = await Complaint.find({
      aadhaar: aadhaar,
    }).sort({ createdAt: -1 });

    console.log("📦 Found complaints:", complaints.length);

    res.json({
      success: true,
      complaints,
    });

  } catch (err) {
    console.error("❌ Aadhaar Fetch Error:", err);
    res.status(500).json({ success: false });
  }
});

/* =========================================================
   👤 MY COMPLAINTS (PHONE)
========================================================= */
router.get("/citizen/my-complaints/:phone", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      phone: req.params.phone,
    }).sort({ createdAt: -1 });

    res.json({ success: true, complaints });

  } catch {
    res.status(500).json({ success: false });
  }
});

/* =========================================================
   👨‍💼 MANAGER: CREATE
========================================================= */
router.post("/manager/create", auth, async (req, res) => {
  try {
    const { title, description, department, priority } = req.body;

    const complaint = await Complaint.create({
      title,
      description,
      department,
      priority,
      createdBy: req.user._id,
    });

    const io = req.app.get("io");

    if (io) {
      io.to(department).emit("newComplaint", complaint);
      io.emit("newComplaintGlobal", complaint);
    }

    if (priority === "urgent") {
      await createNotification(io, {
        title: "Urgent Complaint",
        message: `Urgent complaint in ${department}`,
        type: "urgent",
        recipientRole: "system_manager",
      });
    }

    res.status(201).json(complaint);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   SYSTEM MANAGER: ALL
========================================================= */
router.get("/system/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "system_manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.json({ total: complaints.length, complaints });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   UPDATE STATUS
========================================================= */
router.put("/manager/update/:id", auth, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(complaint);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================================================
   DELETE BY AADHAAR + ID ✅ FIXED + DEBUG
========================================================= */
router.delete("/user/:aadhaar/:complaintId", async (req, res) => {
  try {
    const { aadhaar, complaintId } = req.params;

    console.log("🗑 DELETE REQUEST:");
    console.log("Aadhaar:", aadhaar);
    console.log("Complaint ID:", complaintId);

    if (!aadhaar || !complaintId) {
      return res.status(400).json({
        success: false,
        message: "Missing Aadhaar or Complaint ID",
      });
    }

    const removed = await Complaint.findOneAndDelete({
      complaintId: complaintId,
      aadhaar: String(aadhaar),
    });

    if (!removed) {
      console.log("❌ Complaint not found in DB");
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    console.log("✅ Deleted successfully");

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Delete Error FULL:", err); // 🔥 IMPORTANT
    res.status(500).json({ success: false });
  }
});

export default router;
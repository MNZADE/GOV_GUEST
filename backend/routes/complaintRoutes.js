import express from "express";
import multer from "multer";
import Complaint from "../models/Complaint.js";
import axios from "axios";

const router = express.Router();

/* --------------------------------------------------
   MULTER STORAGE
-------------------------------------------------- */
const upload = multer({ storage: multer.memoryStorage() });

/* --------------------------------------------------
   FORMAT DATE + TIME
-------------------------------------------------- */
function formatDateTime() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const date = `${day}/${month}/${year}`;

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const time = `${hours}:${minutes} ${ampm}`;
  const dateTime = `${date} • ${time}`;

  return { date, time, dateTime };
}

/* --------------------------------------------------
   SUBMIT COMPLAINT (WORKING)
-------------------------------------------------- */
router.post("/submit", upload.array("images", 5), async (req, res) => {
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
    } = req.body;

    const complaintId = "CMP" + Math.floor(100000 + Math.random() * 900000);

    const imageFiles = req.files?.map((file) => file.originalname) || [];

    const { date, time, dateTime } = formatDateTime();

    const departmentList = departments ? JSON.parse(departments) : [];
    const subcategoryList = subcategories ? JSON.parse(subcategories) : [];

    const smsDepartment = departmentList[0] || "General";

    const newComplaint = new Complaint({
      complaintId,
      name,
      aadhaar,
      phone,
      address,
      optionalAddress,
      departments: departmentList,
      subcategories: subcategoryList,
      issue,
      description,
      images: imageFiles,
      status: "Pending",
      date,
      time,
      dateTime,
      createdAt: new Date(),
    });

    await newComplaint.save();

    // MSG91 SMS
    const payload = {
      flow_id: process.env.MSG91_FLOW_ID,
      sender: process.env.MSG91_SENDER_ID,
      mobiles: phone,
      complaint_id: complaintId,
      user_name: name,
      category: smsDepartment,
    };

    try {
      await axios.post("https://control.msg91.com/api/v5/flow/", payload, {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
      });
      console.log("📩 MSG91 SMS sent");
    } catch (err) {
      console.log("❌ MSG91 Error:", err.response?.data || err.message);
    }

    res.json({ success: true, complaintId, dateTime });
  } catch (err) {
    console.log("❌ SUBMIT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* --------------------------------------------------
   GET ALL COMPLAINTS BY AADHAAR
-------------------------------------------------- */
router.get("/user/:aadhaar", async (req, res) => {
  try {
    const complaints = await Complaint.find({
      aadhaar: req.params.aadhaar,
    }).sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (err) {
    console.log("❌ Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

/* --------------------------------------------------
   GET SINGLE COMPLAINT (REQUIRED FOR PDF)
   Route: /api/complaints/user/:aadhaar/:complaintId
-------------------------------------------------- */
router.get("/user/:aadhaar/:complaintId", async (req, res) => {
  try {
    const { aadhaar, complaintId } = req.params;

    const complaint = await Complaint.findOne({
      aadhaar,
      complaintId,
    });

    if (!complaint) {
      return res.json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    console.log("❌ SINGLE COMPLAINT FETCH ERROR:", err);
    res.json({ success: false, message: "Server Error" });
  }
});

/* --------------------------------------------------
   DELETE COMPLAINT (MATCHES FRONTEND)
   Route: /api/complaints/user/:aadhaar/:complaintId
-------------------------------------------------- */
router.delete("/user/:aadhaar/:complaintId", async (req, res) => {
  try {
    const { aadhaar, complaintId } = req.params;

    const removed = await Complaint.findOneAndDelete({
      aadhaar,
      complaintId,
    });

    if (!removed) {
      return res.json({
        success: false,
        message: "Complaint not found",
      });
    }

    console.log("🗑 Deleted:", complaintId);

    res.json({ success: true });
  } catch (err) {
    console.log("❌ DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

export default router;

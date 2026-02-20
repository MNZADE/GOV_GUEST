import express from "express";
import multer from "multer";
import Complaint from "../models/Complaint.js";

const router = express.Router();

/* --------------------------------------------------
   MULTER (IMAGE UPLOAD - MEMORY)
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
   SUBMIT COMPLAINT (FIREBASE AUTH REQUIRED)
-------------------------------------------------- */
router.post("/submit", upload.array("images", 5), async (req, res) => {
  try {
    // 🔐 Firebase user from middleware
    const firebaseUser = req.user;

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

    const newComplaint = new Complaint({
      complaintId,
      firebaseUid: firebaseUser.uid, // 🔐 LINK TO FIREBASE USER
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

    res.json({
      success: true,
      complaintId,
      dateTime,
    });
  } catch (err) {
    console.error("❌ SUBMIT ERROR:", err);
    res.status(500).json({ success: false, message: "Submit failed" });
  }
});

/* --------------------------------------------------
   GET ALL COMPLAINTS (LOGGED-IN USER ONLY)
-------------------------------------------------- */
router.get("/my-complaints", async (req, res) => {
  try {
    const firebaseUid = req.user.uid;

    const complaints = await Complaint.find({
      firebaseUid,
    }).sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* --------------------------------------------------
   GET SINGLE COMPLAINT (LOGGED-IN USER)
-------------------------------------------------- */
router.get("/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const firebaseUid = req.user.uid;

    const complaint = await Complaint.findOne({
      complaintId,
      firebaseUid,
    });

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true, complaint });
  } catch (err) {
    console.error("❌ SINGLE FETCH ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* --------------------------------------------------
   DELETE COMPLAINT (LOGGED-IN USER)
-------------------------------------------------- */
router.delete("/:complaintId", async (req, res) => {
  try {
    const { complaintId } = req.params;
    const firebaseUid = req.user.uid;

    const removed = await Complaint.findOneAndDelete({
      complaintId,
      firebaseUid,
    });

    if (!removed) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ success: false });
  }
});

export default router;

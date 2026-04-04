import express from "express";
import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";
import auth from "../middleware/adminAuth.js";

const router = express.Router();

/* ================= GET ALL DEPARTMENTS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("manager", "name email");

    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const complaints = await Complaint.find({
          department: dept._id,
        });

        const solved = complaints.filter(
          (c) => c.status === "Resolved"
        ).length;

        const pending = complaints.filter(
          (c) => c.status !== "Resolved"
        ).length;

        return {
          ...dept._doc,
          solved,
          pending,
        };
      })
    );

    res.json(departmentsWithStats);

  } catch (err) {
    console.error("GET DEPARTMENTS ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET MY DEPARTMENT ================= */
router.get("/my-department", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const department = await Department.findOne({
      manager: userId,
    }).populate("manager", "name email");

    if (!department) {
      return res.status(404).json({
        message: "No department assigned to this manager",
      });
    }

    const complaints = await Complaint.find({
      department: department._id,
    }).sort({ createdAt: -1 });

    const solved = complaints.filter(
      (c) => c.status === "Resolved"
    ).length;

    const pending = complaints.filter(
      (c) => c.status !== "Resolved"
    ).length;

    res.json({
      ...department._doc,
      complaints,
      solved,
      pending,
    });

  } catch (err) {
    console.error("GET MY DEPARTMENT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET SINGLE DEPARTMENT ================= */
router.get("/:id", auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate("manager", "name email");

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    const complaints = await Complaint.find({
      department: req.params.id,
    }).sort({ createdAt: -1 });

    const solved = complaints.filter(
      (c) => c.status === "Resolved"
    ).length;

    const pending = complaints.filter(
      (c) => c.status !== "Resolved"
    ).length;

    res.json({
      ...department._doc,
      complaints,
      solved,
      pending,
    });

  } catch (err) {
    console.error("GET SINGLE DEPARTMENT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ✅ THIS IS THE KEY FIX
export default router;
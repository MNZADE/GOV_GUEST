import express from "express";
import bcrypt from "bcryptjs";
import auth from "../middleware/adminAuth.js";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";

export default (io) => {
  const router = express.Router();

  /* ================= GET ALL MANAGERS ================= */
  router.get("/", auth, async (req, res) => {
    try {
      if (req.user.role !== "system_manager") {
        return res.status(403).json({ message: "Access denied" });
      }

      const managers = await User.find({
        role: "department_manager",
      }).sort({ createdAt: -1 });

      res.json(managers);

    } catch (err) {
      console.error("GET MANAGERS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  /* ================= CREATE MANAGER ================= */
  router.post("/create-manager", auth, async (req, res) => {
    try {
      if (req.user.role !== "system_manager") {
        return res.status(403).json({
          success: false,
          message: "Only System Manager allowed",
        });
      }

      const {
        name,
        email,
        password,
        department,
        address,
        designation,
        personalEmail,
        mobile,
      } = req.body;

      // ✅ VALIDATION
      if (!name || !email || !password || !department) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
        });
      }

      // ✅ CHECK EMAIL
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      // ✅ GENERATE ENROLLMENT ID
      const count = await User.countDocuments({
        role: "department_manager",
      });

      const enrollmentId = `KMC-DM-${new Date().getFullYear()}-${String(
        count + 1
      ).padStart(4, "0")}`;

      // 🔐 HASH PASSWORD
      const hashedPassword = await bcrypt.hash(password, 12);

      // ✅ CREATE MANAGER
      const manager = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "department_manager",
        department,
        designation: designation || "Department Manager",
        address,
        personalEmail,
        mobile,
        enrollmentId,
        isActive: true,
        isOnline: false,
        loginHistory: [],
      });

      // 🔔 CREATE NOTIFICATION
      await createNotification(io, {
        title: "New Department Manager Added",
        message: `${name} added as Department Manager.`,
        type: "normal",
        recipientRole: "system_manager",
      });

      // 🔥 REAL-TIME UPDATE
      io.emit("managerStatusUpdate");

      res.status(201).json({
        success: true,
        message: "Manager created successfully",
        manager,
      });

    } catch (err) {
      console.error("CREATE MANAGER ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message || "Server error",
      });
    }
  });

  /* ================= TOGGLE ACCESS ================= */
  router.put("/toggle/:id", auth, async (req, res) => {
    try {
      if (req.user.role !== "system_manager") {
        return res.status(403).json({ message: "Access denied" });
      }

      const manager = await User.findById(req.params.id);

      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      manager.isActive = !manager.isActive;
      await manager.save();

      // 🔥 REAL-TIME UPDATE
      io.emit("managerStatusUpdate");

      res.json({
        message: "Access updated successfully",
        isActive: manager.isActive,
      });

    } catch (err) {
      console.error("TOGGLE ACCESS ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  /* ================= DELETE MANAGER ================= */
  router.delete("/:id", auth, async (req, res) => {
    try {
      if (req.user.role !== "system_manager") {
        return res.status(403).json({ message: "Access denied" });
      }

      const manager = await User.findById(req.params.id);

      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }

      if (manager.role !== "department_manager") {
        return res.status(403).json({ message: "Not allowed" });
      }

      await manager.deleteOne();

      // 🔥 REAL-TIME UPDATE
      io.emit("managerStatusUpdate");

      res.json({
        success: true,
        message: "Manager deleted successfully",
      });

    } catch (err) {
      console.error("DELETE MANAGER ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
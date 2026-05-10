import express from "express";
import bcrypt from "bcryptjs";
import auth from "../middleware/adminAuth.js";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";

export default (io) => {
  const router = express.Router();

  /* ================= GET ALL MANAGERS (ADMIN) ================= */
  router.get("/", auth, async (req, res) => {
    try {
      if (req.user.role !== "system_manager") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const managers = await User.find({
        role: "department_manager",
      })
        .select("-password")
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        managers,
      });
    } catch (err) {
      console.error("❌ GET ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });

  /* ================= GET MANAGERS FOR DROPDOWN (FRONTEND) ================= */
  router.get("/list", async (req, res) => {
    try {
      const managers = await User.find({
        role: "department_manager",
        isActive: true,
      }).select("_id name department");

      res.json({
        success: true,
        managers,
      });
    } catch (err) {
      console.error("❌ LIST ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
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
        role,
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const exists = await User.findOne({ email: normalizedEmail });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const year = new Date().getFullYear();

      let manager;
      let created = false;

      while (!created) {
        try {
          const random = Math.floor(1000 + Math.random() * 9000);
          const enrollmentId = `KMC-DM-${year}-${random}`;

          manager = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role:
              role === "system_manager"
                ? "system_manager"
                : "department_manager",
            department:
              role === "system_manager" ? null : department,
            designation: designation || "Department Manager",
            address,
            personalEmail,
            mobile,
            enrollmentId,
            isActive: true,
            isOnline: false,
            loginHistory: [],
          });

          created = true;
        } catch (err) {
          if (err.code === 11000) {
            console.log("⚠️ Duplicate ID retry...");
          } else {
            throw err;
          }
        }
      }

      await createNotification(io, {
        title: "New Manager Added",
        message: `${name} added successfully.`,
        type: "normal",
        recipientRole: "system_manager",
      });

      io.emit("managerStatusUpdate");

      res.status(201).json({
        success: true,
        message: "Manager created successfully",
        manager,
      });
    } catch (err) {
      console.error("❌ CREATE ERROR:", err);
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
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const manager = await User.findById(req.params.id);

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      if (manager._id.toString() === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "You cannot disable yourself",
        });
      }

      manager.isActive = !manager.isActive;
      await manager.save();

      io.emit("managerStatusUpdate");

      res.json({
        success: true,
        message: manager.isActive ? "Enabled" : "Disabled",
        isActive: manager.isActive,
      });
    } catch (err) {
      console.error("❌ TOGGLE ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });

  /* ================= DELETE MANAGER ================= */
  router.delete("/:id", auth, async (req, res) => {
    try {
      if (req.user.role !== "system_manager") {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      const manager = await User.findById(req.params.id);

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Manager not found",
        });
      }

      if (manager.role === "system_manager") {
        return res.status(403).json({
          success: false,
          message: "Cannot delete System Manager",
        });
      }

      if (manager._id.toString() === req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete yourself",
        });
      }

      await User.deleteOne({ _id: req.params.id });

      io.emit("managerStatusUpdate");

      res.json({
        success: true,
        message: "Manager deleted successfully",
      });
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });

  return router;
};